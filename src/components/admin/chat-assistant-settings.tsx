"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"
import { updateChatAssistant, updateStatus } from "@/api/mutations/update-chat-assistant"
import { getChatAssistant } from "@/api/queries/get-chat-assistant"
import { toast } from "sonner"

interface ChatAssistantSettings {
  id: string
  name: string
  description: string
  status: "away" | "active" | "inactive"
  avatar: string
}

export default function ChatAssistantSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<ChatAssistantSettings>({
    id: "default",
    name: "",
    description: "",
    status: "inactive",
    avatar: ""
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await getChatAssistant()
      if (response.success && response.chatAssistant) {
        setSettings({
          id: response.chatAssistant.id,
          name: response.chatAssistant.name,
          description: response.chatAssistant.description,
          status: response.chatAssistant.status || "inactive",
          avatar: response.chatAssistant.avatar
        })
      } else {
        toast.error("Failed to load chat assistant settings")
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast.error("Error loading settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await updateChatAssistant(settings.id, {
        name: settings.name,
        description: settings.description,
        status: settings.status,
        avatar: settings.avatar
      })

      if (response.success) {
        toast.success("Settings saved successfully")
      } else {
        toast.error(response.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Error saving settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (status: "away" | "active" | "inactive") => {
    try {
      const response = await updateStatus({
        id: settings.id,
        status
      })

      if (response.success) {
        setSettings(prev => ({ ...prev, status }))
        toast.success("Status updated successfully")
      } else {
        toast.error(response.error || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Error updating status")
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // TODO: Implement avatar upload to storage service
    // For now, we'll use a placeholder
    setSettings(prev => ({
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
      <form onSubmit={handleSubmit}>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={settings.status}
              onValueChange={(value: "away" | "active" | "inactive") => handleStatusChange(value)}
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
        <CardFooter>
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 