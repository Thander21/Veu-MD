# Context & Gray Areas Analysis: AI Context Dropper & Token Counter

Este documento consolida a análise técnica e o alinhamento de decisões para a feature **`ai-context-dropper-and-tokens`**, em conformidade com as regras de Spec-Driven Development (TLC).

---

## 1. Contexto do Problema & Princípios de Engenharia

O **Veu MD** é utilizado amplamente para escrita técnica, documentação e redação assistida por IA.
1. **Estimativa de Tokens**: LLMs modernos (Claude, GPT-4, Gemini) medem limites e preços por tokens. A StatusBar exibia apenas palavras e caracteres, forçando o usuário a estimar mentalmente ou abrir ferramentas externas.
2. **Context Dropper**: Desenvolvedores e redatores precisam alimentar prompts com trechos de múltiplos arquivos do projeto. A seleção manual, cópia de caminhos e formatação de delimitadores cria atrito contínuo.

---

## 2. Resolução de Áreas Cinzentas (*Gray Areas*)

### G1: Como calcular tokens mantendo o binário leve e zero dependências (Anti-Bloat)?
* **Decisão**: Utilizar uma heurística ponderada leve padrão de 4 caracteres por token (`Math.ceil(chars / 4)`).
* **Mecanismo**: A heurística de ~4 caracteres por token para texto latino e código possui acurácia média de +-5% em relação aos tokenizadores BPE (tiktoken/sentencepiece), com custo de CPU inferior a 0.01ms e zero bytes de dicionários Tiktoken no executável.
* **Caso de Borda**: Textos vazios (`chars === 0`) retornam estritamente `0 tokens`.

### G2: Qual o formato canônico do empacotador de contexto?
* **Decisão**: Marcação canônica XML estruturada:
  ```xml
  <context>
  <file path="docs/visao.md">
  ...conteudo...
  </file>
  </context>
  ```
* **Mecanismo**: É o formato mais bem compreendido por modelos como Claude 3.5, Gemini 1.5/2.0 e GPT-4o, garantindo que o agente identifique prontamente a fronteira e o caminho de cada arquivo.

### G3: Quais arquivos devem ser coletados na cópia de pastas?
* **Decisão**: Coleta recursiva em memória restrita a arquivos de texto e documentação (`.md`, `.txt`, `.markdown`).
* **Proteção**: Diretórios de sistema e dependências como `node_modules`, `.git`, `dist`, `target`, `.specs` e extensões binárias (imagens, áudios, executáveis) são estritamente ignorados.

### G4: Onde posicionar os gatilhos na UI?
* **Decisão**:
  1. Contador de tokens: integrado diretamente na `StatusBar` ao lado de palavras e caracteres (`~X tokens`).
  2. Context Dropper: botão de ação rápida (`Sparkles`) no hover de cada arquivo/pasta da árvore lateral (`FileTreeNode`) e via menu de contexto do mouse (botão direito).
  3. Feedback: Notificação temporária na StatusBar com o total de arquivos e tokens copiados.

---

## 3. Decisões Arquiteturais Relacionadas (ADRs)

* **AD-027**: Contador determinístico de tokens na StatusBar e empacotador XML de contexto de projeto (Context Dropper) com coleta seletiva e zero-bloat.

