'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Archive, Trash2, MessageSquare, Search, Filter, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getChatSessions, updateSessionMetadata, createNewSession } from '@/app/actions/chat'

type ChatSession = {
  id: string
  title: string | null
  summary: string | null
  createdAt: Date
  lastAccessedAt: Date | null
  status: 'active' | 'archived' | 'deleted' | null
}

export default function ChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getChatSessions('admin')
      if (result.success && result.sessions) {
        setSessions(result.sessions)
      } else {
        setError(result.error || 'Failed to load sessions')
      }
    } catch (error) {
      setError('An error occurred while loading sessions')
      console.error('Chat sessions error:', error)
    }
    setLoading(false)
  }

  const handleArchive = async (sessionId: string) => {
    try {
      const result = await updateSessionMetadata(sessionId, { status: 'archived' })
      if (result.success) {
        await loadSessions()
      } else {
        setError(result.error || 'Failed to archive session')
      }
    } catch (error) {
      setError('An error occurred while archiving the session')
      console.error('Archive error:', error)
    }
  }

  const handleDelete = async (sessionId: string) => {
    try {
      const result = await updateSessionMetadata(sessionId, { status: 'deleted' })
      if (result.success) {
        await loadSessions()
      } else {
        setError(result.error || 'Failed to delete session')
      }
    } catch (error) {
      setError('An error occurred while deleting the session')
      console.error('Delete error:', error)
    }
  }

  const handleCreateNewSession = async () => {
    try {
      const result = await createNewSession('admin')
      if (result?.success) {
        await loadSessions()
      } else {
        setError('Failed to create new session')
      }
    } catch (error) {
      setError('An error occurred while creating a new session')
      console.error('Create session error:', error)
    }
  }

  const filteredSessions = sessions
    .filter(session => 
      (statusFilter === 'all' || session.status === statusFilter) &&
      (!searchQuery || 
        session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => 
      new Date(b.lastAccessedAt || b.createdAt).getTime() - 
      new Date(a.lastAccessedAt || a.createdAt).getTime()
    )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chat History</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[250px]"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: 'all' | 'active' | 'archived') => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateNewSession}>
            <MessageSquare className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 bg-muted/10 rounded-lg">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium mb-2">No chat sessions found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? "Try adjusting your search or filters"
              : "Start a new chat to begin"}
          </p>
          <Button onClick={handleCreateNewSession} variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Start New Chat
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{session.title || 'Untitled Chat'}</CardTitle>
                    <CardDescription>
                      Created: {format(new Date(session.createdAt), 'PPp')}
                      {session.lastAccessedAt && (
                        <> · Last active: {format(new Date(session.lastAccessedAt), 'PPp')}</>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(session.id)}
                      disabled={session.status === 'archived'}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {session.summary || 'No summary available'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 