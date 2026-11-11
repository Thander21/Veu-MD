import { fsService } from '../services/fsService';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'builtin' | 'custom';
  defaultFilename: string;
  content: string;
}

export interface TemplateVariables {
  title?: string;
  date?: string;
  time?: string;
  datetime?: string;
  project?: string;
}

export const BUILTIN_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'meeting-minutes',
    name: 'Ata de Reunião',
    description: 'Pauta estruturada, participantes, deliberações e tabela de planos de ação.',
    category: 'builtin',
    defaultFilename: 'Ata_{{date}}.md',
    content: `# Ata de Reunião: {{title}}

**Data:** {{date}} às {{time}}  
**Projeto:** {{project}}  
**Participantes:**  
- [Nome] (Cargo)
- [Nome] (Cargo)

---

## 1. Pauta e Objetivos
1. Alinhamento de escopo
2. Revisão de impedimentos e prazos
3. Próximos passos e entregáveis

---

## 2. Discussões e Deliberações
- **Tópico 1**: Decisão tomada e contexto acordado pela equipe.
- **Tópico 2**: Observações levantadas pelo time técnico.

---

## 3. Plano de Ação
| Ação / Tarefa | Responsável | Prazo |
| :--- | :--- | :--- |
| Implementar fluxo acordado | @responsavel | {{date}} |
| Revisar documentação e testes | @responsavel | {{date}} |
`
  },
  {
    id: 'technical-spec',
    name: 'Especificação Técnica (PRD/Spec)',
    description: 'Estrutura completa com problema, requisitos, arquitetura e critérios de aceite.',
    category: 'builtin',
    defaultFilename: 'Spec_{{title}}.md',
    content: `# Especificação Técnica: {{title}}

**Data:** {{date}}  
**Status:** Rascunho  
**Projeto:** {{project}}

---

## 1. Visão Geral e Problema
Descrição clara da dor que esta funcionalidade ou refatoração soluciona e impacto esperado.

---

## 2. Requisitos e Critérios de Aceite
- [ ] O sistema deve responder em tempo hábil sem travar a interface.
- [ ] Todas as alterações devem persistir de forma atômica no disco.
- [ ] Cobertura de testes unitários e de integração validada.

---

## 3. Arquitetura e Decisões Técnicas
- **Camada de Dados**: Estrutura e modelos persistidos.
- **Interface com Usuário**: Componentes e fluxos interativos.
- **Tratamento de Erros e Casos de Borda**: Resiliência e feedback ao usuário.
`
  },
  {
    id: 'daily-log',
    name: 'Diário de Bordo (Daily Log)',
    description: 'Registro diário de tarefas concluídas, impedimentos e prioridades futuras.',
    category: 'builtin',
    defaultFilename: 'Daily_{{date}}.md',
    content: `# Diário de Bordo: {{date}}

**Projeto:** {{project}}  
**Início:** {{time}}

---

## 🚀 Concluído Hoje
- [x] Tarefa 1 concluída com sucesso
- [x] Correções pontuais e revisão de código

---

## 🚧 Em Andamento e Impedimentos
- [ ] Desafio técnico identificado
- *Anotações*: Detalhes adicionais sobre os desafios encontrados.

---

## 🎯 Prioridades para Amanhã
1. Finalizar entregas planejadas
2. Conduzir revisão e testes com a equipe
`
  },
  {
    id: 'blog-post',
    name: 'Artigo / Postagem',
    description: 'Estrutura editorial com introdução, tópicos temáticos e conclusão.',
    category: 'builtin',
    defaultFilename: 'Post_{{title}}.md',
    content: `# {{title}}

*Publicado em {{date}} por Autor*  
*Categoria: Geral | Projeto: {{project}}*

---

> Breve resumo ou chamada de destaque (lead) do artigo que engaja o leitor.

## Introdução
Contexto sobre o tema abordado e por que ele é relevante para a comunidade ou projeto.

## Desenvolvimento
Aprofundamento técnico e argumentativo com exemplos práticos:

\`\`\`ts
// Exemplo de código demonstrativo
console.log("Exemplo prático");
\`\`\`

## Conclusão
Resumo dos principais pontos aprendidos e reflexão final.
`
  }
];

export function resolveDefaultVariables(customVars?: Partial<TemplateVariables>): TemplateVariables {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const defaultDate = `${year}-${month}-${day}`;
  const defaultTime = `${hours}:${minutes}`;
  const defaultDatetime = `${defaultDate} ${defaultTime}`;

  return {
    title: customVars?.title || 'Novo Documento',
    date: customVars?.date || defaultDate,
    time: customVars?.time || defaultTime,
    datetime: customVars?.datetime || defaultDatetime,
    project: customVars?.project || 'Geral'
  };
}

export function interpolateTemplate(content: string, vars: TemplateVariables): string {
  const resolved = resolveDefaultVariables(vars);
  let result = content;

  result = result.replaceAll('{{title}}', resolved.title || '');
  result = result.replaceAll('{{date}}', resolved.date || '');
  result = result.replaceAll('{{time}}', resolved.time || '');
  result = result.replaceAll('{{datetime}}', resolved.datetime || '');
  result = result.replaceAll('{{project}}', resolved.project || '');

  return result;
}

export function interpolateFilename(filenamePattern: string, vars: TemplateVariables): string {
  const resolved = resolveDefaultVariables(vars);
  let cleanTitle = (resolved.title || 'Novo_Documento')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_');

  let result = filenamePattern;
  result = result.replaceAll('{{title}}', cleanTitle);
  result = result.replaceAll('{{date}}', resolved.date || '');
  result = result.replaceAll('{{time}}', (resolved.time || '').replace(':', '-'));
  result = result.replaceAll('{{project}}', (resolved.project || '').replace(/[\\/:*?"<>|]/g, '_'));

  if (!result.endsWith('.md')) {
    result += '.md';
  }
  return result;
}

export async function loadWorkspaceTemplates(folderPath: string): Promise<DocumentTemplate[]> {
  if (!folderPath) return [];

  const sep = folderPath.includes('/') ? '/' : '\\';
  const templatesDir = `${folderPath.replace(/[\\/]+$/, '')}${sep}.templates`;

  try {
    const nodes = await fsService.readDirTree(templatesDir);
    const customTemplates: DocumentTemplate[] = [];

    for (const node of nodes) {
      if (!node.is_dir && (node.name.endsWith('.md') || node.name.endsWith('.txt'))) {
        try {
          const rawContent = await fsService.readTextFile(node.path);
          const cleanName = node.name.replace(/\.(md|txt)$/, '');
          customTemplates.push({
            id: `custom-${node.name}`,
            name: cleanName.replace(/[-_]/g, ' '),
            description: `Modelo personalizado de .templates/${node.name}`,
            category: 'custom',
            defaultFilename: `${cleanName}_{{date}}.md`,
            content: rawContent
          });
        } catch {
          // Ignora falha de leitura em arquivo individual
        }
      }
    }

    return customTemplates;
  } catch {
    // Diretório .templates/ pode não existir no projeto, comportamento normal
    return [];
  }
}

