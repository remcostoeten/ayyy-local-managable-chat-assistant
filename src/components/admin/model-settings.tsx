"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getModelSettings, updateModelSettings } from "@/app/actions/admin"
import { Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MODEL_DEFAULTS, AVAILABLE_MODELS } from "@/lib/config/model-defaults"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"
import { ModelStatusSkeleton } from "./model-status-skeleton"

interface ModelSettings {
  id: string
  model: string
  temperature: number
  systemPrompt: string
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}

interface ModelStatus {
  id: string
  isInstalled: boolean
  isLoaded: boolean
  error?: string
}

const defaultSettings: ModelSettings = MODEL_DEFAULTS

export default function ModelSettings() {
  const [settings, setSettings] = useState<ModelSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [modelStatus, setModelStatus] = useState<ModelStatus[]>([])
  const [isCheckingModels, setIsCheckingModels] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await getModelSettings()
        if (result.success && result.settings) {
          // Handle null values and type conversions
          setSettings({
            id: result.settings.id,
            model: result.settings.model,
            temperature: result.settings.temperature,
            systemPrompt: result.settings.systemPrompt,
            maxTokens: result.settings.maxTokens ?? MODEL_DEFAULTS.maxTokens,
            topP: result.settings.topP,
            frequencyPenalty: result.settings.frequencyPenalty,
            presencePenalty: result.settings.presencePenalty,
          })
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
    checkModelStatus()
  }, [])

  const checkModelStatus = async () => {
    setIsCheckingModels(true)
    try {
      const statuses: ModelStatus[] = []
      
      // First get all installed models
      const response = await fetch('http://localhost:11434/api/tags')
      if (!response.ok) {
        throw new Error('Failed to fetch models from Ollama')
      }
      const data = await response.json()
      const installedModels = data.models || []
      
      for (const model of AVAILABLE_MODELS) {
        try {
          // Check if model is installed (accounting for version tags)
          const isInstalled = installedModels.some((m: any) => 
            m.name.split(':')[0] === model.id || 
            m.model.split(':')[0] === model.id
          )

          // Only try to generate if the model is installed
          let isLoaded = false
          let error: string | undefined = undefined

          if (isInstalled) {
            try {
              const testResponse = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  model: model.id,
                  prompt: "test",
                  options: { temperature: 0.7, num_predict: 1 },
                  stream: false,
                }),
              })
              isLoaded = testResponse.ok
              if (!testResponse.ok) {
                error = await testResponse.text()
              }
            } catch (e) {
              error = e instanceof Error ? e.message : 'Failed to test model'
            }
          }

          statuses.push({
            id: model.id,
            isInstalled,
            isLoaded,
            error
          })
        } catch (error) {
          statuses.push({
            id: model.id,
            isInstalled: false,
            isLoaded: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      setModelStatus(statuses)
    } catch (error) {
      console.error('Error checking model status:', error)
      setMessage({
        type: "error",
        text: "Failed to check model status. Is Ollama running?"
      })
    } finally {
      setIsCheckingModels(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const result = await updateModelSettings(settings)
      if (result.success) {
        setMessage({ type: "success", text: "Instellingen succesvol opgeslagen" })
        checkModelStatus() // Refresh model status after saving
      } else {
        setMessage({ type: "error", text: result.error || "Er is een fout opgetreden" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Er is een fout opgetreden bij het opslaan" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleModelChange = (modelId: string) => {
    const model = AVAILABLE_MODELS.find(m => m.id === modelId)
    if (model) {
      setSettings(prev => ({
        ...prev,
        model: modelId,
        maxTokens: Math.min(prev.maxTokens, model.maxTokens)
      }))
    }
  }

  if (isLoading) {
    return <ModelStatusSkeleton />
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>AI Model Settings</CardTitle>
          <CardDescription>
            Configure the AI model and adjust the behavior as needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model Status */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Model Status</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={checkModelStatus}
                disabled={isCheckingModels}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingModels ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
            </div>
            <div className="grid gap-2">
              {modelStatus.map((status) => (
                <div key={status.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {status.isLoaded ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="font-medium">{
                      AVAILABLE_MODELS.find(m => m.id === status.id)?.name || status.id
                    }</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {status.isLoaded ? "Gereed" : 
                     status.isInstalled ? "Geïnstalleerd, niet geladen" : 
                     "Niet geïnstalleerd"}
                  </span>
                </div>
              ))}
            </div>
            {modelStatus.some(s => !s.isLoaded) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sommige modellen zijn niet beschikbaar</AlertTitle>
                <AlertDescription>
                  Voer <code className="text-sm">pnpm check-ollama</code> uit om de modellen te installeren en laden.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={settings.model}
              onValueChange={handleModelChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een model" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-gray-500">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Alle modellen draaien lokaal via Ollama voor optimale prestaties en privacy.
            </p>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">Instructions for the LLM.</Label>
            <Textarea
              id="systemPrompt"
              value={settings.systemPrompt}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              className="min-h-[200px]"
              placeholder="Voer de systeem instructies in..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Label htmlFor="temperature">Temperature</Label>
                <p>The higher the temperature, the more creative the model will be. Also known as psycheelic madness, will halucinate 100%.</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bepaalt de creativiteit en willekeurigheid van het model. Lagere waarden (0.1-0.5) geven consistentere antwoorden, hogere waarden (0.7-1.0) geven meer creatieve antwoorden.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm text-gray-500">{settings.temperature}</span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={[settings.temperature]}
              onValueChange={(value) => setSettings({ ...settings, temperature: value[0] })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="maxTokens">Maximum Tokens</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Het maximale aantal tokens (woorden en tekens) dat het model kan genereren in één antwoord. Hogere waarden staan langere antwoorden toe maar gebruiken meer rekenkracht.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="maxTokens"
              type="number"
              value={settings.maxTokens}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                const maxAllowed = AVAILABLE_MODELS.find(m => m.id === settings.model)?.maxTokens || 4096
                if (!isNaN(value) && value > 0 && value <= maxAllowed) {
                  setSettings(prev => ({ ...prev, maxTokens: value }))
                }
              }}
              min={1}
              max={AVAILABLE_MODELS.find(m => m.id === settings.model)?.maxTokens || 4096}
            />
            <p className="text-sm text-gray-500">
              Maximum tokens voor het geselecteerde model: {
                AVAILABLE_MODELS.find(m => m.id === settings.model)?.maxTokens || 4096
              }
            </p>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">Settings for nerds</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label htmlFor="topP">Top P</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Bepaalt de cumulatieve waarschijnlijkheid voor token sampling. Een lagere waarde maakt de output meer gefocust, een hogere waarde creatiever.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-gray-500">{settings.topP}</span>
              </div>
              <Slider
                id="topP"
                min={0}
                max={1}
                step={0.05}
                value={[settings.topP]}
                onValueChange={(value) => setSettings({ ...settings, topP: value[0] })}
              />
            </div>

            {/* Frequency Penalty */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label htmlFor="frequencyPenalty">Frequentie Penalty</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Vermindert de kans dat het model woorden herhaalt. Hogere waarden zorgen voor meer variatie in woordgebruik.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-gray-500">{settings.frequencyPenalty}</span>
              </div>
              <Slider
                id="frequencyPenalty"
                min={-2}
                max={2}
                step={0.1}
                value={[settings.frequencyPenalty]}
                onValueChange={(value) => setSettings({ ...settings, frequencyPenalty: value[0] })}
              />
            </div>

            {/* Presence Penalty */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label htmlFor="presencePenalty">Presence Penalty</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Vermindert de kans dat het model over dezelfde onderwerpen praat. Hogere waarden stimuleren het model om nieuwe onderwerpen te verkennen.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm text-gray-500">{settings.presencePenalty}</span>
              </div>
              <Slider
                id="presencePenalty"
                min={-2}
                max={2}
                step={0.1}
                value={[settings.presencePenalty]}
                onValueChange={(value) => setSettings({ ...settings, presencePenalty: value[0] })}
              />
            </div>
          </div>

          {/* Save Button and Message */}
          <div className="pt-6 space-y-4">
            {message && (
              <Alert variant={message.type === "success" ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {message.type === "success" ? "Succes" : "Fout"}
                </AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opslaan...
                </>
              ) : (
                "Instellingen Opslaan"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
} 