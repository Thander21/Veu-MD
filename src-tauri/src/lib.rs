pub mod commands;
pub mod state;
pub mod utils;

use commands::ai_cmd::*;
use commands::fs_cmd::*;
use commands::pty_cmd::*;
use commands::theme_cmd::*;
use commands::watcher_cmd::*;
use state::AppState;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            read_dir_tree,
            read_text_file,
            read_file_base64,
            write_text_file,
            create_entry,
            rename_entry,
            delete_entry,
            save_image_asset,
            search_in_files,
            spawn_terminal,
            write_terminal,
            resize_terminal,
            kill_terminal,
            watch_file,
            unwatch_file,
            save_custom_theme,
            load_custom_themes,
            run_ai_prompt,
            cancel_ai_prompt,
            check_ai_tools
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao iniciar aplicativo Veu MD");
}
