# Veu MD — Guia Rápido de Comandos (Web, Desktop e Android)

Cheat-sheet com os comandos de execução, desenvolvimento, testes e geração de builds para todas as plataformas suportadas.

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'W:\\\_Projetos\\Veu MD'; npm run tauri build"

npm run build:desktop:external

---

## 🚦 Status Atual das Plataformas

| Plataforma | Status | Observações |
| --- | --- | --- |
| 🌐 **Web (Vite + Svelte 5)** | ✅ **100% Funcional** | Editor WYSIWYG, serialização GFM, temas e atalhos no navegador |
| 💻 **Desktop (Tauri v2 + Rust)** | ✅ **100% Funcional** | Executável Windows `.exe`/`.msi`, terminal PTY nativo, watcher de disco |
| 📱 **Mobile (Android / APK)** | ⏳ **Em Validação** | Scaffold nativo gerado; ambiente configurado; validação de execução/APK em andamento |

---

## 1. Comandos Gerais e Verificação de Integridade

### Instalação de Dependências

```
npm install
```

### Checagem de Tipos Svelte / TypeScript

```
npm run check
```

### Checagem de Tipos e Compilação Rust

```
npm run check:rust
```

*Ou diretamente via cargo (com PATH ajustado):*

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo check --manifest-path src-tauri/Cargo.toml
```

---

## 2. Plataforma Web (Vite + Svelte 5)

Permite testar a interface do editor, formatações WYSIWYG, serialização GFM e temas diretamente no navegador.

### Desenvolvimento Web (Live Reload na porta :1420 ou :5173)

```
npm run dev
```

### Build Web de Produção (Gera os arquivos na pasta `dist/`)

```
npm run build
```

### Preview da Build Web Local

```
npm run preview
```

> **Nota:** Recursos de sistema operacional de baixo nível (terminal PTY nativo, acesso irrestrito ao sistema de arquivos sem diálogo e monitoramento de disco via crate `notify`) operam no modo Desktop.

---

## 3. Plataforma Desktop (Tauri v2 + Rust)

Executável nativo com acesso completo ao sistema de arquivos, terminal PTY real contextual e watcher de mudanças externas.

### Desenvolvimento Desktop (Hot Reload Svelte + Recompilação Rust)

```
# No PowerShell (garantindo o PATH do cargo):
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; npm run tauri dev
```

*Se o Rust já estiver no PATH padrão da sessão:*

```
npm run tauri dev
```

### Build de Produção Desktop (.exe / .msi no Windows)

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; npm run tauri build
```

#### Build em Janela Externa Separada (Ideal ao usar o Veu MD para desenvolver o próprio Veu MD)

Abre uma janela dedicada e independente do PowerShell com o PATH do Cargo pré-configurado, sem travar a interface do editor e mantendo a janela aberta ao final:

```powershell
npm run build:desktop:external
```

Os instaladores e binários compilados são gerados em: `src-tauri/target/release/` e `src-tauri/target/release/bundle/`

### 3.2. Atualização e Geração de Ícones Multiplataforma (.ico, .png, Android)

Ao alterar a identidade visual ou logotipo do aplicativo (`public/veu-logo.svg` ou `public/veu-logo.png` de alta resolução 512x512 ou superior), regenere todos os pacotes de ícones nativos executando:

```powershell
npx @tauri-apps/cli icon public/veu-logo.png
```

Isso atualiza automaticamente os seguintes arquivos gerados:
- `src-tauri/icons/icon.ico` (Windows)
- `src-tauri/icons/icon.png`, `32x32.png`, `128x128.png`, `128x128@2x.png`
- `src-tauri/icons/Square*.png`
- Ícones de mipmap para Android em `src-tauri/gen/android/`

> [!WARNING]
> **NUNCA use `cargo build --release` diretamente para gerar o executável final!**
> O comando do Cargo puro não embute os assets do frontend (`dist/`), gerando um `.exe` que tenta se conectar a `http://127.0.0.1:1420` e resulta no erro `ERR_CONNECTION_REFUSED`. Para compilar o executável de produção standalone com os assets embutidos, utilize sempre:
> ```powershell
> $env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; npm run tauri build
> ```

### 3.3. Limpeza e Recompilação Limpa (Clean Build)

```
cd src-tauri
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; cargo clean
cd ..
npm run tauri build
```

---

## 4. Plataforma Mobile (Android) — \[EM VALIDAÇÃO\]

> **Status:** O scaffold nativo (`src-tauri/gen/android`) e os alvos Rust já foram inicializados. A validação de execução no dispositivo e estabilidade do APK está em andamento.

### 4.1. Configuração de Variáveis de Ambiente (PowerShell Obrigatório)

Para qualquer comando Android no PowerShell, execute primeiro o bloco abaixo para garantir que o Rust, o Java JBR do Android Studio, o SDK e o NDK estejam devidamente mapeados na sessão:

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NDK_HOME = "$env:ANDROID_HOME\ndk\27.0.12077973"
```

> **Dica para verificar versões de NDK instaladas:**
>
> ```
> Get-ChildItem "$env:LOCALAPPDATA\Android\Sdk\ndk" | Select-Object Name
> ```

### 4.2. Instalação dos Targets Rust para Android (Feito uma única vez)

*(Já instalados no ambiente)*:

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

### 4.3. Inicialização do Projeto Android

*(Já executado — cria o scaffold em `src-tauri/gen/android`)*:

```
npx tauri android init
```

### 4.4. Desenvolvimento Android (Emulador ou Dispositivo Físico)

Certifique-se de que um emulador esteja em execução no Android Studio ou um aparelho celular conectado via USB com a **Depuração USB** habilitada (valide com `adb devices`):

```
# Carregar variáveis de ambiente:
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NDK_HOME = "$env:ANDROID_HOME\ndk\27.0.12077973"

# Iniciar em modo dev:
npx tauri android dev
```

*Para direcionar uma arquitetura específica:*

```
npx tauri android dev --target aarch64-linux-android
```

### 4.5. Build de Distribuição Android (APK / AAB)

> **Nota do Tauri v2:** O comando `tauri android build` gera compilações em modo **Release** por padrão. Para gerar versões de desenvolvimento/debug (sem necessidade de assinatura com chave de produção), use a flag `--debug`.

#### Gerar APK Debug (Recomendado para validação e testes rápidos):

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NDK_HOME = "$env:ANDROID_HOME\ndk\27.0.12077973"

npx tauri android build --apk --debug
```

#### Gerar APK Release (Produção otimizada):

```
npx tauri android build --apk
```

#### Gerar Android App Bundle (AAB para Google Play Store):

```
npx tauri android build --aab
```

Os pacotes gerados ficam localizados em:

* **APK Debug:** `src-tauri/gen/android/app/build/outputs/apk/universal/debug/` (ou por arquitetura)

* **APK Release:** `src-tauri/gen/android/app/build/outputs/apk/universal/release/`

* **AAB Release:** `src-tauri/gen/android/app/build/outputs/bundle/release/`

---

## 5. Dicas e Soluções Rápidas no Windows

* **Erro `rc.exe not found`:** O projeto possui detecção e injeção automática em `src-tauri/build.rs`. Caso precise forçar manualmente:

  ```
  $env:RC = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\rc.exe"
  ```

* **Erro de porta em uso (`1420` ou `5173`):** Encerre instâncias pendentes do Node/Vite no Gerenciador de Tarefas ou altere a porta no `vite.config.ts`.

* **Dispositivo Android não listado no ADB:**

  ```
  adb kill-server
  adb start-server
  adb devices
  ```