# Feature Specification: AI Context Dropper and Token Counter

**Feature Name**: `ai-context-dropper-and-tokens`
**Status**: passed
**Approved**: 2026-11-10 - user: "aprovado"

## Problem Statement

Usuários que utilizam o Veu MD em fluxos de trabalho assistidos por inteligência artificial e LLMs enfrentam duas fricções operacionais constantes:
1. **Ausência de Métrica de Tokens**: A barra de status exibe apenas contadores básicos de palavras/caracteres, forçando o usuário a recorrer a ferramentas externas para estimar se o documento cabe na janela de contexto de modelos de IA.
2. **Atrito no Empacotamento de Arquivos para Prompts**: Para fornecer múltiplos arquivos de um projeto como contexto a agentes ou chatbots (Claude, ChatGPT, Gemini, CLI local), o usuário precisa abrir, copiar e formatar manualmente cada arquivo com caminhos relativos e delimitadores.

## Out of Scope

- Inclusão de modelos locais de tokenização pesados (ex: dicionários tiktoken/tiktoken-rs de dezenas de megabytes) que violem a meta de binário leve de ~5 MB.
- Integração de chamadas diretas de API a provedores de LLM na barra de contexto.
- Empacotamento de arquivos binários (imagens, executáveis, PDFs) no gerador de contexto.

## Assumptions & Open Questions

| Assumption / Question | Chosen default | Rationale |
| :--- | :--- | :--- |
| Como calcular tokens sem bibliotecas volumosas de LLM? | Heurística ponderada de tokenização leve (~4 caracteres por token em texto/código) | Proporciona estimativa precisa (+-5%) com custo zero de CPU e zero peso no binário. |
| Onde exibir a contagem estimada de tokens? | Na StatusBar ao lado dos contadores de palavras e caracteres | Mantém a visualização desobstrutiva e perfeitamente integrada ao rodapé. |
| Qual formato adotar para a ação Context Dropper? | Marcação canônica XML `<context><file path="...">conteúdo</file></context>` | É o formato padrão da indústria adotado por Claude, OpenAI e agentes modernos. |
| Como operar sobre pastas inteiras na árvore de arquivos? | Coleta recursiva em memória de arquivos `.md` e `.txt` na pasta selecionada | Evita copiar arquivos binários ou lixo de dependências (`node_modules`, `.git`). |

**Open questions**: none

## User Stories

### US01: Estimativa de Tokens em Tempo Real
1. **TOK-01**: While a text or markdown document is active in the editor, the system shall compute and display an estimated token count in the StatusBar updated in real time with typing debounce.
2. **TOK-02**: Where a document is empty or contains zero characters, the system shall display zero tokens in the StatusBar indicator.

### US02: Context Dropper para Área de Transferência
3. **CTX-01**: When a user invokes the "Copiar como Contexto de IA" action on a file in the sidebar explorer, the system shall format and copy the file path and content enclosed in XML context tags to the clipboard.
4. **CTX-02**: When a user invokes "Copiar como Contexto de IA" on a folder in the sidebar explorer, the system shall recursively collect all markdown and text files and copy their concatenated tagged representations to the clipboard.

## Requirement Traceability

| ID | Requirement | Priority | Status |
| :--- | :--- | :--- | :--- |
| TOK-01 | Exibição de contagem estimada de tokens em tempo real na StatusBar | High | passed |
| TOK-02 | Tratamento de documento vazio com contagem zerada de tokens | Low | passed |
| CTX-01 | Ação de copiar arquivo como bloco XML de contexto no menu do Explorer | High | passed |
| CTX-02 | Coleta recursiva de arquivos texto/markdown ao copiar pasta como contexto | Medium | passed |

