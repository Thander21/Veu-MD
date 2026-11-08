import { writable, get } from 'svelte/store';
import type { ProjectWorkspace, RecentProject, TabItem, ThemeConfig } from '../types';

export const openProjects = writable<ProjectWorkspace[]>([]);
export const activeProjectId = writable<string | null>(null);
export const recentProjects = writable<RecentProject[]>([]);

export function loadProjectsFromStorage(): {
  projects: ProjectWorkspace[];
  activeId: string | null;
} {
  try {
    const raw = localStorage.getItem('veu_open_projects');
    const storedActive = localStorage.getItem('veu_active_project_id');
    if (raw) {
      const parsed: ProjectWorkspace[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        openProjects.set(parsed);
        const resolvedActiveId = storedActive && parsed.some((p) => p.id === storedActive)
          ? storedActive
          : parsed[0].id;
        activeProjectId.set(resolvedActiveId);
        return { projects: parsed, activeId: resolvedActiveId };
      }
    }
  } catch (err) {
    console.error('Erro ao ler projetos do localStorage:', err);
  }
  openProjects.set([]);
  activeProjectId.set(null);
  return { projects: [], activeId: null };
}

export function saveProjectsToStorage(projects?: ProjectWorkspace[], activeId?: string | null): void {
  try {
    if (projects) {
      openProjects.set(projects);
    }
    if (activeId !== undefined) {
      activeProjectId.set(activeId);
    }
    const currentProjects = projects ?? get(openProjects);
    const currentActiveId = activeId !== undefined ? activeId : get(activeProjectId);
    const sanitized = currentProjects.map((p) => ({
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
        isMarkdown: t.isMarkdown,
        isImage: t.isImage
      })),
      lastOpenedAt: p.lastOpenedAt
    }));
    localStorage.setItem('veu_open_projects', JSON.stringify(sanitized));
    if (currentActiveId) {
      localStorage.setItem('veu_active_project_id', currentActiveId);
    } else {
      localStorage.removeItem('veu_active_project_id');
    }
  } catch (err) {
    console.error('Erro ao salvar projetos no localStorage:', err);
  }
}

export function loadRecentProjectsFromStorage(): RecentProject[] {
  try {
    const raw = localStorage.getItem('veu_recent_projects');
    if (raw) {
      const parsed: RecentProject[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        recentProjects.set(parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao ler recentes do localStorage:', err);
  }
  recentProjects.set([]);
  return [];
}

export function saveRecentProjectsToStorage(): void {
  try {
    const recents = get(recentProjects);
    localStorage.setItem('veu_recent_projects', JSON.stringify(recents));
  } catch (err) {
    console.error('Erro ao salvar recentes no localStorage:', err);
  }
}

export function addOrUpdateRecent(folderPath: string, name: string): void {
  const current = get(recentProjects);
  const existingIndex = current.findIndex(
    (r) => r.folderPath.toLowerCase() === folderPath.toLowerCase()
  );
  const item: RecentProject = {
    folderPath,
    name,
    lastOpenedAt: Date.now()
  };

  let updated: RecentProject[];
  if (existingIndex >= 0) {
    updated = [item, ...current.slice(0, existingIndex), ...current.slice(existingIndex + 1)];
  } else {
    updated = [item, ...current].slice(0, 15);
  }
  recentProjects.set(updated);
  saveRecentProjectsToStorage();
}

export function removeRecentProject(folderPath: string): void {
  const current = get(recentProjects);
  const updated = current.filter((r) => r.folderPath.toLowerCase() !== folderPath.toLowerCase());
  recentProjects.set(updated);
  saveRecentProjectsToStorage();
}

export function clearRecentProjects(): void {
  recentProjects.set([]);
  saveRecentProjectsToStorage();
}
