import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

const typeClasses: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
}

export function Toast({ message, type = 'info', duration = 3500, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 flex items-center gap-3
        rounded-lg border px-4 py-3 shadow-lg text-sm font-medium
        transition-all duration-300
        ${typeClasses[type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {message}
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="ml-2 text-lg leading-none opacity-60 hover:opacity-100">
        ×
      </button>
    </div>
  )
}

// Simple toast manager hook
import { create } from 'zustand'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: ToastItem[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') =>
    set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), message, type }] })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()
  return (
    <>
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </>
  )
}
