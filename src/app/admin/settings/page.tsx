"use client";

import { useState, useEffect } from "react";
import { LoadingMessagesSettings } from "@/components/admin/settings/loading-messages";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assistantDefaults, isDevelopment, LoadingMessageType } from "@/lib/config/environment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import ModelSettings from "@/components/admin/model-settings"
import ChatAssistantSettings from "@/components/admin/chat-assistant-settings"
import { LLMSettings } from '@/components/admin/settings/LLMSettings';
import { RecommendationSettings } from '@/components/admin/settings/RecommendationSettings';

export default function AdminSettingsPage() {
  const defaultSettings = isDevelopment ? assistantDefaults.development : assistantDefaults.production;
  const { toast } = useToast();
  
  const [loadingMessages, setLoadingMessages] = useState<LoadingMessageType[]>(defaultSettings.loadingMessages);
  const [easterEggPercentage, setEasterEggPercentage] = useState<number>(defaultSettings.easterEggPercentage);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/loading-messages');
        const data = await response.json();
        
        if (data.success) {
          setLoadingMessages(data.messages);
          setEasterEggPercentage(data.percentage);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      }
    };

    fetchSettings();
  }, [toast]);

  const handleLoadingMessagesUpdate = async (messages: LoadingMessageType[], percentage: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/loading-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, percentage }),
      });

      const data = await response.json();
      
      if (data.success) {
        setLoadingMessages(messages);
        setEasterEggPercentage(percentage);
        toast({
          title: "Success",
          description: "Settings saved successfully",
        });
      } else {
        throw new Error(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Settings</h1>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="messages">Loading Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general settings for the chat assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add other general settings here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Loading Messages</CardTitle>
              <CardDescription>
                Configure the messages shown while the AI is thinking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoadingMessagesSettings
                messages={loadingMessages}
                percentage={easterEggPercentage}
                onUpdate={handleLoadingMessagesUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
