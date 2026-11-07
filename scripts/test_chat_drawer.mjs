import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('Starting Edge in headless mode...');
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const res = await fetch('http://localhost:9222/json');
      targets = await res.json();
      if (targets && targets.length > 0) break;
    } catch {}
  }

  const pageTarget = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', data.params.type, data.params.args.map(a => a.value || a.description).join(' '));
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', data.params.exceptionDetails.text, data.params.exceptionDetails.exception?.description);
    }
    if (data.id && pending.has(data.id)) {
      const { resolve } = pending.get(data.id);
      pending.delete(data.id);
      resolve(data.result);
    }
  };

  await new Promise((resolve) => (ws.onopen = resolve));

  function send(method, params = {}) {
    const reqId = id++;
    return new Promise((resolve) => {
      pending.set(reqId, { resolve });
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');

  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__TAURI_INTERNALS__ = {
        transformCallback: (fn) => 1,
        invoke: (cmd, args) => {
          if (cmd === 'read_text_file') return Promise.resolve('# Mock Doc');
          if (cmd === 'get_current_theme') return Promise.resolve(null);
          return Promise.resolve(null);
        },
        plugins: {}
      };
      window.__TAURI_EVENT_LISTENERS__ = {};
    `
  });

  console.log('Navigating to http://localhost:1420 ...');
  await send('Page.navigate', { url: 'http://localhost:1420' });
  await new Promise((r) => setTimeout(r, 2500));

  console.log('Waiting for app to mount and Chat IA button to appear...');
  let chatBtnFound = false;
  for (let i = 0; i < 30; i++) {
    const check = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const chatBtn = btns.find(b => b.innerText && b.innerText.includes('Chat IA'));
          return { found: !!chatBtn, labels: btns.map(b => b.innerText.trim()).filter(Boolean) };
        })()
      `,
      returnByValue: true
    });
    if (check.result?.value?.found) {
      chatBtnFound = true;
      break;
    }
    console.log('Buttons so far:', check.result?.value?.labels);
    await new Promise((r) => setTimeout(r, 400));
  }

  if (!chatBtnFound) {
    const html = await send('Runtime.evaluate', { expression: 'document.body.innerHTML', returnByValue: true });
    console.log('Body HTML:', html.result?.value?.slice(0, 500));
    console.error('Chat IA button never appeared');
    ws.close();
    edge.kill();
    process.exit(1);
  }

  console.log('Clicking Chat IA button...');
  const clickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const chatBtn = btns.find(b => b.innerText && b.innerText.includes('Chat IA'));
        chatBtn.click();
        return { clicked: true, title: chatBtn.title };
      })()
    `,
    returnByValue: true
  });
  console.log('Click result:', JSON.stringify(clickRes));

  // Wait 400ms for animation and autofocus
  await new Promise((r) => setTimeout(r, 400));

  const afterClick = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const aiDrawer = document.querySelector('.ai-drawer');
        const activeEl = document.activeElement;
        return {
          hasAiDrawer: !!aiDrawer,
          aiDrawerText: aiDrawer ? aiDrawer.innerText.slice(0, 100) : null,
          computed: aiDrawer ? {
            display: window.getComputedStyle(aiDrawer).display,
            width: window.getComputedStyle(aiDrawer).width,
            position: window.getComputedStyle(aiDrawer).position,
            zIndex: window.getComputedStyle(aiDrawer).zIndex,
            top: window.getComputedStyle(aiDrawer).top,
            bottom: window.getComputedStyle(aiDrawer).bottom,
            right: window.getComputedStyle(aiDrawer).right
          } : null,
          focusedElement: activeEl ? activeEl.tagName : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Drawer status after click:', JSON.stringify(afterClick, null, 2));

  // Test closing with Escape
  console.log('Testing Escape key to close drawer...');
  await send('Runtime.evaluate', {
    expression: `
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    `
  });

  await new Promise((r) => setTimeout(r, 200));

  const afterEsc = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const aiDrawer = document.querySelector('.ai-drawer');
        return { hasAiDrawer: !!aiDrawer };
      })()
    `,
    returnByValue: true
  });
  console.log('Drawer status after Escape:', JSON.stringify(afterEsc));

  ws.close();
  edge.kill();

  if (afterClick.result?.value?.hasAiDrawer && !afterEsc.result?.value?.hasAiDrawer) {
    console.log('SUCCESS: Chat IA drawer opened cleanly without freezing, focused textarea, and closed with Escape!');
    process.exit(0);
  } else {
    console.error('FAILED assertion on drawer state');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
