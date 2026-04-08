import React from 'react';
import styles from './Callout.module.css';

interface CalloutProps {
  className?: string;
  children: React.ReactNode;
}

interface CalloutSlotProps {
  children: React.ReactNode;
}

export function Callout({ className, children }: CalloutProps) {
  const mergedClassName = className ? `${styles.callout} ${className}` : styles.callout;

  return <div className={mergedClassName}>{children}</div>;
}

export function CalloutTitle({ children }: CalloutSlotProps) {
  return <h3 className={styles.title}>{children}</h3>;
}

export function CalloutContent({ children }: CalloutSlotProps) {
  return <div className={styles.content}>{children}</div>;
}