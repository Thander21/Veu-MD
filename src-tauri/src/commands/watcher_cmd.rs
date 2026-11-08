use crate::state::AppState;
use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::PathBuf;
use tauri::{AppHandle, Emitter, State};

#[tauri::command]
pub fn watch_file(app: AppHandle, state: State<'_, AppState>, path: String) -> Result<(), String> {
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
pub fn unwatch_file(state: State<'_, AppState>) -> Result<(), String> {
    let mut watcher_guard = state.file_watcher.lock().map_err(|e| e.to_string())?;
    watcher_guard.watcher = None;
    watcher_guard.current_path = None;
    Ok(())
}
