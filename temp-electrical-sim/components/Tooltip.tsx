import React from 'react';

interface TooltipProps {
  visible: boolean;
  x: number;
  y: number;
  content: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ visible, x, y, content }) => {
  if (!visible) return null;

  return (
    <div
      className="fixed z-50 p-2 text-sm text-[var(--text-primary)] bg-[var(--bg-tooltip)] border border-[var(--border-secondary)] rounded-md shadow-lg pointer-events-none"
      style={{ left: x + 15, top: y + 10 }}
    >
      {content}
    </div>
  );
};