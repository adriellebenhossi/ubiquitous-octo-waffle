/**
 * AdminTip.tsx
 * 
 * Ultra-modern tooltip component for admin dashboard
 * Minimalist aesthetic with glassmorphism and sophisticated animations
 * Fully responsive with micro-interactions
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface AdminTipProps {
  title: string;
  content: string | React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  gradient: {
    from: string;
    to: string;
    accent: string;
    text: string;
    iconBg: string;
  };
  onClose: () => void;
  delay?: number;
}

export function AdminTip({ 
  title, 
  content, 
  icon: Icon, 
  gradient, 
  onClose, 
  delay = 0 
}: AdminTipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.8, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, y: -20, scale: 0.9, rotateX: 15 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.6
          }}
          className="relative w-full perspective-1000"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main container with advanced glassmorphism */}
          <div className={`
            relative group overflow-hidden
            bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl
            border border-white/30 dark:border-gray-700/50
            rounded-2xl sm:rounded-3xl
            p-4 sm:p-5 md:p-6 lg:p-8
            shadow-2xl shadow-black/5
            transition-all duration-700 ease-out
            hover:shadow-3xl hover:shadow-black/10
            ${isHovered ? 'scale-[1.02]' : 'scale-100'}
            before:absolute before:inset-0 
            before:bg-gradient-to-br before:${gradient.from} before:${gradient.to}
            before:opacity-20 before:rounded-2xl sm:before:rounded-3xl
            before:transition-opacity before:duration-500
            ${isHovered ? 'before:opacity-30' : 'before:opacity-20'}
          `}>
            
            {/* Subtle animated background pattern */}
            <motion.div 
              className="absolute inset-0 opacity-30"
              animate={{ 
                background: isHovered 
                  ? "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)"
                  : "radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)"
              }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
            
            {/* Floating particles effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                background: [
                  "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.03) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 50%)",
                  "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.03) 0%, transparent 50%)",
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
            />
            
            {/* Modern close button with micro-interactions */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className={`
                absolute top-3 right-3 sm:top-4 sm:right-4
                w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                rounded-full
                bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                border border-gray-200/50 dark:border-gray-600/50
                shadow-lg shadow-black/5
                flex items-center justify-center
                transition-all duration-300 ease-out
                hover:bg-white dark:hover:bg-gray-700
                hover:shadow-xl hover:shadow-black/10
                group/close z-20
              `}
              aria-label="Fechar dica"
            >
              <X className={`
                w-4 h-4 sm:w-5 sm:h-5
                text-gray-600 dark:text-gray-300
                transition-all duration-300
                group-hover/close:text-gray-800 dark:group-hover/close:text-white
              `} />
            </motion.button>

            {/* Content layout */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 pr-10 sm:pr-12">
              {/* Ícone minimalista com efeito elegante de entrada */}
              <motion.div 
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.2, 
                  type: "spring", 
                  stiffness: 300,
                  damping: 20,
                  duration: 0.8
                }}
                whileHover={{ 
                  scale: 1.08,
                  rotate: 5,
                  transition: { duration: 0.2 }
                }}
                className={`
                  relative flex-shrink-0
                  w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                  rounded-xl sm:rounded-2xl
                  ${gradient.iconBg}
                  flex items-center justify-center
                  border border-gray-200/60
                  backdrop-blur-sm
                  transition-all duration-300
                  shadow-lg hover:shadow-xl
                `}
              >
                {/* Efeito de brilho sutil */}
                <motion.div 
                  className="absolute inset-0.5 bg-gradient-to-br from-white/40 to-white/10 rounded-lg sm:rounded-xl"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Ícone com animação suave */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4, ease: "backOut" }}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-700 relative z-10" />
                </motion.div>
              </motion.div>

              {/* Content with clean typography - sem título */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex-1 min-w-0"
              >
                {/* Content with better readability */}
                <div className={`
                  text-sm sm:text-base md:text-lg
                  text-gray-700 dark:text-gray-300
                  leading-relaxed
                  break-words
                  space-y-2
                `}>
                  {typeof content === 'string' ? (
                    <p className="opacity-90">{content}</p>
                  ) : (
                    <div className="opacity-90">{content}</div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Enhanced animated bottom accent - full width gradient */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 h-1.5 origin-left rounded-b-2xl sm:rounded-b-3xl overflow-hidden"
            >
              <div 
                className="w-full h-full opacity-15"
                style={{
                  background: `linear-gradient(90deg, #374151 0%, #1f2937 100%)`
                }}
              />
            </motion.div>
            
            {/* Additional subtle glow effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
              className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-b-2xl sm:rounded-b-3xl blur-sm"
            >
              <div 
                className="w-full h-full opacity-10"
                style={{
                  background: `linear-gradient(90deg, #374151, #1f2937)`
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Ultra-modern gradient presets for sophisticated aesthetic appeal - ÍCONE PRETO COM FUNDO CINZA CLARO
export const TIP_GRADIENTS = {
  header: {
    from: "from-gray-50",
    to: "to-slate-50", 
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  general: {
    from: "from-slate-50",
    to: "to-gray-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  hero: {
    from: "from-gray-50",
    to: "to-zinc-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  about: {
    from: "from-slate-50",
    to: "to-stone-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  specialties: {
    from: "from-neutral-50",
    to: "to-gray-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  inspirational: {
    from: "from-stone-50",
    to: "to-slate-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  testimonials: {
    from: "from-zinc-50",
    to: "to-neutral-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  services: {
    from: "from-gray-50",
    to: "to-slate-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  faq: {
    from: "from-slate-50",
    to: "to-zinc-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  contact: {
    from: "from-neutral-50",
    to: "to-stone-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  articles: {
    from: "from-stone-50",
    to: "to-gray-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  gallery: {
    from: "from-zinc-50",
    to: "to-slate-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  footer: {
    from: "from-gray-50",
    to: "to-neutral-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  visibility: {
    from: "from-slate-50",
    to: "to-stone-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  marketing: {
    from: "from-neutral-50",
    to: "to-zinc-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  appearance: {
    from: "from-stone-50",
    to: "to-neutral-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
  instructions: {
    from: "from-zinc-50",
    to: "to-gray-50",
    accent: "border-gray-900/15",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
  },
} as const;