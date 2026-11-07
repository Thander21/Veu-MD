# Diretório de Design & Identidade Visual — V.E.U. MD

Este diretório concentra todos os ativos conceituais, narrativos, protótipos vetoriais e especificações de prompts para a identidade visual do **V.E.U. MD**.

---

## 1. Arquivos Contidos Neste Diretório

| Arquivo | Descrição |
| :--- | :--- |
| **[`IDENTIDADE_E_LORE.md`](./IDENTIDADE_E_LORE.md)** | Documento mestre com o manifesto da marca, narrativa ("O Descortinar da Palavra"), ciclo dos 3 verbos (Ver, Editar, Usar / View, Edit, Use) e a metáfora do Véu da Sintaxe. |
| **[`PROMPTS_LOGO_E_ICONE.md`](./PROMPTS_LOGO_E_ICONE.md)** | Coleção de prompts calibrados para Midjourney v6, Flux, Ideogram 2.0 e DALL-E 3 (Versões 3D Glassmorphic, 2D Flat Minimalista e Logotipo com tipografia oficial). |
| **[`veu-logo-concept-3d.svg`](./veu-logo-concept-3d.svg)** | Protótipo vetorial Squircle 3D Glassmorphic com as três fitas de seda sobrepostas e iluminação de estúdio na paleta Crepúsculo. |
| **[`veu-logo-concept-flat.svg`](./veu-logo-concept-flat.svg)** | Protótipo vetorial 2D Flat Minimalista geométrico estilo suíço/Linear para testes de legibilidade em tamanhos pequenos (16x16 a 32x32). |

---

## 2. Decisões Consolidadas de Marca

1. **Nome Oficial:** `V.E.U. MD` (com ênfase no acrônimo funcional bilateral: **V**er, **E**ditar, **U**sar em PT / **V**iew, **E**dit, **U**se em EN).
2. **Paleta Oficial — "Crepúsculo Editorial":**
   * **Fundo Obsidian:** `#0e0b16` (aplicado no tema nativo do editor e nas logos)
   * **Púrpura Profundo:** `#7c3aed`
   * **Ametista Luminosa:** `#c084fc`
   * **Magenta Neon Suave:** `#f472b6`
   * **Centelha Lavanda:** `#fdf4ff`
3. **Status de Implementação no Código:**
   * O tema oficial `veu` já está incorporado e ativo como padrão do editor em `src/lib/theme/defaultThemes.ts` e `src/lib/theme/themeStore.ts`.
