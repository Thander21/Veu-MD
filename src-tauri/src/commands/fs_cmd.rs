use crate::state::FileNode;
use crate::utils::base64::{decode_base64, encode_base64};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct SearchMatch {
    pub file_path: String,
    pub relative_path: String,
    pub file_name: String,
    pub line_number: usize,
    pub line_text: String,
    pub match_start: usize,
    pub match_end: usize,
}

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

    dirs_list.sort_by_key(|a| a.name.to_lowercase());
    files_list.sort_by_key(|a| a.name.to_lowercase());

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

pub fn validate_safe_deletion_path(path: &str) -> Result<std::path::PathBuf, String> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err("Caminho não pode ser vazio".to_string());
    }

    let p = Path::new(trimmed);
    if !p.exists() {
        return Err("Caminho não existe".to_string());
    }

    let canonical = p.canonicalize().map_err(|e| format!("Caminho inválido: {}", e))?;
    let components: Vec<_> = canonical.components().collect();

    if components.len() <= 1 {
        return Err("Não é permitido excluir a raiz do sistema de arquivos".to_string());
    }

    #[cfg(windows)]
    if components.len() <= 2 {
        return Err("Não é permitido excluir a raiz de uma unidade de disco".to_string());
    }

    #[cfg(windows)]
    {
        let lower = canonical.to_string_lossy().to_lowercase();
        if lower.ends_with(":\\windows") || lower.contains(":\\windows\\") || lower.ends_with(":\\windows\\system32") {
            return Err("Não é permitido excluir diretórios de sistema do Windows".to_string());
        }
    }

    Ok(canonical)
}

#[tauri::command]
pub fn delete_entry(path: String) -> Result<(), String> {
    let canonical = validate_safe_deletion_path(&path)?;
    if canonical.is_dir() {
        fs::remove_dir_all(&canonical).map_err(|e| e.to_string())
    } else {
        fs::remove_file(&canonical).map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub fn save_image_asset(base_dir: String, filename: String, base64_data: String) -> Result<String, String> {
    let assets_dir = Path::new(&base_dir).join("assets");
    if !assets_dir.exists() {
        fs::create_dir_all(&assets_dir).map_err(|e| e.to_string())?;
    }

    let file_os_str = Path::new(&filename)
        .file_name()
        .ok_or_else(|| "Nome de arquivo inválido".to_string())?;
    let safe_filename = file_os_str.to_string_lossy().to_string();
    if safe_filename.is_empty() || safe_filename == "." || safe_filename == ".." {
        return Err("Nome de arquivo inseguro ou inválido".to_string());
    }

    let target_path = assets_dir.join(&safe_filename);
    let comma_idx = base64_data.find(',').map(|i| i + 1).unwrap_or(0);
    let raw_payload = &base64_data[comma_idx..];

    let bytes = decode_base64(raw_payload)?;
    fs::write(&target_path, bytes).map_err(|e| format!("Erro ao salvar imagem binária: {}", e))?;

    Ok(format!("./assets/{}", safe_filename))
}

#[tauri::command]
pub fn search_in_files(
    folder_path: String,
    query: String,
    match_case: Option<bool>,
    match_whole_word: Option<bool>,
    max_results: Option<usize>,
) -> Result<Vec<SearchMatch>, String> {
    let trimmed_query = query.trim();
    if trimmed_query.is_empty() {
        return Ok(Vec::new());
    }

    let root = Path::new(&folder_path);
    if !root.exists() {
        return Err(format!("Diretório não encontrado: {}", folder_path));
    }

    let is_case_sensitive = match_case.unwrap_or(false);
    let is_whole_word = match_whole_word.unwrap_or(false);
    let limit = max_results.unwrap_or(500);

    let mut results = Vec::new();
    let mut files_to_scan = Vec::new();
    collect_search_files(root, root, &mut files_to_scan)?;

    for (file_path, relative_path, file_name) in files_to_scan {
        if results.len() >= limit {
            break;
        }

        let Ok(content) = fs::read_to_string(&file_path) else {
            continue;
        };

        for (line_idx, line) in content.lines().enumerate() {
            if results.len() >= limit {
                break;
            }

            let line_for_search = if is_case_sensitive {
                line.to_string()
            } else {
                line.to_lowercase()
            };

            let query_for_search = if is_case_sensitive {
                trimmed_query.to_string()
            } else {
                trimmed_query.to_lowercase()
            };

            let mut start_pos = 0;
            while let Some(found_idx) = line_for_search[start_pos..].find(&query_for_search) {
                let actual_idx = start_pos + found_idx;
                let match_end = actual_idx + query_for_search.len();

                let is_valid = if is_whole_word {
                    let before_ok = if actual_idx == 0 {
                        true
                    } else {
                        let prev_char = line_for_search[..actual_idx].chars().last().unwrap_or(' ');
                        !prev_char.is_alphanumeric() && prev_char != '_'
                    };

                    let after_ok = if match_end >= line_for_search.len() {
                        true
                    } else {
                        let next_char = line_for_search[match_end..].chars().next().unwrap_or(' ');
                        !next_char.is_alphanumeric() && next_char != '_'
                    };

                    before_ok && after_ok
                } else {
                    true
                };

                if is_valid {
                    let display_line = if line.chars().count() > 400 {
                        line.chars().take(400).collect::<String>()
                    } else {
                        line.to_string()
                    };

                    results.push(SearchMatch {
                        file_path: file_path.to_string_lossy().to_string(),
                        relative_path: relative_path.clone(),
                        file_name: file_name.clone(),
                        line_number: line_idx + 1,
                        line_text: display_line,
                        match_start: actual_idx,
                        match_end,
                    });

                    if results.len() >= limit {
                        break;
                    }
                }

                start_pos = actual_idx + query_for_search.len().max(1);
                if start_pos >= line_for_search.len() {
                    break;
                }
            }
        }
    }

    Ok(results)
}

fn collect_search_files(
    root: &Path,
    current_dir: &Path,
    files: &mut Vec<(PathBuf, String, String)>,
) -> Result<(), String> {
    let Ok(read_dir) = fs::read_dir(current_dir) else {
        return Ok(());
    };

    for entry in read_dir.flatten() {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        if path.is_dir() {
            if name == ".git"
                || name == "node_modules"
                || name == "target"
                || name == "dist"
                || name == ".tauri"
                || name == ".specs"
                || name == ".cache"
                || name == "build"
            {
                continue;
            }
            let _ = collect_search_files(root, &path, files);
        } else {
            let ext = path
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("")
                .to_lowercase();

            let is_searchable = matches!(
                ext.as_str(),
                "md" | "markdown"
                    | "txt"
                    | "json"
                    | "yaml"
                    | "yml"
                    | "toml"
                    | "csv"
                    | "xml"
                    | "css"
                    | "html"
                    | "js"
                    | "ts"
                    | "svelte"
            );

            if is_searchable {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.len() > 5 * 1024 * 1024 {
                        continue;
                    }
                }
                let relative_path = path
                    .strip_prefix(root)
                    .map(|p| p.to_string_lossy().replace('\\', "/"))
                    .unwrap_or_else(|_| name.clone());

                files.push((path, relative_path, name));
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_empty_path_rejected() {
        let res = validate_safe_deletion_path("");
        assert!(res.is_err());
        assert_eq!(res.unwrap_err(), "Caminho não pode ser vazio");
    }

    #[test]
    fn test_whitespace_path_rejected() {
        let res = validate_safe_deletion_path("   ");
        assert!(res.is_err());
        assert_eq!(res.unwrap_err(), "Caminho não pode ser vazio");
    }

    #[test]
    fn test_nonexistent_path_rejected() {
        let res = validate_safe_deletion_path("Z:\\path_that_does_not_exist_xyz123");
        assert!(res.is_err());
        assert_eq!(res.unwrap_err(), "Caminho não existe");
    }

    #[test]
    #[cfg(windows)]
    fn test_root_drive_rejected() {
        let res = validate_safe_deletion_path("C:\\");
        assert!(res.is_err());
        assert!(res.unwrap_err().contains("Não é permitido excluir a raiz"));
    }

    #[test]
    fn test_search_empty_query() {
        let temp = std::env::temp_dir();
        let res = search_in_files(temp.to_string_lossy().to_string(), "   ".to_string(), None, None, None);
        assert!(res.is_ok());
        assert!(res.unwrap().is_empty());
    }
}
