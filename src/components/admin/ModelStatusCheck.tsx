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
  const [dbStatus, setDbStatus] = useState<StatusState>({ connected: false })
  const [llmStatus, setLlmStatus] = useState<StatusState>({ connected: false })
  const [isCheckingDb, setIsCheckingDb] = useState(true)
  const [isCheckingLlm, setIsCheckingLlm] = useState(true)

  useEffect(() => {
    async function checkConnections() {
      try {
        const dbResponse = await fetch('/api/check-db')
        const dbData = await dbResponse.json()
        setDbStatus(dbData)

        const llmResponse = await fetch('/api/check-llm')
        const llmData = await llmResponse.json()
        setLlmStatus(llmData)
      } catch (error) {
        console.error('Connection check error:', error)
        setDbStatus({ connected: false, error: 'Failed to check database connection' })
        setLlmStatus({ connected: false, error: 'Failed to check LLM connection' })
      } finally {
        setIsCheckingDb(false)
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
      {isCheckingDb ? (
        <ModelStatusSkeleton />
      ) : (
        <StatusWrapper 
          isChecking={false}
          dbStatus={dbStatus}
          name="Database"
          className="bg-muted/50"
        />
      )}
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