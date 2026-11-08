use notify::RecommendedWatcher;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::Write;
use std::sync::{Arc, Mutex};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub extension: Option<String>,
    pub children: Option<Vec<FileNode>>,
}

pub struct TerminalSession {
    pub writer: Arc<Mutex<Box<dyn Write + Send>>>,
    pub master: Box<dyn portable_pty::MasterPty + Send>,
    pub child: Arc<Mutex<Box<dyn portable_pty::Child + Send + Sync>>>,
}

#[derive(Default)]
pub struct WatcherState {
    pub watcher: Option<RecommendedWatcher>,
    pub current_path: Option<String>,
}

#[derive(Default)]
pub struct AppState {
    pub terminals: Arc<Mutex<HashMap<String, TerminalSession>>>,
    pub file_watcher: Arc<Mutex<WatcherState>>,
    pub ai_processes: Arc<Mutex<HashMap<String, u32>>>,
}
