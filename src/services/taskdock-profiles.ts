/**
 * TaskDock Profile Manager
 *
 * Manages user-defined dashboard profiles. Each profile stores a name and
 * the list of panel IDs that should be visible when that profile is active.
 * Profiles are persisted to localStorage so they survive page reloads.
 */

const STORAGE_KEY = 'worldmonitor-taskdock-profiles';
const ACTIVE_PROFILE_KEY = 'worldmonitor-taskdock-active-profile';

export interface TaskDockProfile {
  id: string;
  name: string;
  /** Panel IDs that are enabled in this profile. Panels not in this list are hidden. */
  enabledPanels: string[];
  createdAt: number;
}

export interface TaskDockProfilesState {
  profiles: TaskDockProfile[];
  activeProfileId: string | null;
}

function generateId(): string {
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadState(): TaskDockProfilesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (raw) {
      const profiles = JSON.parse(raw) as TaskDockProfile[];
      return { profiles, activeProfileId: activeId };
    }
  } catch {
    // ignore
  }
  return { profiles: [], activeProfileId: null };
}

function saveState(state: TaskDockProfilesState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profiles));
    if (state.activeProfileId !== null) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, state.activeProfileId);
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();

let _state: TaskDockProfilesState = loadState();

function notify(): void {
  for (const fn of listeners) fn();
}

/** Subscribe to profile changes. Returns an unsubscribe function. */
export function subscribeProfiles(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Return a copy of all profiles. */
export function getProfiles(): TaskDockProfile[] {
  return [..._state.profiles];
}

/** Return the currently active profile, or null. */
export function getActiveProfile(): TaskDockProfile | null {
  if (!_state.activeProfileId) return null;
  return _state.profiles.find(p => p.id === _state.activeProfileId) ?? null;
}

/** Return the active profile ID, or null. */
export function getActiveProfileId(): string | null {
  return _state.activeProfileId;
}

/** Create a new profile with the given name and panel list. */
export function createProfile(name: string, enabledPanels: string[]): TaskDockProfile {
  const profile: TaskDockProfile = {
    id: generateId(),
    name: name.trim() || 'New Profile',
    enabledPanels,
    createdAt: Date.now(),
  };
  _state = { ..._state, profiles: [..._state.profiles, profile] };
  saveState(_state);
  notify();
  return profile;
}

/** Update an existing profile's name and/or panel list. */
export function updateProfile(id: string, updates: Partial<Pick<TaskDockProfile, 'name' | 'enabledPanels'>>): void {
  _state = {
    ..._state,
    profiles: _state.profiles.map(p =>
      p.id === id ? { ...p, ...updates } : p,
    ),
  };
  saveState(_state);
  notify();
}

/** Delete a profile by ID. */
export function deleteProfile(id: string): void {
  const next = _state.profiles.filter(p => p.id !== id);
  const activeId = _state.activeProfileId === id ? (next[0]?.id ?? null) : _state.activeProfileId;
  _state = { profiles: next, activeProfileId: activeId };
  saveState(_state);
  notify();
}

/** Switch to a different profile by ID. */
export function switchProfile(id: string | null): void {
  _state = { ..._state, activeProfileId: id };
  saveState(_state);
  notify();
}

/**
 * Seed default profiles if none exist yet.
 * Call this once on app startup with the full list of known panel IDs.
 */
export function seedDefaultProfiles(allPanelIds: string[]): void {
  if (_state.profiles.length > 0) return;

  const newsIds = allPanelIds.filter(id =>
    ['politics', 'philippines', 'live-news', 'ai', 'breaking-news', 'insights'].includes(id),
  );
  const socialIds = ['taskdock-social', 'taskdock-coding'];
  const codingIds = ['taskdock-coding', 'service-status', 'tech', 'ai', 'monitors'];

  createProfile('News', newsIds.length > 0 ? newsIds : ['politics', 'live-news', 'ai', 'philippines']);
  createProfile('Social & Coding', [...new Set([...socialIds, ...codingIds])]);
  createProfile('All Panels', allPanelIds);

  switchProfile(_state.profiles[0]?.id ?? null);
}
