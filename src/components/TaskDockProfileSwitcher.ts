import { h } from '@/utils/dom-utils';
import { escapeHtml } from '@/utils/sanitize';
import {
  getProfiles,
  getActiveProfileId,
  createProfile,
  updateProfile,
  deleteProfile,
  switchProfile,
  subscribeProfiles,
  type TaskDockProfile,
} from '@/services/taskdock-profiles';

type ProfileChangeCallback = (profile: TaskDockProfile | null, allEnabledPanels: string[] | null) => void;

/**
 * TaskDock Profile Switcher UI
 *
 * Renders a compact dropdown in the header that lets the user:
 * - Switch between saved profiles
 * - Create new profiles
 * - Rename / delete existing profiles
 *
 * When a profile is selected, the `onChange` callback fires with the profile
 * object (or null to show all panels) and the list of enabled panel IDs.
 */
export class TaskDockProfileSwitcher {
  private element: HTMLElement;
  private dropdown: HTMLElement;
  private trigger: HTMLButtonElement;
  private unsub: () => void;
  private onChange: ProfileChangeCallback;
  private open = false;

  constructor(onChange: ProfileChangeCallback) {
    this.onChange = onChange;

    this.element = h('div', { className: 'taskdock-profile-switcher', id: 'taskdockProfileSwitcher' });
    this.trigger = h('button', {
      className: 'taskdock-profile-trigger',
      title: 'Switch dashboard profile (TaskDock)',
      'aria-label': 'TaskDock profile switcher',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
    }) as HTMLButtonElement;

    this.dropdown = h('div', {
      className: 'taskdock-profile-dropdown',
      role: 'menu',
    });
    this.dropdown.style.display = 'none';

    this.element.appendChild(this.trigger);
    this.element.appendChild(this.dropdown);

    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    document.addEventListener('click', (e) => {
      if (this.open && !this.element.contains(e.target as Node)) {
        this.closeDropdown();
      }
    });

    this.unsub = subscribeProfiles(() => this.update());
    this.update();
  }

  getElement(): HTMLElement {
    return this.element;
  }

  destroy(): void {
    this.unsub();
  }

  private toggleDropdown(): void {
    if (this.open) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  private openDropdown(): void {
    this.open = true;
    this.dropdown.style.display = 'block';
    this.trigger.setAttribute('aria-expanded', 'true');
    this.renderDropdown();
  }

  private closeDropdown(): void {
    this.open = false;
    this.dropdown.style.display = 'none';
    this.trigger.setAttribute('aria-expanded', 'false');
  }

  private update(): void {
    const profiles = getProfiles();
    const activeId = getActiveProfileId();
    const active = profiles.find(p => p.id === activeId) ?? null;

    const label = active ? escapeHtml(active.name) : 'All Panels';
    this.trigger.innerHTML = `<span class="taskdock-profile-icon">🗂️</span><span class="taskdock-profile-name">${label}</span><span class="taskdock-profile-chevron">▾</span>`;

    if (this.open) {
      this.renderDropdown();
    }
  }

  private renderDropdown(): void {
    const profiles = getProfiles();
    const activeId = getActiveProfileId();

    this.dropdown.innerHTML = '';

    // Header
    const header = h('div', { className: 'taskdock-dropdown-header' }, 'Dashboard Profiles');
    this.dropdown.appendChild(header);

    // "All Panels" option
    const allOption = h('div', {
      className: `taskdock-profile-option${activeId === null ? ' taskdock-profile-option--active' : ''}`,
      role: 'menuitem',
      tabIndex: '0',
    });
    allOption.innerHTML = `<span class="taskdock-option-name">All Panels</span>`;
    allOption.addEventListener('click', () => {
      switchProfile(null);
      this.onChange(null, null);
      this.closeDropdown();
    });
    this.dropdown.appendChild(allOption);

    // Profiles list
    for (const profile of profiles) {
      const isActive = profile.id === activeId;
      const row = h('div', {
        className: `taskdock-profile-option${isActive ? ' taskdock-profile-option--active' : ''}`,
        role: 'menuitem',
      });

      const nameSpan = h('span', { className: 'taskdock-option-name' }, escapeHtml(profile.name));
      const actions = h('div', { className: 'taskdock-option-actions' });

      const editBtn = h('button', {
        className: 'taskdock-option-btn',
        title: `Rename "${escapeHtml(profile.name)}"`,
        'aria-label': `Rename ${escapeHtml(profile.name)}`,
      }, '✏️');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.promptRename(profile);
      });

      const deleteBtn = h('button', {
        className: 'taskdock-option-btn taskdock-option-btn--delete',
        title: `Delete "${escapeHtml(profile.name)}"`,
        'aria-label': `Delete ${escapeHtml(profile.name)}`,
      }, '🗑️');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.confirmDelete(profile);
      });

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      row.appendChild(nameSpan);
      row.appendChild(actions);

      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.taskdock-option-actions')) return;
        switchProfile(profile.id);
        this.onChange(profile, profile.enabledPanels);
        this.closeDropdown();
      });

      this.dropdown.appendChild(row);
    }

    // Divider
    this.dropdown.appendChild(h('div', { className: 'taskdock-dropdown-divider' }));

    // New profile button
    const newBtn = h('button', {
      className: 'taskdock-profile-new-btn',
      title: 'Create a new profile',
    }, '＋ New Profile');
    newBtn.addEventListener('click', () => {
      this.promptCreate();
    });
    this.dropdown.appendChild(newBtn);

    // Save current button
    const saveBtn = h('button', {
      className: 'taskdock-profile-save-btn',
      title: 'Save current panel visibility as a new profile',
    }, '💾 Save Current Layout');
    saveBtn.addEventListener('click', () => {
      this.promptSaveCurrentLayout();
    });
    this.dropdown.appendChild(saveBtn);
  }

  private promptRename(profile: TaskDockProfile): void {
    // Use a simple inline edit instead of a browser prompt for better UX
    const newName = globalThis.prompt(`Rename profile "${profile.name}":`, profile.name);
    if (newName && newName.trim()) {
      updateProfile(profile.id, { name: newName.trim() });
    }
  }

  private confirmDelete(profile: TaskDockProfile): void {
    if (globalThis.confirm(`Delete profile "${profile.name}"? This cannot be undone.`)) {
      deleteProfile(profile.id);
      const activeId = getActiveProfileId();
      const active = getProfiles().find(p => p.id === activeId) ?? null;
      this.onChange(active, active?.enabledPanels ?? null);
    }
  }

  private promptCreate(): void {
    const name = globalThis.prompt('Enter a name for the new profile:');
    if (name && name.trim()) {
      // Default to all panels enabled
      const profile = createProfile(name.trim(), []);
      switchProfile(profile.id);
      this.onChange(profile, profile.enabledPanels);
      this.closeDropdown();
    }
  }

  private promptSaveCurrentLayout(): void {
    const name = globalThis.prompt('Save current panel layout as:', 'My Profile');
    if (name && name.trim()) {
      // Capture which panels are currently enabled by querying the DOM
      const enabledPanels = this.getVisiblePanelIds();
      const profile = createProfile(name.trim(), enabledPanels);
      switchProfile(profile.id);
      this.onChange(profile, profile.enabledPanels);
      this.closeDropdown();
    }
  }

  private getVisiblePanelIds(): string[] {
    const panelsGrid = document.getElementById('panelsGrid');
    if (!panelsGrid) return [];
    const ids: string[] = [];
    panelsGrid.querySelectorAll<HTMLElement>('[data-panel]').forEach(el => {
      const id = el.getAttribute('data-panel');
      if (id && el.style.display !== 'none') ids.push(id);
    });
    return ids;
  }
}
