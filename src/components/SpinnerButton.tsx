import { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: ReactNode;
}

export function SpinnerButton({ isLoading = false, disabled, className, children, ...props }: Props) {
  const classes = ['spinner-btn', className].filter(Boolean).join(' ');
  return (
    <button {...props} className={classes} disabled={disabled || isLoading}>
      {isLoading ? <span className="btn-spinner" /> : children}
    </button>
  );
}
