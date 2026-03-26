import React from 'react';
import { Settings } from '../types';

interface Props {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export function SettingsDialog({ open, settings, onClose, onUpdate }: Props) {
  if (!open) return null;

  return (
    <div className="dialog-underlay" id="settings-underlay" onClick={onClose}>
      <div
        className="dialog"
        id="settings"
        aria-labelledby="settings-heading"
        aria-modal="true"
        role="dialog"
        onClick={e => e.stopPropagation()}
      >
        <button className="dialog-close" aria-label="닫기" onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="dialog-content" id="settings-content">
          <h3 id="settings-heading">설정</h3>
          <div>
            <input
              type="checkbox"
              id="dark-mode"
              checked={settings.darkMode}
              onChange={e => onUpdate('darkMode', e.target.checked)}
            />
            <label htmlFor="dark-mode">다크 모드</label>
          </div>
        </div>
      </div>
    </div>
  );
}
