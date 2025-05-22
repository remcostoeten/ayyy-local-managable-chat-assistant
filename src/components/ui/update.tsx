import { useState, useEffect } from "react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const STORAGE_KEY = "demo_alert_understood"

function AlertVersionUpdate() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const hasUnderstood = localStorage.getItem(STORAGE_KEY)
    if (hasUnderstood) {
      setIsVisible(false)
    }
  }, [])

  const handleUnderstood = () => {
    localStorage.setItem(STORAGE_KEY, "true")
    setIsVisible(false)
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "100%" }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50, x: "100%" }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 30
          }}
          className="fixed bottom-4 right-4 z-50 min-w-[400px]"
        >
          <Alert variant="default" role="alert" className="shadow-lg">
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-3">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                  aria-hidden="true"
                >
                  <RefreshCw className="opacity-60" size={16} strokeWidth={2} />
                </motion.div>
                <div className="flex grow flex-col gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">This is not the real AYCL site!</p>
                    <p className="text-sm text-muted-foreground">
                      This is soley a demo site to showcase what LLM's can do.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button size="sm" onClick={handleUnderstood}>Understood</Button>
                    </motion.div>
                  </div>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  className="group -my-1.5 -me-2 size-8 p-0 hover:bg-transparent"
                  aria-label="Close notification"
                  onClick={handleClose}
                >
                  <X
                    size={16}
                    strokeWidth={2}
                    className="opacity-60 transition-opacity group-hover:opacity-100"
                  />
                </Button>
              </motion.div>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { AlertVersionUpdate }