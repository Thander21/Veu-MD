import assert from 'node:assert/strict';

console.log('🧪 Iniciando Suíte de Testes Reais: Multi-Projetos, Escopos e Recentes\n');

// Mock do Store / Gerenciador de Projetos
class ProjectManagerTestHarness {
  constructor() {
    this.openProjects = [];
    this.activeProjectId = null;
    this.recentProjects = [];
    this.currentTheme = { id: 'dark', name: 'Dark Theme' };
    this.currentFolderPath = '';
    this.terminalOrientation = 'horizontal';
    this.terminalOpen = false;
    this.terminalMaximized = false;
    this.tabs = [];
    this.activeTabId = null;
    this.storage = new Map();
  }

  saveProjectsToStorage() {
    const sanitized = this.openProjects.map((p) => ({
      id: p.id,
      name: p.name,
      folderPath: p.folderPath,
      theme: p.theme,
      terminalOrientation: p.terminalOrientation,
      terminalOpen: p.terminalOpen,
      terminalMaximized: p.terminalMaximized,
      activeTabId: p.activeTabId,
      tabs: p.tabs.map((t) => ({
        id: t.id,
        title: t.title,
        path: t.path,
        isMarkdown: t.isMarkdown
      })),
      lastOpenedAt: p.lastOpenedAt
    }));
    this.storage.set('veu_open_projects', JSON.stringify(sanitized));
    if (this.activeProjectId) {
      this.storage.set('veu_active_project_id', this.activeProjectId);
    } else {
      this.storage.delete('veu_active_project_id');
    }
  }

  saveRecentProjectsToStorage() {
    this.storage.set('veu_recent_projects', JSON.stringify(this.recentProjects));
  }

  addOrUpdateRecent(folderPath, name) {
    const existingIndex = this.recentProjects.findIndex(
      (r) => r.folderPath.toLowerCase() === folderPath.toLowerCase()
    );
    const item = {
      folderPath,
      name,
      lastOpenedAt: Date.now()
    };
    if (existingIndex >= 0) {
      this.recentProjects.splice(existingIndex, 1);
    }
    this.recentProjects = [item, ...this.recentProjects].slice(0, 15);
    this.saveRecentProjectsToStorage();
  }

  removeRecent(folderPath) {
    this.recentProjects = this.recentProjects.filter(
      (r) => r.folderPath.toLowerCase() !== folderPath.toLowerCase()
    );
    this.saveRecentProjectsToStorage();
  }

  clearRecent() {
    this.recentProjects = [];
    this.storage.delete('veu_recent_projects');
  }

  openProjectByPath(folderPath, initialTheme = null, initialTerminalOrientation = 'horizontal') {
    const normPath = folderPath.replace(/[/\\]+$/, '');
    const existing = this.openProjects.find(
      (p) => p.folderPath.toLowerCase() === normPath.toLowerCase()
    );
    if (existing) {
      this.switchToProject(existing.id);
      return existing;
    }

    const name = normPath.split(/[\\/]/).filter(Boolean).pop() || normPath;

    // Snapshot do projeto anterior
    if (this.activeProjectId) {
      const currentProj = this.openProjects.find((p) => p.id === this.activeProjectId);
      if (currentProj) {
        currentProj.tabs = this.tabs;
        currentProj.activeTabId = this.activeTabId;
        currentProj.terminalOpen = this.terminalOpen;
        currentProj.terminalOrientation = this.terminalOrientation;
        currentProj.terminalMaximized = this.terminalMaximized;
        currentProj.theme = this.currentTheme;
      }
    }

    const newProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      folderPath: normPath,
      theme: initialTheme || this.currentTheme,
      terminalOrientation: initialTerminalOrientation,
      terminalOpen: false,
      terminalMaximized: false,
      activeTabId: null,
      tabs: [],
      lastOpenedAt: Date.now()
    };

    this.openProjects.push(newProject);
    this.addOrUpdateRecent(newProject.folderPath, newProject.name);
    this.switchToProject(newProject.id, false);
    return newProject;
  }

  switchToProject(targetId, saveCurrent = true) {
    if (saveCurrent && this.activeProjectId) {
      const currentProj = this.openProjects.find((p) => p.id === this.activeProjectId);
      if (currentProj) {
        currentProj.tabs = this.tabs;
        currentProj.activeTabId = this.activeTabId;
        currentProj.terminalOpen = this.terminalOpen;
        currentProj.terminalOrientation = this.terminalOrientation;
        currentProj.terminalMaximized = this.terminalMaximized;
        currentProj.theme = this.currentTheme;
      }
    }

    const target = this.openProjects.find((p) => p.id === targetId);
    if (!target) return;

    target.lastOpenedAt = Date.now();
    this.activeProjectId = target.id;
    this.currentFolderPath = target.folderPath;
    this.addOrUpdateRecent(target.folderPath, target.name);

    if (target.theme) {
      this.currentTheme = target.theme;
    }

    this.terminalOrientation = target.terminalOrientation || 'horizontal';
    this.terminalOpen = target.terminalOpen || false;
    this.terminalMaximized = target.terminalMaximized || false;

    // Restaura abas preservando memória de alterações
    if (target.tabs && target.tabs.length > 0) {
      this.tabs = [...target.tabs];
      this.activeTabId = target.activeTabId || this.tabs[0]?.id || null;
    } else {
      this.tabs = [];
      this.activeTabId = null;
    }

    this.saveProjectsToStorage();
  }

  closeProject(projectId) {
    const idx = this.openProjects.findIndex((p) => p.id === projectId);
    if (idx === -1) return;

    const closingActive = projectId === this.activeProjectId;
    this.openProjects = this.openProjects.filter((p) => p.id !== projectId);

    if (closingActive) {
      if (this.openProjects.length > 0) {
        const nextIdx = Math.min(idx, this.openProjects.length - 1);
        this.switchToProject(this.openProjects[nextIdx].id, false);
      } else {
        this.activeProjectId = null;
        this.currentFolderPath = '';
        this.tabs = [{ id: 'tab-welcome', title: 'Boas-vindas.md', content: 'Welcome', isDirty: false }];
        this.activeTabId = 'tab-welcome';
        this.saveProjectsToStorage();
      }
    } else {
      this.saveProjectsToStorage();
    }
  }

  cycleProject(direction) {
    if (this.openProjects.length <= 1) return;
    const currentIndex = this.openProjects.findIndex((p) => p.id === this.activeProjectId);
    if (currentIndex === -1) return;
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % this.openProjects.length
        : (currentIndex - 1 + this.openProjects.length) % this.openProjects.length;
    this.switchToProject(this.openProjects[nextIndex].id);
  }
}

// ================= TESTES =================

function runTests() {
  const harness = new ProjectManagerTestHarness();

  // Teste 1: Abertura do primeiro projeto
  console.log('Test 1: Abrindo Projeto A...');
  const projA = harness.openProjectByPath('W:/Projetos/Projeto-A', { id: 'nord', name: 'Nord' }, 'vertical');
  assert.equal(harness.openProjects.length, 1, 'Deve conter 1 projeto aberto');
  assert.equal(harness.activeProjectId, projA.id, 'Projeto A deve ser o ativo');
  assert.equal(harness.currentTheme.id, 'nord', 'Tema ativo deve ser Nord');
  assert.equal(harness.terminalOrientation, 'vertical', 'Terminal do Projeto A deve ser vertical');
  console.log('  ✓ Projeto A aberto com tema Nord e terminal vertical.');

  // Adiciona abas e edições no Projeto A
  harness.tabs = [
    { id: 'tab-1', title: 'README.md', path: 'W:/Projetos/Projeto-A/README.md', content: '# Draft A', isDirty: true },
    { id: 'tab-2', title: 'notes.md', path: 'W:/Projetos/Projeto-A/notes.md', content: '# Notes', isDirty: false }
  ];
  harness.activeTabId = 'tab-1';
  harness.terminalOpen = true;

  // Teste 2: Abertura do Projeto B com tema e terminal diferentes
  console.log('\nTest 2: Abrindo Projeto B com outro tema e terminal horizontal...');
  const projB = harness.openProjectByPath('W:/Projetos/Projeto-B', { id: 'sepia', name: 'Sepia' }, 'horizontal');
  assert.equal(harness.openProjects.length, 2, 'Deve conter 2 projetos abertos');
  assert.equal(harness.activeProjectId, projB.id, 'Projeto B deve ser o ativo');
  assert.equal(harness.currentTheme.id, 'sepia', 'Tema ativo deve ser Sepia');
  assert.equal(harness.terminalOrientation, 'horizontal', 'Terminal do Projeto B deve ser horizontal');
  assert.equal(harness.terminalOpen, false, 'Terminal do Projeto B começa fechado');
  console.log('  ✓ Projeto B aberto com tema Sepia e terminal horizontal.');

  // Modifica estado no Projeto B
  harness.tabs = [
    { id: 'tab-b1', title: 'index.md', path: 'W:/Projetos/Projeto-B/index.md', content: '# Intro B', isDirty: false }
  ];
  harness.activeTabId = 'tab-b1';

  // Teste 3: Alternância para o Projeto A restaurando memória e integridade
  console.log('\nTest 3: Alternando de volta para Projeto A...');
  harness.switchToProject(projA.id);
  assert.equal(harness.activeProjectId, projA.id, 'Projeto A deve voltar a ser ativo');
  assert.equal(harness.currentTheme.id, 'nord', 'Tema deve voltar a ser Nord');
  assert.equal(harness.terminalOrientation, 'vertical', 'Terminal deve voltar a ser vertical');
  assert.equal(harness.terminalOpen, true, 'Terminal do Projeto A deve estar aberto');
  assert.equal(harness.tabs.length, 2, 'Abas do Projeto A devem ser restauradas');
  assert.equal(harness.tabs[0].content, '# Draft A', 'Conteúdo dirty do Projeto A não deve ter sido perdido');
  assert.equal(harness.tabs[0].isDirty, true, 'Flag dirty do Projeto A deve ser preservada');
  assert.equal(harness.activeTabId, 'tab-1', 'Aba ativa tab-1 deve ser restaurada');
  console.log('  ✓ Projeto A restaurou tema Nord, terminal vertical e abas com conteúdo dirty intacto.');

  // Teste 4: Ciclagem via atalho de teclado (cycleProject)
  console.log('\nTest 4: Testando atalhos de navegação entre projetos (cycleProject)...');
  harness.cycleProject('next');
  assert.equal(harness.activeProjectId, projB.id, 'Next deve ir para Projeto B');
  harness.cycleProject('next');
  assert.equal(harness.activeProjectId, projA.id, 'Next deve dar wrap-around para Projeto A');
  harness.cycleProject('prev');
  assert.equal(harness.activeProjectId, projB.id, 'Prev deve voltar para Projeto B');
  console.log('  ✓ Ciclagem next e prev funcionando com wrap-around perfeito.');

  // Teste 5: Gestão de Projetos Recentes
  console.log('\nTest 5: Validando histórico de Projetos Recentes...');
  assert.equal(harness.recentProjects.length, 2, 'Deve haver 2 projetos recentes');
  assert.equal(harness.recentProjects[0].name, 'Projeto-B', 'O mais recente deve ser Projeto B');
  assert.equal(harness.recentProjects[1].name, 'Projeto-A', 'O segundo mais recente deve ser Projeto A');

  // Adiciona vários projetos para testar o limite de 15 itens
  for (let i = 1; i <= 20; i++) {
    harness.addOrUpdateRecent(`W:/Projetos/Extra-${i}`, `Extra-${i}`);
  }
  assert.equal(harness.recentProjects.length, 15, 'Histórico de recentes deve ser limitado a 15 itens');
  assert.equal(harness.recentProjects[0].name, 'Extra-20', 'O último adicionado deve estar no topo');

  // Remoção de um item específico dos recentes
  harness.removeRecent('W:/Projetos/Extra-20');
  assert.equal(harness.recentProjects.some((r) => r.name === 'Extra-20'), false, 'Extra-20 deve ter sido removido');

  // Limpeza total de recentes
  harness.clearRecent();
  assert.equal(harness.recentProjects.length, 0, 'Histórico deve estar vazio após clearRecent');
  assert.equal(harness.storage.has('veu_recent_projects'), false, 'LocalStorage deve ter limpo veu_recent_projects');
  console.log('  ✓ Histórico de recentes validado: inserção, ordenação, limite de 15 e limpeza.');

  // Teste 6: Fechamento de abas de projeto
  console.log('\nTest 6: Testando fechamento de projetos...');
  // Atualmente projB está ativo. Ao fechar projB, deve chavear para projA
  harness.closeProject(projB.id);
  assert.equal(harness.openProjects.length, 1, 'Deve restar 1 projeto');
  assert.equal(harness.activeProjectId, projA.id, 'Projeto A deve se tornar o ativo automaticamente');

  // Ao fechar o último projeto restante (projA), volta para tela de boas-vindas
  harness.closeProject(projA.id);
  assert.equal(harness.openProjects.length, 0, 'Nenhum projeto deve restar aberto');
  assert.equal(harness.activeProjectId, null, 'Nenhum projeto ativo');
  assert.equal(harness.currentFolderPath, '', 'Pasta atual limpa');
  assert.equal(harness.tabs[0].id, 'tab-welcome', 'Aba de boas-vindas restaurada');
  console.log('  ✓ Fechamento de projetos testado com sucesso.');

  console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!\n');
}

runTests();
