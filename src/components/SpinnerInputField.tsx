import React, { useState } from 'react';
import styles from './SpinnerInputField.module.css';

interface Props {
  id?: string;
  className?: string;
  label?: string;
  buttonLabel?: string;
  buttonDisabled?: boolean;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function SpinnerInputField({
  id,
  className,
  label,
  buttonLabel = '제출',
  buttonDisabled = false,
  onSubmit,
  onChange,
  placeholder,
  isLoading = false,
}: Props) {
  const [value, setValue] = useState('');

  function handleChange(nextValue: string) {
    setValue(nextValue);
    onChange?.(nextValue);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (buttonDisabled || isLoading) return;
    onSubmit?.(value);
  }

  return (
    <div className={[styles.fieldGroup, className].filter(Boolean).join(' ')}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <form className={styles.inputWrapper} onSubmit={handleSubmit}>
        <input
          id={id}
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          className={styles.input}
          placeholder={placeholder}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={buttonDisabled || isLoading}
        >
          {isLoading ? <span className={styles.spinner} /> : buttonLabel}
        </button>
      </form>
    </div>
  );
}
