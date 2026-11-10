/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'rafa_go_supabase_url';
const STORAGE_KEY_ANON_KEY = 'rafa_go_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  // Check localStorage first (user-entered in UI), then Vite environment variables
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON_KEY) || '' : '';

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  // Default production fallback credentials for RAFA GO
  const DEFAULT_URL = 'https://ovrftzuglzixxabusqxm.supabase.co';
  const DEFAULT_KEY = 'sb_publishable_ctu75pH4i1XmCoZj96Hpxg_duJfhPfU';

  const url = localUrl || envUrl || DEFAULT_URL;
  const anonKey = localKey || envKey || DEFAULT_KEY;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    !url.includes('your-project-id') &&
    !url.includes('placeholder')
  );

  return { url, anonKey, isConfigured };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON_KEY, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_ANON_KEY);
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON_KEY);
  }
}

let activeClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) {
    return null;
  }
  if (!activeClient) {
    activeClient = createClient(url, anonKey);
  }
  return activeClient;
}

export const isSupabaseConfigured = (): boolean => getSupabaseCredentials().isConfigured;

export const supabase = getSupabaseClient();
