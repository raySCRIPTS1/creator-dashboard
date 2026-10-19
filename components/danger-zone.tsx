'use client'

import { Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { deleteAllData } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

export function DangerZone() {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [pending, start] = useTransition()

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" aria-hidden />
        Delete all data
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setConfirm('')
        }}
        title="Delete all workspace data?"
        description="This permanently removes every account, stats entry and transaction. Your login stays active."
      >
        <label htmlFor="confirm" className="label">
          Type DELETE to confirm
        </label>
        <input id="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field" autoComplete="off" />
        <Button
          variant="danger"
          className="mt-4 h-11 w-full"
          disabled={confirm !== 'DELETE' || pending}
          onClick={() =>
            start(async () => {
              const res = await deleteAllData()
              if (res.ok) {
                toast.success('Workspace cleared')
                setOpen(false)
                setConfirm('')
              } else toast.error(res.error)
            })
          }
        >
          Permanently delete
        </Button>
      </Dialog>
    </>
  )
}
