'use client';

import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatLauncherProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnread?: boolean;
}

export function ChatLauncher({ isOpen, onClick, hasUnread }: ChatLauncherProps) {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat de Mirador de Villarrica'}
      aria-expanded={isOpen}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'flex h-14 w-14 items-center justify-center rounded-full',
        'bg-bosque-800 text-crema shadow-lg',
        'hover:bg-bosque-700 transition-colors',
        'md:h-16 md:w-16'
      )}
    >
      {isOpen ? (
        <X className="h-6 w-6" aria-hidden="true" />
      ) : (
        <>
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
          {hasUnread && (
            <span
              className="absolute right-1 top-1 h-3 w-3 rounded-full bg-mostaza"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </motion.button>
  );
}
