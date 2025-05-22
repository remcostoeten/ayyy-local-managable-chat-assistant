import ModelSettings from "@/components/admin/model-settings"
import ChatAssistantSettings from "@/components/admin/chat-assistant-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LLMSettings } from '@/components/admin/settings/LLMSettings';
import { RecommendationSettings } from '@/components/admin/settings/RecommendationSettings';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Tabs defaultValue="assistant" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assistant">Chat Assistant</TabsTrigger>
          <TabsTrigger value="model">Model Settings</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assistant" className="space-y-6">
          <ChatAssistantSettings />
        </TabsContent>
        
        <TabsContent value="model" className="space-y-6">
          <ModelSettings />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationSettings />
        </TabsContent>
      </Tabs>

      <LLMSettings />
    </div>
  )
}
