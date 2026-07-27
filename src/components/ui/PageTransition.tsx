'use client';

import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Smooth page transition wrapper using Framer Motion.
 * Wraps every page in a fade-up entrance and a fade-out exit
 * so navigation feels instant and polished rather than jarring.
 *
 * Usage: wrap page content in <PageTransition> ... </PageTransition>
 */

interface PageTransitionProps {
  children: React.ReactNode;
  /** Optional CSS class names to pass to the wrapper div */
  className?: string;
}

const pageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.995,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.32,
      ease: 'easeOut',
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.998,
    transition: {
      duration: 0.18,
      ease: 'easeIn',
    },
  },
};

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={className}
        style={{ willChange: 'opacity, transform' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Staggered children container — each direct child fades in
 * with a slight delay offset for a cascade entry effect.
 */
const childVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: 'easeOut' },
  },
};

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0,
    },
  },
};

export function StaggerContainer({ children, className, delay = 0 }: StaggerContainerProps) {
  return (
    <motion.div
      variants={{
        ...containerVariants,
        visible: {
          ...containerVariants.visible,
          transition: {
            staggerChildren: 0.07,
            delayChildren: delay,
          },
        },
      }}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Simple fade-in wrapper for individual elements
 */
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function FadeIn({ children, delay = 0, className, direction = 'up' }: FadeInProps) {
  const directionOffset = {
    up:    { y: 16, x: 0 },
    down:  { y: -16, x: 0 },
    left:  { y: 0, x: 16 },
    right: { y: 0, x: -16 },
    none:  { y: 0, x: 0 },
  }[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration: 0.38,
        delay,
        ease: 'easeOut' as const,
      }}
      className={className}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
