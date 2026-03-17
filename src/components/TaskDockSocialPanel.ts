import { Panel } from './Panel';
import { h } from '@/utils/dom-utils';
import { escapeHtml } from '@/utils/sanitize';

interface SocialNetwork {
  id: string;
  label: string;
  icon: string;
  color: string;
  url: string;
  description: string;
}

const SOCIAL_NETWORKS: SocialNetwork[] = [
  {
    id: 'youtube',
    label: 'YouTube',
    icon: '▶️',
    color: '#ff0000',
    url: 'https://youtube.com',
    description: 'Video streaming & community',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: '🎵',
    color: '#010101',
    url: 'https://tiktok.com',
    description: 'Short-form video platform',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '📷',
    color: '#e1306c',
    url: 'https://instagram.com',
    description: 'Photo & video sharing',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: '👥',
    color: '#1877f2',
    url: 'https://facebook.com',
    description: 'Social networking',
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    icon: '𝕏',
    color: '#14171a',
    url: 'https://x.com',
    description: 'Real-time news & discussions',
  },
  {
    id: 'discord',
    label: 'Discord',
    icon: '💬',
    color: '#5865f2',
    url: 'https://discord.com',
    description: 'Community chat & voice',
  },
  {
    id: 'reddit',
    label: 'Reddit',
    icon: '🔴',
    color: '#ff4500',
    url: 'https://reddit.com',
    description: 'Community forums & news',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: '💼',
    color: '#0a66c2',
    url: 'https://linkedin.com',
    description: 'Professional networking',
  },
];

export class TaskDockSocialPanel extends Panel {
  constructor() {
    super({ id: 'taskdock-social', title: 'Social Feed', className: 'taskdock-social-panel' });
    this.render();
  }

  private render(): void {
    const content = this.content;
    content.innerHTML = '';

    const intro = h('p', { className: 'taskdock-social-intro' },
      'Quick-launch your social platforms. Click to open in a new tab or pop out as a focused window.');
    content.appendChild(intro);

    const grid = h('div', { className: 'taskdock-social-grid' });

    for (const network of SOCIAL_NETWORKS) {
      const card = h('div', {
        className: 'taskdock-social-card',
        role: 'button',
        tabIndex: '0',
        title: `Open ${escapeHtml(network.label)}`,
      });
      card.style.setProperty('--social-color', network.color);

      const iconEl = h('span', { className: 'taskdock-social-icon' }, network.icon);
      const labelEl = h('span', { className: 'taskdock-social-label' }, network.label);
      const descEl = h('span', { className: 'taskdock-social-desc' }, network.description);

      const btnRow = h('div', { className: 'taskdock-social-btn-row' });

      const openBtn = h('button', {
        className: 'taskdock-social-btn',
        title: `Open ${escapeHtml(network.label)} in new tab`,
      }, '🌐 Open');
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(network.url, '_blank', 'noopener,noreferrer');
      });

      const popoutBtn = h('button', {
        className: 'taskdock-social-btn taskdock-social-btn--popout',
        title: `Pop out ${escapeHtml(network.label)} in a small window`,
      }, '⧉ Popout');
      popoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const w = 420;
        const h2 = 720;
        const left = Math.round(window.screen.width / 2 - w / 2);
        const top = Math.round(window.screen.height / 2 - h2 / 2);
        window.open(
          network.url,
          `taskdock-${network.id}`,
          `width=${w},height=${h2},left=${left},top=${top},noopener,noreferrer`,
        );
      });

      btnRow.appendChild(openBtn);
      btnRow.appendChild(popoutBtn);

      card.appendChild(iconEl);
      card.appendChild(labelEl);
      card.appendChild(descEl);
      card.appendChild(btnRow);

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(network.url, '_blank', 'noopener,noreferrer');
        }
      });

      grid.appendChild(card);
    }

    content.appendChild(grid);
  }
}
