import { Panel } from './Panel';
import { h } from '@/utils/dom-utils';
import { escapeHtml } from '@/utils/sanitize';

interface CodingTool {
  id: string;
  label: string;
  icon: string;
  description: string;
  webUrl?: string;
  localCmd?: string;
}

const CODING_TOOLS: CodingTool[] = [
  {
    id: 'vscode',
    label: 'VS Code',
    icon: '💻',
    description: 'Visual Studio Code — code editor',
    webUrl: 'https://vscode.dev',
    localCmd: 'code .',
  },
  {
    id: 'pycharm',
    label: 'PyCharm',
    icon: '🐍',
    description: 'JetBrains Python IDE',
    webUrl: 'https://www.jetbrains.com/pycharm/',
    localCmd: 'pycharm .',
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: '🐙',
    description: 'GitHub — code repository',
    webUrl: 'https://github.com',
  },
  {
    id: 'colab',
    label: 'Google Colab',
    icon: '📓',
    description: 'Jupyter notebooks in the cloud',
    webUrl: 'https://colab.research.google.com',
  },
  {
    id: 'replit',
    label: 'Replit',
    icon: '🔁',
    description: 'Online code editor & hosting',
    webUrl: 'https://replit.com',
  },
  {
    id: 'codepen',
    label: 'CodePen',
    icon: '🖊️',
    description: 'Front-end playground',
    webUrl: 'https://codepen.io',
  },
  {
    id: 'powershell',
    label: 'PowerShell',
    icon: '🖥️',
    description: 'Windows PowerShell (Azure Cloud Shell)',
    webUrl: 'https://shell.azure.com',
    localCmd: 'pwsh',
  },
  {
    id: 'terminal',
    label: 'Terminal Tips',
    icon: '⌨️',
    description: 'Useful shell commands',
  },
];

const TERMINAL_TIPS = [
  'git status',
  'git pull origin main',
  'npm install && npm run dev',
  'python -m venv .venv && source .venv/bin/activate',
  'docker ps && docker logs <container>',
  'ssh user@host',
  'ls -la | grep ".ts"',
];

export class TaskDockCodingPanel extends Panel {
  private showTips = false;

  constructor() {
    super({ id: 'taskdock-coding', title: 'Coding Launchers', className: 'taskdock-coding-panel' });
    this.render();
  }

  private render(): void {
    const content = this.content;
    content.innerHTML = '';

    const grid = h('div', { className: 'taskdock-tool-grid' });

    for (const tool of CODING_TOOLS) {
      const card = h('div', { className: 'taskdock-tool-card' });

      const icon = h('span', { className: 'taskdock-tool-icon' }, tool.icon);
      const label = h('span', { className: 'taskdock-tool-label' }, tool.label);
      const desc = h('span', { className: 'taskdock-tool-desc' }, tool.description);

      const actions = h('div', { className: 'taskdock-tool-actions' });

      if (tool.webUrl) {
        const webBtn = h('button', {
          className: 'taskdock-tool-btn',
          title: `Open ${escapeHtml(tool.label)} in new tab`,
        }, '🌐 Open');
        webBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.open(tool.webUrl, '_blank', 'noopener,noreferrer');
        });
        actions.appendChild(webBtn);
      }

      if (tool.localCmd) {
        const copyBtn = h('button', {
          className: 'taskdock-tool-btn taskdock-tool-btn--copy',
          title: `Copy local launch command: ${escapeHtml(tool.localCmd)}`,
        }, '📋 ' + escapeHtml(tool.localCmd));
        copyBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(tool.localCmd!);
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => { copyBtn.textContent = '📋 ' + tool.localCmd!; }, 1500);
          } catch {
            copyBtn.textContent = '❌ Copy failed';
          }
        });
        actions.appendChild(copyBtn);
      }

      if (tool.id === 'terminal') {
        const tipsBtn = h('button', {
          className: 'taskdock-tool-btn',
          title: 'Show terminal tips',
        }, '📜 Tips');
        tipsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showTips = !this.showTips;
          this.render();
        });
        actions.appendChild(tipsBtn);
      }

      card.appendChild(icon);
      card.appendChild(label);
      card.appendChild(desc);
      card.appendChild(actions);
      grid.appendChild(card);
    }

    content.appendChild(grid);

    if (this.showTips) {
      const tipsBox = h('div', { className: 'taskdock-tips-box' });
      const tipsTitle = h('div', { className: 'taskdock-tips-title' }, '🖥️ Useful Terminal Commands');
      tipsBox.appendChild(tipsTitle);
      for (const cmd of TERMINAL_TIPS) {
        const row = h('div', { className: 'taskdock-tip-row' });
        const code = h('code', { className: 'taskdock-tip-cmd' }, cmd);
        const copyBtn = h('button', { className: 'taskdock-tip-copy', title: 'Copy' }, '📋');
        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(cmd);
            copyBtn.textContent = '✅';
            setTimeout(() => { copyBtn.textContent = '📋'; }, 1000);
          } catch {
            // ignore
          }
        });
        row.appendChild(code);
        row.appendChild(copyBtn);
        tipsBox.appendChild(row);
      }
      content.appendChild(tipsBox);
    }
  }
}
