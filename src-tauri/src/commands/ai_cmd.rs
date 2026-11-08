use crate::state::AppState;
use crate::utils::tool_path::{is_tool_installed, resolve_tool_path};
use std::collections::HashMap;
use std::io::Read;
use std::path::Path;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, State};

#[tauri::command]
pub fn check_ai_tools(tools: Vec<String>) -> Result<HashMap<String, bool>, String> {
    let mut results = HashMap::new();
    for tool in tools {
        let installed = is_tool_installed(&tool);
        results.insert(tool, installed);
    }
    Ok(results)
}

#[tauri::command]
pub fn cancel_ai_prompt(state: State<'_, AppState>, req_id: String) -> Result<(), String> {
    let mut procs = state.ai_processes.lock().map_err(|e| e.to_string())?;
    if let Some(pid) = procs.remove(&req_id) {
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            let mut kill_cmd = std::process::Command::new("taskkill");
            kill_cmd.args(["/F", "/T", "/PID", &pid.to_string()]);
            kill_cmd.creation_flags(0x08000000);
            let _ = kill_cmd.spawn();
        }
        #[cfg(not(windows))]
        {
            let mut kill_cmd = std::process::Command::new("kill");
            kill_cmd.args(["-9", &pid.to_string()]);
            let _ = kill_cmd.spawn();
        }
    }
    Ok(())
}

#[tauri::command]
pub fn run_ai_prompt(
    app: AppHandle,
    state: State<'_, AppState>,
    req_id: String,
    cwd: Option<String>,
    cli_tool: Option<String>,
    prompt: String,
    continue_session: bool,
) -> Result<(), String> {
    let raw_tool = cli_tool.unwrap_or_else(|| "agy".to_string());
    let (tool_path, extra_path) = resolve_tool_path(&raw_tool);

    let mut cmd = std::process::Command::new(&tool_path);

    if let Some(bin_dir) = extra_path {
        let current_path = std::env::var("PATH").unwrap_or_default();
        let new_path = format!("{};{}", bin_dir.to_string_lossy(), current_path);
        cmd.env("PATH", new_path);
    }

    if let Some(dir) = cwd {
        if Path::new(&dir).exists() {
            cmd.current_dir(dir);
        }
    }

    if raw_tool.eq_ignore_ascii_case("agy") {
        cmd.arg("--dangerously-skip-permissions");
        if continue_session {
            cmd.arg("-c");
        }
        cmd.arg("-p").arg(&prompt);
    } else if raw_tool.eq_ignore_ascii_case("claude") {
        cmd.arg("-p").arg(&prompt);
    } else if raw_tool.eq_ignore_ascii_case("muse") {
        cmd.arg("-p").arg(&prompt);
    } else {
        cmd.arg(&prompt);
    }

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    // Crucial: stdin como null para nunca bloquear aguardando input interativo
    cmd.stdin(std::process::Stdio::null());
    cmd.stdout(std::process::Stdio::piped());
    cmd.stderr(std::process::Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| format!("Falha ao iniciar processo de IA: {}", e))?;
    let pid = child.id();
    if let Ok(mut map) = state.ai_processes.lock() {
        map.insert(req_id.clone(), pid);
    }

    let app_handle = app.clone();
    let stream_event = format!("ai-stream-{}", req_id);
    let done_event = format!("ai-done-{}", req_id);
    let req_id_clone = req_id.clone();
    let ai_procs = Arc::clone(&state.ai_processes);

    std::thread::spawn(move || {
        // Drena stderr concorrentemente em thread separada para prevenir deadlock
        let app_handle_err = app_handle.clone();
        let stream_event_err = stream_event.clone();
        let err_thread = if let Some(stderr) = child.stderr.take() {
            Some(std::thread::spawn(move || {
                let mut reader = std::io::BufReader::new(stderr);
                let mut buffer = [0u8; 1024];
                while let Ok(n) = reader.read(&mut buffer) {
                    if n == 0 {
                        break;
                    }
                    let text = String::from_utf8_lossy(&buffer[..n]).to_string();
                    let _ = app_handle_err.emit(&stream_event_err, text);
                }
            }))
        } else {
            None
        };

        // Drena stdout concorrentemente
        if let Some(stdout) = child.stdout.take() {
            let mut reader = std::io::BufReader::new(stdout);
            let mut buffer = [0u8; 1024];
            while let Ok(n) = reader.read(&mut buffer) {
                if n == 0 {
                    break;
                }
                let text = String::from_utf8_lossy(&buffer[..n]).to_string();
                let _ = app_handle.emit(&stream_event, text);
            }
        }

        if let Some(th) = err_thread {
            let _ = th.join();
        }

        let status = child.wait();
        let exit_code = status.map(|s| s.code().unwrap_or(0)).unwrap_or(-1);

        if let Ok(mut map) = ai_procs.lock() {
            map.remove(&req_id_clone);
        }

        let _ = app_handle.emit(&done_event, exit_code);
    });

    Ok(())
}
