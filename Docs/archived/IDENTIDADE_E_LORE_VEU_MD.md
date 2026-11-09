# V.E.U. MD — Identidade Narrativa, Conceito de Marca e Prompts de Ícone / Logo [ARQUIVADO]

> **Status**: **CONCLUÍDO & ARQUIVADO (2026-11-09)**
> Este documento consolidou as diretrizes fundacionais de marca, lore e conceitos visuais do V.E.U. MD.
> Toda a identidade está integrada no aplicativo: tema padrão oficial (Catppuccin Mocha e Veu Crepúsculo), paletas de cores GPU no `:root`, assets gráficos oficiais (`public/icon.png`, `src-tauri/icons/`) e diretrizes de UX em `AGENTS.md`.

---

> **"O Véu que se abre. O texto que respira."**  
> **"Ver, Editar e Usar — Sem a poluição das tags na tela, com a integridade pura do Markdown no disco."**

---

## 1. Decisões Consolidadas de Marca

| Elemento | Decisão Oficial | Justificativa |
| :--- | :--- | :--- |
| **Nome Oficial** | **V.E.U. MD** (ou `veu.md`) | Enfatiza com clareza a tríade de verbos vitais (**V**er, **E**ditar, **U**sar / **V**iew, **E**dit, **U**se) unida ao padrão Markdown. |
| **Paleta de Cores** | **Crepúsculo Editorial** | Tons de Obsidian profundo (`#0e0b16`), Púrpura Ametista (`#c084fc`), Magenta Neon Suave (`#f472b6`) e Lavanda Luminosa (`#fdf4ff`). |
| **Tema Padrão do Sistema** | `veu` (V.E.U. Crepúsculo) | Implementado nativamente no core do editor em `src/lib/theme/defaultThemes.ts` e ativo como padrão no `themeStore.ts`. |
| **Abordagem de Ícone** | **Híbrida (3D Glassmorphic + 2D Flat)** | Dois caminhos prontos para teste: um sofisticado com profundidade de vidro e outro minimalista geométrico 2D. |

---

## 2. O Ciclo Vital da Palavra (V.E.U.)

```
                 ┌──────────────────────────────────────────────┐
                 │                  V.E.U. MD                   │
                 └──────────────────────┬───────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
      [ V — VER ]                 [ E — EDITAR ]                [ U — USAR ]
       (View)                        (Edit)                       (Use)
• Leitura límpida e nobre   • Modo WYSIWYG puro          • Terminal integrado PTY
• Zero ruído de tags cruas  • Cores semânticas via GPU   • Versionamento Git ágil
• Púrpura Ametista          • Magenta Neon Suave         • Execução e automação
```

---

## 3. Conceitos Visuais e SVGs Prontos no Repositório

Criamos dois protótipos visuais diretamente no projeto para você inspecionar e comparar:

1. **Versão 3D Glassmorphic (Fitas de Seda Translúcida):**  
   📄 [Docs/assets/veu-logo-concept.svg](file:///W:/_Projetos/Veu%20MD/Docs/assets/veu-logo-concept.svg)  
   *Squircle com iluminação de estúdio, três camadas translúcidas com efeito tela/vidro e o brilho da centelha onde o véu se ergue.*

2. **Versão 2D Flat Minimalista (Swiss Vector Style):**  
   📄 [Docs/assets/veu-logo-flat-concept.svg](file:///W:/_Projetos/Veu%20MD/Docs/assets/veu-logo-flat-concept.svg)  
   *Geometria cirúrgica, legibilidade instantânea em 16x16 / 32x32 pixels, ideal para favicon, dock minimalista e menus.*

---

## 4. Prompts Prontos para Geração de Imagens

Copie e cole estes prompts em ferramentas de ponta como **Midjourney v6**, **Ideogram 2.0**, **DALL-E 3** ou **Flux 1.1 Pro**.

---

### Experimento 1: Ícone 3D Glassmorphic (Profundidade, Vidro e Efeito Seda)
> **Recomendado para:** App Icon executável (Windows 11 / macOS / Android).

```text
App icon design for a hyper-modern text editor called "V.E.U. MD", centered inside a rounded squircle with dark obsidian purple background (#0e0b16). The centerpiece is a glowing, elegant monogram of the letter "V" created from three cascading, semi-transparent iridescent silk ribbons overlapping each other, symbolizing View, Edit, and Use. Premium frosted glass refraction, delicate neon edge lighting in electric twilight colors: deep amethyst purple (#7c3aed), luminous orchid violet (#c084fc), and soft glowing neon magenta (#f472b6). Gentle studio lighting, 3D ambient occlusion, clean minimalist silhouette, Apple Human Interface / Windows 11 Fluent design standard, 8k resolution, vector precision --no text, complex clutter, realistic fabric folds
```

---

### Experimento 2: Ícone 2D Flat Minimalista (Geométrico & Suíço)
> **Recomendado para:** Identidade de alta legibilidade, favicon e estilo Linear/Raycast.

```text
Minimalist flat vector app icon for "V.E.U. MD", single iconic glyph inside a dark obsidian rounded squircle. An ultra-clean geometric letter "V" constructed from three precision overlapping diagonal ribbons, forming a stylized folded veil. Dual-tone twilight gradient from electric violet (#7c3aed) through bright amethyst (#c084fc) to soft radiant magenta (#f472b6). High contrast, pristine Swiss typography aesthetic, flat design, perfectly balanced optical weight, legible at 16x16 pixels, SVG vector art quality
```

---

### Experimento 3: Logotipo Completo (Símbolo + Tipografia Oficial "V.E.U. MD")
> **Recomendado para:** Header do README, site oficial, splash screen de abertura.  
> *Dica: O Ideogram 2.0 é excelente para renderizar tipografia com pontos exatos.*

```text
Minimalist tech brand logo and wordmark for "V.E.U. MD". On the left side, an iconic flowing glyph of a letter "V" sculpted as three layered translucent twilight ribbons in amethyst and radiant magenta. On the right side, pristine modern geometric sans-serif typography spelling "V.E.U." in luminous pure white, followed by "MD" in a refined soft neon magenta accent (#f472b6). High-contrast dark obsidian background (#0e0b16), optical balance, Swiss graphic design aesthetic, tech startup branding, vector svg quality, ultra-sharp typography
```

---

## 5. Implementação no Código-Fonte do Veu MD

O tema **V.E.U. Crepúsculo (Padrão)** já está ativo e integrado:
* **Arquivo:** `src/lib/theme/defaultThemes.ts` (posicionado como o primeiro tema da lista com as cores oficiais de títulos, citações, inline code e tabelas).
* **Store Reativa:** `src/lib/theme/themeStore.ts` configurado para carregar o tema oficial por padrão.
* **Verificação de Compilação:** `npm run check` executado com **0 erros e 0 warnings**.
