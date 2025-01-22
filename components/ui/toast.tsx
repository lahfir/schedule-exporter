"use client"

import { useEffect, useState } from "react"

interface ToastProps {
  title: string
  description?: string
  variant?: "default" | "destructive"
  onClose?: () => void
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-lg p-4 shadow-lg transition-all ${variant === "destructive"
        ? "bg-red-600 text-white"
        : "bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
        }`}
    >
      <div className="font-medium">{title}</div>
      {description && (
        <div className="mt-1 text-sm opacity-90">{description}</div>
      )}
    </div>
  )
}

export function Toaster() {
  return null // We'll handle toasts through the hook directly
}
