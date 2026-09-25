import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface MotionCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, delay = 0, hover = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
        whileHover={hover ? { y: -3, boxShadow: '0 12px 28px -8px rgba(0, 58, 155, 0.18)' } : undefined}
        className={cn(
          'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl',
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

MotionCard.displayName = 'MotionCard';