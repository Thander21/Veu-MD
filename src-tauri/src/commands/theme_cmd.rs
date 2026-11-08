use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

fn get_themes_dir() -> PathBuf {
    dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("VeuMD")
        .join("themes")
}

#[tauri::command]
pub fn save_custom_theme(theme_name: String, theme_json: String) -> Result<(), String> {
    let dir = get_themes_dir();
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join(format!("{}.json", theme_name));
    fs::write(path, theme_json).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_custom_themes() -> Result<HashMap<String, String>, String> {
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
