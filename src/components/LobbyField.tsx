import React from 'react';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
}

export function LobbyField({ id, label, value, onChange, errorMessage, ...inputProps }: Props) {
  return (
    <>
      <label className="lobby-label" htmlFor={id}>
        {label}
      </label>
      <div className="lobby-field-group">
        <input
          id={id}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          {...inputProps}
        />
        {errorMessage && <p className="lobby-error">{errorMessage}</p>}
      </div>
    </>
  );
}
