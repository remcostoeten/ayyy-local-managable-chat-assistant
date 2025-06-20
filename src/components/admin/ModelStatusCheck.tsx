import { useState, useEffect } from 'react'
import { StatusWrapper } from '@/components/admin/status-wrapper'
import { ModelStatusSkeleton } from './model-status-skeleton'

export interface ModelStatusCheckProps {
  className?: string
  refreshInterval?: number
}

export interface StatusState {
  connected: boolean
  error?: string
  name?: string
}

export function ModelStatusCheck({ className = "", refreshInterval = 30000 }: ModelStatusCheckProps) {
  const [llmStatus, setLlmStatus] = useState<StatusState>({ connected: false })
  const [isCheckingLlm, setIsCheckingLlm] = useState(true)

  useEffect(() => {
    async function checkConnections() {
      try {
        const llmResponse = await fetch('/api/check-llm')
        const llmData = await llmResponse.json()
        setLlmStatus(llmData)
      } catch (error) {
        console.error('Connection check error:', error)
        setLlmStatus({ connected: false, error: 'Failed to check LLM connection' })
      } finally {
        setIsCheckingLlm(false)
      }
    }

    checkConnections()

    // Set up periodic checks based on the refreshInterval prop
    const interval = setInterval(checkConnections, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return (
    <div className={`space-y-2 ${className}`}>
      {isCheckingLlm ? (
        <ModelStatusSkeleton />
      ) : (
        <StatusWrapper
          isChecking={false}
          dbStatus={llmStatus}
          name="LLM"
          className="bg-muted/50"
        />
      )}
    </div>
  )
} 