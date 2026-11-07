# Veu MD — Guia Rápido de Comandos (Web, Desktop e Android)

Cheat-sheet com os comandos de execução, desenvolvimento, testes e geração de builds para todas as plataformas suportadas.

---

## 🚦 Status Atual das Plataformas

| Plataforma                       | Status                | Observações                                                                          |
| :------------------------------- | :-------------------- | :----------------------------------------------------------------------------------- |
| 🌐 **Web (Vite + Svelte 5)**     | ✅ **100% Funcional** | Editor WYSIWYG, serialização GFM, temas e atalhos no navegador                       |
| 💻 **Desktop (Tauri v2 + Rust)** | ✅ **100% Funcional** | Executável Windows `.exe`/`.msi`, terminal PTY nativo, watcher de disco              |
| 📱 **Mobile (Android / APK)**    | ⏳ **Em Validação**   | Scaffold nativo gerado; ambiente configurado; validação de execução/APK em andamento |

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

_Ou diretamente via cargo (com PATH ajustado):_

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

_Se o Rust já estiver no PATH padrão da sessão:_

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

## 4. Plataforma Mobile (Android) — [EM VALIDAÇÃO]

> **Status:** O scaffold nativo (`src-tauri/gen/android`) e os alvos Rust já foram inicializados. A validação de execução no dispositivo e estabilidade do APK está em andamento.

### 4.1. Configuração de Variáveis de Ambiente (PowerShell Obrigatório)

Para qualquer comando Android no PowerShell, execute primeiro o bloco abaixo para garantir que o Rust, o Java JBR do Android Studio, o SDK e o NDK estejam devidamente mapeados na sessão:

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NDK_HOME = "$env:ANDROID_HOME\ndk\27.0.12077973"
```

> **Dica para verificar versões de NDK instaladas:**
>
> ```powershell
> Get-ChildItem "$env:LOCALAPPDATA\Android\Sdk\ndk" | Select-Object Name
> ```

### 4.2. Instalação dos Targets Rust para Android (Feito uma única vez)

_(Já instalados no ambiente)_:

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

### 4.3. Inicialização do Projeto Android

_(Já executado — cria o scaffold em `src-tauri/gen/android`)_:

```powershell
npx tauri android init
```

### 4.4. Desenvolvimento Android (Emulador ou Dispositivo Físico)

Certifique-se de que um emulador esteja em execução no Android Studio ou um aparelho celular conectado via USB com a **Depuração USB** habilitada (valide com `adb devices`):

```powershell
# Carregar variáveis de ambiente:
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NDK_HOME = "$env:ANDROID_HOME\ndk\27.0.12077973"

# Iniciar em modo dev:
npx tauri android dev
```

_Para direcionar uma arquitetura específica:_

```powershell
npx tauri android dev --target aarch64-linux-android
```

### 4.5. Build de Distribuição Android (APK / AAB)

> **Nota do Tauri v2:** O comando `tauri android build` gera compilações em modo **Release** por padrão. Para gerar versões de desenvolvimento/debug (sem necessidade de assinatura com chave de produção), use a flag `--debug`.

#### Gerar APK Debug (Recomendado para validação e testes rápidos):

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NDK_HOME = "$env:ANDROID_HOME\ndk\27.0.12077973"

npx tauri android build --apk --debug
```

#### Gerar APK Release (Produção otimizada):

```powershell
npx tauri android build --apk
```

#### Gerar Android App Bundle (AAB para Google Play Store):

```powershell
npx tauri android build --aab
```

Os pacotes gerados ficam localizados em:

- **APK Debug:** `src-tauri/gen/android/app/build/outputs/apk/universal/debug/` (ou por arquitetura)
- **APK Release:** `src-tauri/gen/android/app/build/outputs/apk/universal/release/`
- **AAB Release:** `src-tauri/gen/android/app/build/outputs/bundle/release/`

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
