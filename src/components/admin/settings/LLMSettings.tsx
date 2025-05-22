'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { InfoIcon, ShieldCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type TPProvider = 'local' | 'groq' | 'openai';
type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-4';

interface LLMSettings {
  provider: Provider;
  apiKey?: string;
  openaiModel?: OpenAIModel;
}

export function LLMSettings() {
  const [settings, setSettings] = useState<LLMSettings>({
    provider: 'local',
    openaiModel: 'gpt-3.5-turbo'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const response = await fetch('/api/admin/llm-settings');
      const data = await response.json();
      if (data.settings) {
        setSettings({
          provider: data.settings.provider,
          apiKey: data.settings.apiKey || '',
          openaiModel: data.settings.openaiModel || 'gpt-3.5-turbo'
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/llm-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: settings.provider,
          apiKey: ['groq', 'openai'].includes(settings.provider) ? settings.apiKey : null,
          openaiModel: settings.provider === 'openai' ? settings.openaiModel : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      toast({
        title: 'Success',
        description: 'LLM settings updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderApiKeyInput = () => {
    if (!['groq', 'openai'].includes(settings.provider)) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="apiKey">{settings.provider === 'groq' ? 'Groq' : 'OpenAI'} API Key</Label>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-green-500">
                <ShieldCheck className="h-4 w-4" />
                <InfoIcon className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] space-y-2 p-4">
              <p className="font-medium">🔒 Secure Storage</p>
              <p>Your API key is encrypted using AES-256-GCM encryption before being stored in the database.</p>
              <p className="text-sm text-muted-foreground">This military-grade encryption ensures your API key remains secure at rest.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="apiKey"
          type="password"
          value={settings.apiKey}
          onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
          placeholder={`Enter your ${settings.provider === 'groq' ? 'Groq' : 'OpenAI'} API key`}
          className="font-mono"
        />
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>LLM Provider Settings</CardTitle>
          <CardDescription>
            Configure your preferred LLM provider and API settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={settings.provider}
                onValueChange={(value: Provider) => setSettings({ ...settings, provider: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local (Llama/Mistral)</SelectItem>
                  <SelectItem value="groq">Groq Cloud</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.provider === 'openai' && (
              <div className="space-y-2">
                <Label htmlFor="openaiModel">OpenAI Model</Label>
                <Select
                  value={settings.openaiModel}
                  onValueChange={(value: OpenAIModel) => setSettings({ ...settings, openaiModel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select OpenAI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {renderApiKeyInput()}

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 