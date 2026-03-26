import { useState, useEffect } from 'react';
import { Settings } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => ({
    darkMode: localStorage.getItem('darkMode') === 'true',
  }));
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('darkMode') === null) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setSettings(prev => ({ ...prev, darkMode: true }));
      }
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    localStorage.setItem(key, String(value));
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  return { settings, settingsOpen, setSettingsOpen, updateSetting };
}
