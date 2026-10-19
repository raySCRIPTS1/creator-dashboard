'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, title, description, children }: Props) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  className="pointer-events-auto w-full max-w-md rounded-t-3xl border bg-surface p-6 shadow-2xl shadow-black/60 sm:rounded-2xl"
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.15 } }}
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <DialogPrimitive.Title className="text-lg font-semibold tracking-tight">{title}</DialogPrimitive.Title>
                      {description ? (
                        <DialogPrimitive.Description className="mt-1 text-sm leading-relaxed text-muted">
                          {description}
                        </DialogPrimitive.Description>
                      ) : (
                        <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
                      )}
                    </div>
                    <DialogPrimitive.Close className="-m-1 rounded-lg p-1.5 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground">
                      <X className="size-4" />
                      <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                  </div>
                  {children}
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
