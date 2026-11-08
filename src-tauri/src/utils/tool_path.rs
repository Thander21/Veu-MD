use std::path::PathBuf;

pub fn resolve_tool_path(tool: &str) -> (PathBuf, Option<PathBuf>) {
    #[cfg(windows)]
    {
        if tool.eq_ignore_ascii_case("agy") {
            if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
                let agy_path = PathBuf::from(&local_app_data).join("agy").join("bin").join("agy.exe");
                if agy_path.exists() {
                    let bin_dir = agy_path.parent().map(|p| p.to_path_buf());
                    return (agy_path, bin_dir);
                }
            }
            if let Ok(user_profile) = std::env::var("USERPROFILE") {
                let agy_path = PathBuf::from(&user_profile)
                    .join("AppData")
                    .join("Local")
                    .join("agy")
                    .join("bin")
                    .join("agy.exe");
                if agy_path.exists() {
                    let bin_dir = agy_path.parent().map(|p| p.to_path_buf());
                    return (agy_path, bin_dir);
                }
            }
        }
        // Verifica %APPDATA%\npm\<tool>.cmd
        if let Ok(app_data) = std::env::var("APPDATA") {
            let npm_cmd = PathBuf::from(&app_data).join("npm").join(format!("{}.cmd", tool));
            if npm_cmd.exists() {
                let bin_dir = npm_cmd.parent().map(|p| p.to_path_buf());
                return (npm_cmd, bin_dir);
            }
        }
    }
    (PathBuf::from(tool), None)
}

pub fn is_tool_installed(tool: &str) -> bool {
    let (resolved, _) = resolve_tool_path(tool);
    if resolved.is_absolute() && resolved.exists() {
        return true;
    }

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        let mut cmd = std::process::Command::new("where.exe");
        cmd.arg(tool);
        cmd.creation_flags(0x08000000);
        if let Ok(output) = cmd.output() {
            if output.status.success() {
                return true;
            }
        }
    }

    #[cfg(not(windows))]
    {
        if let Ok(output) = std::process::Command::new("which").arg(tool).output() {
            if output.status.success() {
                return true;
            }
        }
    }

    false
}
