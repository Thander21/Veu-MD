use crate::state::{AppState, TerminalSession};
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, State};

#[tauri::command]
pub fn spawn_terminal(
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

    let child = pair.slave.spawn_command(cmd).map_err(|e| e.to_string())?;
    drop(pair.slave);

    let child_arc = Arc::new(Mutex::new(child));
    let child_for_thread = Arc::clone(&child_arc);

    let writer = pair.master.take_writer().map_err(|e| e.to_string())?;
    let writer_arc = Arc::new(Mutex::new(writer));

    let mut reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;

    let event_id = format!("term-output-{}", term_id);
    let exit_event_id = format!("term-exit-{}", term_id);
    let app_handle = app.clone();
    let terminals_state = Arc::clone(&state.terminals);
    let term_id_clone = term_id.clone();

    // Thread para leitura contínua do PTY e emissão assíncrona para a interface
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
        let exit_code = if let Ok(mut c) = child_for_thread.lock() {
            c.wait().map(|s| s.exit_code()).unwrap_or(0)
        } else {
            0
        };

        // Remove a sessão encerrada do mapa global de terminais
        if let Ok(mut map) = terminals_state.lock() {
            map.remove(&term_id_clone);
        }

        let _ = app_handle.emit(&exit_event_id, exit_code);
    });

    let mut map = state.terminals.lock().map_err(|e| e.to_string())?;
    map.insert(
        term_id,
        TerminalSession {
            writer: writer_arc,
            master: pair.master,
            child: child_arc,
        },
    );

    Ok(())
}

#[tauri::command]
pub fn write_terminal(
    state: State<'_, AppState>,
    term_id: String,
    data: String,
) -> Result<(), String> {
    let writer_arc = {
        let map = state.terminals.lock().map_err(|e| e.to_string())?;
        map.get(&term_id).map(|s| Arc::clone(&s.writer))
    };

    if let Some(writer_lock) = writer_arc {
        let mut writer = writer_lock.lock().map_err(|e| e.to_string())?;
        writer.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
        writer.flush().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn resize_terminal(
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
pub fn kill_terminal(state: State<'_, AppState>, term_id: String) -> Result<(), String> {
    let mut map = state.terminals.lock().map_err(|e| e.to_string())?;
    if let Some(session) = map.remove(&term_id) {
        if let Ok(mut child) = session.child.lock() {
            let _ = child.kill();
        }
    }
    Ok(())
}
