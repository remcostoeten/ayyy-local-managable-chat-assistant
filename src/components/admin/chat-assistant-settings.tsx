"use client"

import React, {useState, useEffect} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Loader2, Upload, Trash2, Plus, Check } from "lucide-react"
import { toast } from "sonner"

interface ChatAssistantSettings {
  id: string;
  name: string;
  description: string;
  status: "away" | "active" | "inactive";
  avatar: string;
}

const ChatAssistantSettings: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [settings, setSettings] = React.useState<ChatAssistantSettings>({
    id: "",
    name: "",
    description: "",
    status: "inactive",
    avatar: ""
  })

  const loadSettings = React.useCallback(async () => {
    try {
      const response = await fetch('/api/admin/chat-assistant')
      const data = await response.json()
      
      if (data.success && data.chatAssistant) {
        setSettings({
          id: data.chatAssistant.id,
          name: data.chatAssistant.name,
          description: data.chatAssistant.description || "",
          status: data.chatAssistant.status || "inactive",
          avatar: data.chatAssistant.avatar || ""
        })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast.error("Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadSettings()
  }, [loadSettings])

  React.useEffect(() => {
    setSaved(false)
  }, [settings])

  const handleCreate = async () => {
    setIsSaving(true)
    setSaved(false)

    try {
      const response = await fetch('/api/admin/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.name,
          description: settings.description,
          status: settings.status,
          avatar: settings.avatar
        })
      })

      const data = await response.json()

      if (data.success) {
        setSettings(prev => ({ ...prev, id: data.chatAssistant.id }))
        setSaved(true)
        toast.success("Chat assistant created successfully")
      } else {
        throw new Error(data.error || "Failed to create chat assistant")
      }
    } catch (error) {
      console.error("Error creating chat assistant:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create chat assistant")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async () => {
    setIsSaving(true)
    setSaved(false)

    try {
      const response = await fetch('/api/admin/chat-assistant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: settings.id,
          name: settings.name,
          description: settings.description,
          status: settings.status,
          avatar: settings.avatar
        })
      })

      const data = await response.json()

      if (data.success) {
        setSaved(true)
        toast.success("Settings saved successfully")
      } else {
        throw new Error(data.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/chat-assistant?id=${settings.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setSettings({
          id: "",
          name: "",
          description: "",
          status: "inactive",
          avatar: ""
        })
        toast.success("Chat assistant deleted successfully")
      } else {
        throw new Error(data.error || "Failed to delete chat assistant")
      }
    } catch (error) {
      console.error("Error deleting chat assistant:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete chat assistant")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = (status: "away" | "active" | "inactive") => {
    setSettings((prev: ChatAssistantSettings) => ({ ...prev, status }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // TODO: Implement avatar upload to storage service
    // For now, we'll use a placeholder
    setSettings((prev: ChatAssistantSettings) => ({
      ...prev,
      avatar: URL.createObjectURL(file)
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={(e: React.FormEvent) => {
        e.preventDefault()
        settings.id ? handleUpdate() : handleCreate()
      }}>
        <CardHeader>
          <CardTitle>Chat Assistant Settings</CardTitle>
          <CardDescription>Configure your AI chat assistant's profile and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={settings.avatar} />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center space-x-2 rounded-md border px-3 py-2 hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  <span>Upload Avatar</span>
                </div>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isSaving}
                />
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              placeholder="AI Assistant"
              disabled={isSaving}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="A helpful AI assistant..."
              rows={3}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={settings.status}
              onValueChange={handleStatusChange}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                    Active
                  </div>
                </SelectItem>
                <SelectItem value="away">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                    Away
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-gray-500 mr-2" />
                    Inactive
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {settings.id ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" type="button" disabled={isSaving || isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Assistant
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the chat assistant.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <div /> /* Empty div for spacing */
          )}
          
          <Button 
            type="submit" 
            disabled={isSaving}
            className={saved ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : saved ? (
              <Check className="h-4 w-4 mr-2" />
            ) : settings.id ? (
              <Plus className="h-4 w-4 mr-2" />
            ) : null}
            {isSaving ? 'Saving...' : saved ? 'Saved' : settings.id ? 'Update Assistant' : 'Create Assistant'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default ChatAssistantSettings 