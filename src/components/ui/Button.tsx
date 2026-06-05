import { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export const Button = ({ variant = 'primary', className = '', ...props }: ButtonProps) => {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ease-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2';

  const variants: Record<typeof variant, string> = {
    primary:
      'bg-primary text-white shadow-soft hover:bg-primary/90 active:scale-[0.98]',
    ghost:
      'bg-transparent text-text-muted hover:bg-slate-100 active:bg-slate-200',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

