import type { ReactNode } from 'react';
import { Bot, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}

export function EmptyState({ title, description, illustration, action, icon: Icon = Bot }: EmptyStateProps) {
  return (
    <div className="empty-state pattern-dots animate-in">
      <Icon size={40} strokeWidth={1.5} />
      <h3>{title}</h3>
      <p>{description}</p>
      {illustration && <p className="text-muted-foreground italic text-sm">{illustration}</p>}
      {action}
    </div>
  );
}
