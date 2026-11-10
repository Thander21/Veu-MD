# Context & Gray Areas Analysis: Zero-Server Cloud Sync

Este documento consolida a análise técnica e o alinhamento de decisões arquiteturais para a feature **`zero-server-cloud-sync`**, em conformidade com as regras de Spec-Driven Development (TLC).

---

## 1. Contexto do Problema & Princípios de Engenharia

O **Veu MD** é um editor voltado para privacidade e controle do usuário (*local-first*):
1. **Zero Servidores Proprietários**: Não há infraestrutura central, banco de dados hospedado ou conta mantida pela equipe do Veu MD. O usuário conecta diretamente ao seu próprio provedor compatível com protocolos abertos padrão (WebDAV / Nextcloud / OwnCloud / armazenamento pessoal).
2. **Isolamento de I/O de Rede vs. I/O de Disco**: O salvamento local e a digitação WYSIWYG têm prioridade máxima de tempo real. Operações de rede nunca bloqueiam o salvamento em disco.
3. **Resiliência Offline**: O aplicativo funciona perfeitamente sem conexão com a internet, enfileirando alterações locais e descarregando-as quando a conectividade for restabelecida.

---

## 2. Resolução de Áreas Cinzentas (*Gray Areas*)

### G1: Como executar a sincronização em segundo plano sem travar a UI ou o auto-save?
* **Decisão**: A sincronização opera via fila desacoplada assíncrona (`SyncQueue`) executada em segundo plano.
* **Mecanismo**: Ao salvar um arquivo em disco (`saveTab`), a gravação local é imediata e síncrona com o sistema de arquivos. Uma tarefa de upload é enfileirada no `cloudSyncService`, que processa uploads de forma assíncrona sem reter o ciclo de renderização ou o auto-save.

### G2: Como prevenir perda de dados caso haja alteração remota durante a edição local?
* **Decisão**: Proteção estrita de abas sujas (`isDirty === true`).
* **Mecanismo**: Caso uma versão mais recente seja identificada no armazenamento remoto enquanto o usuário edita a aba localmente, o arquivo local em memória NÃO é sobrescrito. O usuário recebe notificação visual na `StatusBar` alertando sobre a divergência para que possa inspecionar e salvar com segurança.

### G3: Como tratar intermitência e falta de conexão com a internet?
* **Decisão**: Fila persistente com detecção de conectividade (`navigator.onLine` e eventos `online`/`offline`).
* **Mecanismo**: Falhas de rede ou ausência de conexão marcam o status da fila como pausado/offline. O ícone de nuvem na `StatusBar` reflete o estado (`CloudOff` / `Cloud`), e a sincronização é retomada automaticamente assim que a conexão retornar.

### G4: Quais protocolos de nuvem suportar sem inchar o executável (Anti-Bloat)?
* **Decisão**: Protocolo WebDAV HTTP/1.1 padrão (RFC 4918: `PUT`, `GET`, `MKCOL`, `PROPFIND`).
* **Mecanismo**: O WebDAV é o protocolo padrão da indústria utilizado por Nextcloud, ownCloud, Fastmail e servidores NAS locais, implementável via cliente HTTPS leve nativo em TypeScript/JavaScript com zero bibliotecas volumosas adicionais.

---

## 3. Decisões Arquiteturais Propostas (ADRs)

* **AD-028**: Sincronização em nuvem local-first via protocolo aberto WebDAV em segundo plano desacoplado com fila offline-first e proteção de abas ativas.

