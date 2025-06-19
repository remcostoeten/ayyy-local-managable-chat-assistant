'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bot } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your AI assistant and system settings
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Model Settings
              </CardTitle>
              <CardDescription>
                Manage your AI models and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Installed Models</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage your installed AI models
                  </p>
                </div>
                <Button asChild>
                  <a href="/admin/models">Manage Models</a>
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Model Statistics</h3>
                  <p className="text-sm text-muted-foreground">
                    View usage statistics and performance metrics
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <a href="/admin/models/stats">View Stats</a>
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Install New Models</h3>
                  <p className="text-sm text-muted-foreground">
                    Add new AI models to your system
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <a href="/setup">Install Models</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                General system configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  System settings will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
