import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '@/store/toastStore'

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  const bgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-600'
      case 'error':
        return 'bg-red-600'
      case 'info':
        return 'bg-blue-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            transition={{ duration: 0.3 }}
            onClick={() => removeToast(toast.id)}
            className={`${bgColor(toast.type)} text-white px-6 py-4 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow flex items-center gap-3 max-w-xs`}
          >
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              className="text-white/70 hover:text-white"
              onClick={(e) => {
                e.stopPropagation()
                removeToast(toast.id)
              }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
