import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Globe, Languages } from "lucide-react";
import { LoadingMessageType } from "@/lib/config/environment";

interface LoadingMessagesSettingsProps {
  messages: LoadingMessageType[];
  percentage: number;
  onUpdate: (messages: LoadingMessageType[], percentage: number) => void;
}

export function LoadingMessagesSettings({
  messages: initialMessages,
  percentage: initialPercentage,
  onUpdate
}: LoadingMessagesSettingsProps) {
  const [messages, setMessages] = useState<LoadingMessageType[]>(initialMessages);
  const [percentage, setPercentage] = useState(initialPercentage);

  const handleAddMessage = (lang: 'en' | 'nl') => {
    const newMessages = [...messages, { text: "", lang }];
    setMessages(newMessages);
    onUpdate(newMessages, percentage);
  };

  const handleRemoveMessage = (index: number) => {
    const newMessages = messages.filter((_, i) => i !== index);
    setMessages(newMessages);
    onUpdate(newMessages, percentage);
  };

  const handleUpdateMessage = (index: number, text: string) => {
    const newMessages = messages.map((msg, i) => 
      i === index ? { ...msg, text } : msg
    );
    setMessages(newMessages);
    onUpdate(newMessages, percentage);
  };

  const handlePercentageChange = (value: number[]) => {
    const newPercentage = value[0];
    setPercentage(newPercentage);
    onUpdate(messages, newPercentage);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Easter Egg Percentage</Label>
        <div className="text-sm text-muted-foreground mb-2">
          How often to show fun loading messages (0-100%)
        </div>
        <Slider
          value={[percentage]}
          max={100}
          step={5}
          className="w-full"
          onValueChange={handlePercentageChange}
        />
        <div className="text-sm text-muted-foreground mt-1">
          Current: {percentage}%
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Loading Messages</Label>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddMessage('nl')}
            >
              <Languages className="h-4 w-4 mr-2" />
              Add Dutch
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddMessage('en')}
            >
              <Globe className="h-4 w-4 mr-2" />
              Add English
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {messages.map((message, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`text-xs font-medium px-2 py-1 rounded ${
                      message.lang === 'nl' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {message.lang === 'nl' ? 'Dutch' : 'English'}
                    </div>
                  </div>
                  <Input
                    value={message.text}
                    onChange={(e) => handleUpdateMessage(index, e.target.value)}
                    placeholder={`Enter ${message.lang === 'nl' ? 'Dutch' : 'English'} message...`}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMessage(index)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 