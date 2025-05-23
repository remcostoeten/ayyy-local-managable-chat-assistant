import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

export function ChatSettings() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2">
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogDescription>
            Customize your chat experience and AI behavior
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Stream Responses</Label>
              <div className="text-sm text-muted-foreground">
                See AI responses as they are generated
              </div>
            </div>
            <Switch />
          </div>
          
          <div className="space-y-2">
            <Label>Temperature</Label>
            <div className="text-sm text-muted-foreground mb-2">
              Controls randomness in responses (0 = focused, 1 = creative)
            </div>
            <Slider
              defaultValue={[0.7]}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Context Length</Label>
            <div className="text-sm text-muted-foreground mb-2">
              Number of previous messages to include
            </div>
            <Slider
              defaultValue={[10]}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Code Syntax Highlighting</Label>
              <div className="text-sm text-muted-foreground">
                Highlight code blocks in responses
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 