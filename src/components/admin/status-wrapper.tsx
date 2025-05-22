'use client'

import { Database, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TextShimmer } from '@/shared/ui/shimmer-text'

export type TStatusProps = {
  isChecking: boolean
  dbStatus: {
    connected: boolean
    error?: string
  }
  llmName?: string
  className?: string
  name: string
}

export function StatusWrapper({ isChecking, name, dbStatus, llmName, className }: TStatusProps) {
  const Icon = name === "LLM" ? Bot : Database
  
  return (
    <div className={cn('mb-2 p-2 rounded-md bg-background/50', className)}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className="text-muted-foreground" />
        <h2 className="text-sm font-medium">{name}</h2>
      </div>

      {isChecking ? (
        <p className="text-xs text-muted-foreground">Controleren...</p>
      ) : dbStatus.connected ? (
        <div className="text-xs">
          <TextShimmer duration={4} className='text-green-500'>
            {llmName ? `${llmName} - Connected` : 'Connected'}
          </TextShimmer>
        </div>
      ) : (
        <div>
          <p className="text-xs text-red-500">Niet verbonden</p>
          {dbStatus.error && (
            <p className="text-xs text-muted-foreground mt-1 break-words">
              {dbStatus.error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
