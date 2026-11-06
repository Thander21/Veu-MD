# Veu MD — Guia Rápido de Comandos (Web, Desktop e Android)

Cheat-sheet com os comandos de execução, desenvolvimento, testes e geração de builds para todas as plataformas suportadas.

---

## 1. Comandos Gerais e Verificação de Integridade

### Instalação de Dependências
```powershell
npm install
```

### Checagem de Tipos Svelte / TypeScript
```powershell
npm run check
```

### Checagem de Tipos e Compilação Rust
```powershell
npm run check:rust
```
*Ou diretamente via cargo (com PATH ajustado):*
```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo check --manifest-path src-tauri/Cargo.toml
```

---

## 2. Plataforma Web (Vite + Svelte 5)

Permite testar a interface do editor, formatações WYSIWYG, serialização GFM e temas diretamente no navegador.

### Desenvolvimento Web (Live Reload na porta :1420 ou :5173)
```powershell
npm run dev
```

### Build Web de Produção (Gera os arquivos na pasta `dist/`)
```powershell
npm run build
```

### Preview da Build Web Local
```powershell
npm run preview
```

> **Nota:** Recursos de sistema operacional de baixo nível (terminal PTY nativo, acesso irrestrito ao sistema de arquivos sem diálogo e monitoramento de disco via crate `notify`) operam no modo Desktop.

---

## 3. Plataforma Desktop (Tauri v2 + Rust)

Executável nativo com acesso completo ao sistema de arquivos, terminal PTY real contextual e watcher de mudanças externas.

### Desenvolvimento Desktop (Hot Reload Svelte + Recompilação Rust)
```powershell
# No PowerShell (garantindo o PATH do cargo):
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; npm run tauri dev
```

*Se o Rust já estiver no PATH padrão da sessão:*
```powershell
npm run tauri dev
```

### Build de Produção Desktop (.exe / .msi no Windows)
```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; npm run tauri build
```
Os instaladores e binários compilados são gerados em:
`src-tauri/target/release/` e `src-tauri/target/release/bundle/`

### Limpeza e Recompilação Limpa (Clean Build)
```powershell
cd src-tauri
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo clean
cd ..
npm run tauri build
```

---

## 4. Plataforma Mobile (Android)

O Tauri v2 possui suporte oficial a alvos mobile Android.

### 4.1. Pré-requisitos de Ambiente Android
1. **Android Studio** instalado com:
   - Android SDK Platform (API 24+)
   - Android SDK Build-Tools
   - NDK (Side by side)
   - Android SDK Command-line Tools
2. **Java Development Kit (JDK 17 ou 21)**
3. **Targets Rust para Android instalados:**
   ```powershell
   rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
   ```
4. **Variáveis de Ambiente Configuradas (PowerShell):**
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr" # ou caminho do JDK
   $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
   $env:NDK_HOME = "$env:ANDROID_HOME\ndk\<sua-versao-ndk>"
   ```

### 4.2. Inicialização do Projeto Android (Primeira Vez)
Cria o scaffold nativo do Android em `src-tauri/gen/android`:
```powershell
npx tauri android init
```

### 4.3. Desenvolvimento Android (Emulador ou Dispositivo Físico)
Com o emulador aberto ou dispositivo conectado via USB com Depuração USB ativada (`adb devices`):
```powershell
npx tauri android dev
```

*Para especificar um alvo de arquitetura:*
```powershell
npx tauri android dev --target aarch64-linux-android
```

### 4.4. Build de Distribuição Android (APK / AAB)
> **Nota do Tauri v2:** O comando `tauri android build` gera compilações em modo **Release** por padrão. Para gerar versões de desenvolvimento/debug, use a flag `--debug`.

#### Gerar APK (Instalação Direta):
```powershell
# Build Otimizada de Release (Padrão):
npx tauri android build --apk

# Build Debug / Testes rápidos:
npx tauri android build --apk --debug
```

#### Gerar Android App Bundle (AAB para Google Play Store):
```powershell
# Build Otimizada de Release (Padrão):
npx tauri android build --aab
```

Os pacotes gerados ficam localizados em:
`src-tauri/gen/android/app/build/outputs/apk/` e `.../bundle/`

---

## 5. Dicas e Soluções Rápidas no Windows

- **Erro `rc.exe not found`:**
  O projeto possui detecção e injeção automática em `src-tauri/build.rs`. Caso precise forçar manualmente:
  ```powershell
  $env:RC = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\rc.exe"
  ```
- **Erro de porta em uso (`1420` ou `5173`):**
  Encerre instâncias pendentes do Node/Vite no Gerenciador de Tarefas ou altere a porta no `vite.config.ts`.
- **Dispositivo Android não listado no ADB:**
  ```powershell
  adb kill-server
  adb start-server
  adb devices
  ```
