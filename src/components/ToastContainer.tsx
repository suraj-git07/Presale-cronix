import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '@/store/toastStore'

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  const getToastStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20',
          border: 'border border-emerald-500/50',
          shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
          text: 'text-emerald-100'
        }
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500/20 to-pink-500/20',
          border: 'border border-red-500/50',
          shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
          text: 'text-red-100'
        }
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20',
          border: 'border border-cyan-500/50',
          shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
          text: 'text-cyan-100'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20',
          border: 'border border-purple-500/50',
          shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
          text: 'text-purple-100'
        }
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = getToastStyle(toast.type)
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 20, x: 20 }}
              transition={{ duration: 0.3 }}
              onClick={() => removeToast(toast.id)}
              className={`${style.bg} ${style.border} ${style.shadow} ${style.text} px-6 py-4 rounded-lg cursor-pointer hover:shadow-xl transition-all duration-200 flex items-center gap-3 max-w-xs backdrop-blur-sm font-[family-name:var(--font-orbitron)] font-semibold text-sm`}
            >
              <span className="flex-1">{toast.message}</span>
              <button
                className="text-current/70 hover:text-current transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  removeToast(toast.id)
                }}
              >
                ✕
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
