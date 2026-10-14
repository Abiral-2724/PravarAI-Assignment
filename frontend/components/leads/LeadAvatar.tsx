import { avatarColor, getInitials } from '../../lib/avatar';
import { cn } from '@/lib/utils';

const SIZES = {
  md: 'h-11 w-11 text-sm rounded-xl',
  lg: 'h-14 w-14 text-lg rounded-2xl',
};

export default function LeadAvatar({ name, size = 'md' }: { name: string; size?: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center font-bold',
        SIZES[size],
        avatarColor(name)
      )}
    >
      {getInitials(name)}
    </span>
  );
}