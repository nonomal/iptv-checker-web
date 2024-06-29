// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn now_mod() -> i32 {
   1
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![now_mod])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
