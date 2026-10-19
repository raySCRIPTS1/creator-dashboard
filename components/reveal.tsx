'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'

export function Stagger({ children, className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function Reveal({ children, className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14, filter: 'blur(4px)' },
        show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 28 } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
