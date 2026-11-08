use crate::state::FileNode;
use crate::utils::base64::{decode_base64, encode_base64};
use std::fs;
use std::path::Path;

#[tauri::command]
pub fn read_dir_tree(path: String) -> Result<Vec<FileNode>, String> {
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

        if name == ".git" || name == "node_modules" || name == "target" || name == ".DS_Store" || name == "Thumbs.db" {
            continue;
        }

        let is_dir = path.is_dir();
        let extension = if is_dir {
            None
        } else {
            path.extension().and_then(|s| s.to_str()).map(|s| s.to_lowercase())
        };

        let node = FileNode {
            name,
            path: path.to_string_lossy().to_string(),
            is_dir,
            extension,
            children: if is_dir {
                Some(scan_directory(&path)?)
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

    dirs_list.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    files_list.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    entries.extend(dirs_list);
    entries.extend(files_list);

    Ok(entries)
}

#[tauri::command]
pub fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Erro ao ler arquivo: {}", e))
}

#[tauri::command]
pub fn read_file_base64(path: String) -> Result<String, String> {
    let bytes = fs::read(&path).map_err(|e| format!("Erro ao ler arquivo: {}", e))?;
    let ext = Path::new(&path)
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();
    let mime = match ext.as_str() {
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        "ico" => "image/x-icon",
        _ => "application/octet-stream",
    };
    let b64 = encode_base64(&bytes);
    Ok(format!("data:{};base64,{}", mime, b64))
}

#[tauri::command]
pub fn write_text_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }
    fs::write(path, content).map_err(|e| format!("Erro ao salvar arquivo: {}", e))
}

#[tauri::command]
pub fn create_entry(path: String, is_dir: bool) -> Result<(), String> {
    let p = Path::new(&path);
    if p.exists() {
        return Err("Arquivo ou pasta já existe".to_string());
    }
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
pub fn rename_entry(old_path: String, new_path: String) -> Result<(), String> {
    fs::rename(old_path, new_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_entry(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| e.to_string())
    } else {
        fs::remove_file(p).map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub fn save_image_asset(base_dir: String, filename: String, base64_data: String) -> Result<String, String> {
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
