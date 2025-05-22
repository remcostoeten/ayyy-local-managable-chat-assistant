"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

export default function SettingsPanel() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState({
    chatTitle: "Ondersteuning",
    welcomeMessage: "Hoe kan ik je vandaag helpen?",
    showSuggestions: true,
    maxSuggestions: 3,
    allowUserFeedback: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    // Show success message or handle errors
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Instellingen</CardTitle>
          <CardDescription>Configureer de AI-ondersteuningsbot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="chatTitle">Chat titel</Label>
            <Input
              id="chatTitle"
              value={settings.chatTitle}
              onChange={(e) => setSettings({ ...settings, chatTitle: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Welkomstbericht</Label>
            <Input
              id="welcomeMessage"
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showSuggestions" className="cursor-pointer">
              Toon suggesties
            </Label>
            <Switch
              id="showSuggestions"
              checked={settings.showSuggestions}
              onCheckedChange={(checked) => setSettings({ ...settings, showSuggestions: checked })}
            />
          </div>

          {settings.showSuggestions && (
            <div className="space-y-2">
              <Label htmlFor="maxSuggestions">Maximum aantal suggesties</Label>
              <Input
                id="maxSuggestions"
                type="number"
                min={1}
                max={10}
                value={settings.maxSuggestions}
                onChange={(e) => setSettings({ ...settings, maxSuggestions: Number.parseInt(e.target.value) })}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="allowUserFeedback" className="cursor-pointer">
              Gebruikersfeedback toestaan
            </Label>
            <Switch
              id="allowUserFeedback"
              checked={settings.allowUserFeedback}
              onCheckedChange={(checked) => setSettings({ ...settings, allowUserFeedback: checked })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-700 hover:bg-purple-800">
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Opslaan...
              </>
            ) : (
              "Instellingen opslaan"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

