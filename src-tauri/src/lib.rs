use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, State};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub extension: Option<String>,
    pub children: Option<Vec<FileNode>>,
}

pub struct TerminalSession {
    writer: Box<dyn Write + Send>,
    master: Box<dyn portable_pty::MasterPty + Send>,
}

#[derive(Default)]
pub struct WatcherState {
    watcher: Option<RecommendedWatcher>,
    current_path: Option<String>,
}

#[derive(Default)]
pub struct AppState {
    terminals: Arc<Mutex<HashMap<String, TerminalSession>>>,
    file_watcher: Arc<Mutex<WatcherState>>,
    ai_processes: Arc<Mutex<HashMap<String, u32>>>,
}

#[tauri::command]
fn read_dir_tree(path: String) -> Result<Vec<FileNode>, String> {
    let root = Path::new(&path);
    if !root.exists() {
        return Err(format!("Caminho não existe: {}", path));
    }
    scan_directory(root)
}

fn scan_directory(dir: &Path) -> Result<Vec<FileNode>, String> {
    let mut entries = Vec::new();
    let read_dir = fs::read_dir(dir).map_err(|e| e.to_string())?;

    let mut dirs_list = Vec::new();
    let mut files_list = Vec::new();

    for entry in read_dir.flatten() {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // Ignora pastas ocultas / pesadas (ex: .git, node_modules)
        if name.starts_with('.') || name == "node_modules" || name == "target" {
            continue;
        }

        let is_dir = path.is_dir();
        let extension = if is_dir {
            None
        } else {
            path.extension().map(|e| e.to_string_lossy().to_lowercase())
        };

        let node = FileNode {
            name,
            path: path.to_string_lossy().to_string(),
            is_dir,
            extension,
            children: if is_dir {
                // Lê um nível adiante (lazy ou raso)
                scan_directory(&path).ok()
            } else {
                None
            },
        };

        if is_dir {
            dirs_list.push(node);
        } else {
            files_list.push(node);
        }
    }

    // Ordena: pastas primeiro, depois arquivos por ordem alfabética
    dirs_list.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    files_list.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    entries.extend(dirs_list);
    entries.extend(files_list);

    Ok(entries)
}

#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Erro ao ler arquivo: {}", e))
}

#[tauri::command]
fn write_text_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }
    fs::write(&path, content).map_err(|e| format!("Erro ao salvar arquivo: {}", e))
}

#[tauri::command]
fn create_entry(path: String, is_dir: bool) -> Result<(), String> {
    let p = Path::new(&path);
    if is_dir {
        fs::create_dir_all(p).map_err(|e| e.to_string())
    } else {
        if let Some(parent) = p.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
        }
        fs::write(p, "").map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn rename_entry(old_path: String, new_path: String) -> Result<(), String> {
    fs::rename(old_path, new_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_entry(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| e.to_string())
    } else {
        fs::remove_file(p).map_err(|e| e.to_string())
    }
}

fn decode_base64(input: &str) -> Result<Vec<u8>, String> {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut decode_table = [255u8; 256];
    for (i, &b) in TABLE.iter().enumerate() {
        decode_table[b as usize] = i as u8;
    }

    let clean: Vec<u8> = input
        .bytes()
        .filter(|&b| b != b'=' && b != b'\r' && b != b'\n' && b != b' ')
        .collect();
    let mut out = Vec::with_capacity((clean.len() * 3) / 4);

    for chunk in clean.chunks(4) {
        let mut buf = [0u8; 4];
        for (i, &b) in chunk.iter().enumerate() {
            let val = decode_table[b as usize];
            if val == 255 {
                return Err("Caractere Base64 inválido".to_string());
            }
            buf[i] = val;
        }

        if chunk.len() >= 2 {
            out.push((buf[0] << 2) | (buf[1] >> 4));
        }
        if chunk.len() >= 3 {
            out.push(((buf[1] & 0x0f) << 4) | (buf[2] >> 2));
        }
        if chunk.len() == 4 {
            out.push(((buf[2] & 0x03) << 6) | buf[3]);
        }
    }

    Ok(out)
}

#[tauri::command]
fn save_image_asset(base_dir: String, filename: String, base64_data: String) -> Result<String, String> {
    let assets_dir = Path::new(&base_dir).join("assets");
    if !assets_dir.exists() {
        fs::create_dir_all(&assets_dir).map_err(|e| e.to_string())?;
    }

    let target_path = assets_dir.join(&filename);
    let comma_idx = base64_data.find(',').map(|i| i + 1).unwrap_or(0);
    let raw_payload = &base64_data[comma_idx..];

    let bytes = decode_base64(raw_payload)?;
    fs::write(&target_path, bytes).map_err(|e| format!("Erro ao salvar imagem binária: {}", e))?;

    Ok(format!("./assets/{}", filename))
}

#[tauri::command]
fn watch_file(app: AppHandle, state: State<'_, AppState>, path: String) -> Result<(), String> {
    let mut watcher_guard = state.file_watcher.lock().map_err(|e| e.to_string())?;
    watcher_guard.watcher = None;
    watcher_guard.current_path = Some(path.clone());

    let target_path = PathBuf::from(&path);
    if !target_path.exists() {
        return Ok(());
    }

    let watched_path = path.clone();
    let app_handle = app.clone();

    let mut watcher = RecommendedWatcher::new(
        move |res: Result<Event, notify::Error>| {
            if let Ok(event) = res {
                match event.kind {
                    EventKind::Modify(_) | EventKind::Create(_) => {
                        let _ = app_handle.emit("file-changed-externally", watched_path.clone());
                    }
                    _ => {}
                }
            }
        },
        Config::default(),
    ).map_err(|e| e.to_string())?;

    watcher
        .watch(&target_path, RecursiveMode::NonRecursive)
        .map_err(|e| e.to_string())?;

    watcher_guard.watcher = Some(watcher);
    Ok(())
}

#[tauri::command]
fn unwatch_file(state: State<'_, AppState>) -> Result<(), String> {
    let mut watcher_guard = state.file_watcher.lock().map_err(|e| e.to_string())?;
    watcher_guard.watcher = None;
    watcher_guard.current_path = None;
    Ok(())
}

// ==================== TERMINAL PTY ====================

#[tauri::command]
fn spawn_terminal(
    app: AppHandle,
    state: State<'_, AppState>,
    term_id: String,
    cwd: Option<String>,
    shell: Option<String>,
) -> Result<(), String> {
    let pty_system = native_pty_system();
    let size = PtySize {
        rows: 24,
        cols: 80,
        pixel_width: 0,
        pixel_height: 0,
    };

    let pair = pty_system.openpty(size).map_err(|e| e.to_string())?;

    let default_shell = if cfg!(windows) {
        "powershell.exe".to_string()
    } else {
        std::env::var("SHELL").unwrap_or_else(|_| "bash".to_string())
    };

    let chosen_shell = shell.unwrap_or(default_shell);
    let mut cmd = CommandBuilder::new(chosen_shell);

    if let Some(dir) = cwd {
        if Path::new(&dir).exists() {
            cmd.cwd(PathBuf::from(dir));
        }
    }

    let mut child = pair.slave.spawn_command(cmd).map_err(|e| e.to_string())?;
    drop(pair.slave);

    let writer = pair.master.take_writer().map_err(|e| e.to_string())?;
    let mut reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;

    let event_id = format!("term-output-{}", term_id);
    let app_handle = app.clone();

    // Thread para leitura do terminal e emissão para o frontend xterm.js
    std::thread::spawn(move || {
        let mut buffer = [0u8; 4096];
        loop {
            match reader.read(&mut buffer) {
                Ok(0) => break, // EOF
                Ok(n) => {
                    let data = String::from_utf8_lossy(&buffer[..n]).to_string();
                    let _ = app_handle.emit(&event_id, data);
                }
                Err(_) => break,
            }
        }
        let _ = child.wait();
    });

    let mut map = state.terminals.lock().map_err(|e| e.to_string())?;
    map.insert(
        term_id,
        TerminalSession {
            writer,
            master: pair.master,
        },
    );

    Ok(())
}

#[tauri::command]
fn write_terminal(
    state: State<'_, AppState>,
    term_id: String,
    data: String,
) -> Result<(), String> {
    let mut map = state.terminals.lock().map_err(|e| e.to_string())?;
    if let Some(session) = map.get_mut(&term_id) {
        session.writer.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
        session.writer.flush().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn resize_terminal(
    state: State<'_, AppState>,
    term_id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    let mut map = state.terminals.lock().map_err(|e| e.to_string())?;
    if let Some(session) = map.get_mut(&term_id) {
        let _ = session.master.resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        });
    }
    Ok(())
}

#[tauri::command]
fn kill_terminal(state: State<'_, AppState>, term_id: String) -> Result<(), String> {
    let mut map = state.terminals.lock().map_err(|e| e.to_string())?;
    map.remove(&term_id);
    Ok(())
}

// ==================== THEMES ====================

fn get_themes_dir() -> PathBuf {
    dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("VeuMD")
        .join("themes")
}

#[tauri::command]
fn save_custom_theme(theme_name: String, theme_json: String) -> Result<(), String> {
    let dir = get_themes_dir();
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join(format!("{}.json", theme_name));
    fs::write(path, theme_json).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_custom_themes() -> Result<HashMap<String, String>, String> {
    let dir = get_themes_dir();
    if !dir.exists() {
        return Ok(HashMap::new());
    }
    let mut themes = HashMap::new();
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) == Some("json") {
                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                    if let Ok(content) = fs::read_to_string(&path) {
                        themes.insert(stem.to_string(), content);
                    }
                }
            }
        }
    }
    Ok(themes)
}

fn resolve_tool_path(tool: &str) -> (PathBuf, Option<PathBuf>) {
    #[cfg(windows)]
    {
        if tool.eq_ignore_ascii_case("agy") {
            if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
                let agy_path = PathBuf::from(local_app_data).join("agy").join("bin").join("agy.exe");
                if agy_path.exists() {
                    let bin_dir = agy_path.parent().map(|p| p.to_path_buf());
                    return (agy_path, bin_dir);
                }
            }
            if let Ok(user_profile) = std::env::var("USERPROFILE") {
                let agy_path = PathBuf::from(user_profile).join("AppData").join("Local").join("agy").join("bin").join("agy.exe");
                if agy_path.exists() {
                    let bin_dir = agy_path.parent().map(|p| p.to_path_buf());
                    return (agy_path, bin_dir);
                }
            }
        }
    }
    (PathBuf::from(tool), None)
}

#[tauri::command]
fn cancel_ai_prompt(state: State<'_, AppState>, req_id: String) -> Result<(), String> {
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
fn run_ai_prompt(
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

    let app_handle = app.clone();
    let stream_event = format!("ai-stream-{}", req_id);
    let done_event = format!("ai-done-{}", req_id);
    let req_id_clone = req_id.clone();
    let ai_procs = Arc::clone(&state.ai_processes);

    std::thread::spawn(move || {
        match cmd.spawn() {
            Ok(mut child) => {
                let pid = child.id();
                if let Ok(mut map) = ai_procs.lock() {
                    map.insert(req_id_clone.clone(), pid);
                }

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
                            // Se a CLI reportar aviso ou erro em stderr, emite para feedback visual
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
            }
            Err(e) => {
                let err_msg = format!("Erro ao executar CLI '{}': {}. Verifique se o executável existe e está configurado.", raw_tool, e);
                let _ = app_handle.emit(&stream_event, err_msg);
                let _ = app_handle.emit(&done_event, -1);
            }
        }
    });

    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            read_dir_tree,
            read_text_file,
            write_text_file,
            create_entry,
            rename_entry,
            delete_entry,
            save_image_asset,
            spawn_terminal,
            write_terminal,
            resize_terminal,
            kill_terminal,
            watch_file,
            unwatch_file,
            save_custom_theme,
            load_custom_themes,
            run_ai_prompt,
            cancel_ai_prompt
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao iniciar aplicativo Veu MD");
}

