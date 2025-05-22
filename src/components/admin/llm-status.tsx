'use client'

import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TLLMStatusProps = {
  isChecking: boolean
  llmStatus: {
    connected: boolean
    model?: string
    status?: string
    error?: string
  }
  className?: string
}

export function LLMStatus({ isChecking, llmStatus, className }: TLLMStatusProps) {
  return (
    <div className={cn('mb-2 p-3 rounded-md bg-neutral-50 border border-neutral-200', className)}>
      <div className="flex items-center gap-2 mb-1">
        <Bot size={16} />
        <h2 className="font-medium">LLM Status</h2>
      </div>

      {isChecking ? (
        <p className="text-sm text-neutral-500">Checking...</p>
      ) : llmStatus.connected ? (
        <div>
          <p className="text-sm text-green-600">Connected</p>
          {llmStatus.model && (
            <p className="text-xs text-neutral-500 mt-1">
              Model: {llmStatus.model}
            </p>
          )}
          {llmStatus.status && (
            <p className="text-xs text-neutral-500">
              Status: {llmStatus.status}
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="text-sm text-red-600">Not connected</p>
          {llmStatus.error && <p className="text-xs text-neutral-500 mt-1">{llmStatus.error}</p>}
        </div>
      )}
    </div>
  )
} 