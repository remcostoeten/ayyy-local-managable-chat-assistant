'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Loader2, Archive, Trash2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { getChatSessions, updateSessionMetadata } from '@/app/actions/chat'
import { StatusWrapper } from '@/components/admin/status-wrapper'

type ChatSession = {
  id: string
  title: string | null
  summary: string | null
  createdAt: Date
  lastAccessedAt: Date | null
  status: 'active' | 'archived' | 'deleted' | null
}

export function ChatHistory({
  userId,
  onSessionSelect,
  currentSessionId,
  dbStatus = { connected: false },
  isCheckingDb = false,
  llmName = 'GPT-3.5 Turbo',
}: {
  userId: string
  onSessionSelect: (sessionId: string) => void
  currentSessionId?: string
  dbStatus?: { connected: boolean; error?: string }
  isCheckingDb?: boolean
  llmName?: string
}) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [userId])

  const loadSessions = async () => {
    setLoading(true)
    const result = await getChatSessions(userId)
    if (result.success && result.sessions) {
      setSessions(result.sessions.filter((s): s is ChatSession => s !== null))
    } else {
      setError(result.error || 'Unknown error occurred')
    }
    setLoading(false)
  }

  const handleArchive = async (sessionId: string) => {
    const result = await updateSessionMetadata(sessionId, { status: 'archived' })
    if (result.success) {
      loadSessions()
    }
  }

  const handleDelete = async (sessionId: string) => {
    const result = await updateSessionMetadata(sessionId, { status: 'deleted' })
    if (result.success) {
      loadSessions()
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 text-red-500">
          Error loading chat history: {error}
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className={`cursor-pointer transition-colors hover:bg-accent ${
                currentSessionId === session.id ? 'border-primary' : ''
              }`}
              onClick={() => onSessionSelect(session.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{session.title || 'Untitled Session'}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArchive(session.id)
                      }}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(session.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {session.lastAccessedAt ? format(new Date(session.lastAccessedAt), 'PPp') : 'Never accessed'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {session.summary || 'No summary available'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 