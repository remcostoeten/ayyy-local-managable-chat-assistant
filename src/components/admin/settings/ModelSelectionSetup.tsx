'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { installModels, ModelInstallationProgress } from '@/lib/ai/model-installation';
import { useRouter } from 'next/navigation';

interface Model {
    id: string;
    name: string;
    sizeGB: number;
    description: string;
    recommended: boolean;
    useCase: string;
}

const availableModels: Model[] = [
    {
        id: "gpt-4",
        name: "GPT-4",
        sizeGB: 350,
        description: "Most capable model, best for complex tasks and reasoning",
        recommended: true,
        useCase: "Complex analysis, coding, and creative tasks"
    },
    {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        sizeGB: 45,
        description: "Fast and efficient for most general tasks",
        recommended: true,
        useCase: "General purpose, chat, and basic assistance"
    },
    {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        sizeGB: 150,
        description: "Advanced model with strong reasoning capabilities",
        recommended: true,
        useCase: "Detailed analysis and complex problem-solving"
    },
    {
        id: "mistral-medium",
        name: "Mistral Medium",
        sizeGB: 25,
        description: "Efficient open-source model",
        recommended: false,
        useCase: "General tasks with lower resource usage"
    },
    {
        id: "llama-2",
        name: "Llama 2",
        sizeGB: 30,
        description: "Open source model with good performance",
        recommended: false,
        useCase: "Local deployment and privacy-focused applications"
    }
];

export function ModelSelectionSetup(): React.ReactElement {
    const router = useRouter();
    const [selectedModels, setSelectedModels] = React.useState<string[]>([]);
    const [isInstalling, setIsInstalling] = React.useState(false);
    const [installationProgress, setInstallationProgress] = React.useState<Record<string, ModelInstallationProgress>>({});

    const totalSize = selectedModels.reduce((acc: number, modelId: string) => {
        const model = availableModels.find(m => m.id === modelId);
        return acc + (model?.sizeGB || 0);
    }, 0);

    const handleModelToggle = (modelId: string, checked: boolean) => {
        if (checked) {
            setSelectedModels([...selectedModels, modelId]);
        } else {
            setSelectedModels(selectedModels.filter((id: string) => id !== modelId));
        }
    };

    const handleInstall = async () => {
        setIsInstalling(true);
        try {
            await installModels(selectedModels, (progress) => {
                setInstallationProgress((prev: Record<string, ModelInstallationProgress>) => ({
                    ...prev,
                    [progress.modelId]: progress
                }));
            });

            // Wait a moment to show completion
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Redirect to the main app
            router.push('/chat');
        } catch (error) {
            console.error('Installation failed:', error);
            // You might want to show an error message to the user here
        }
        setIsInstalling(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Select AI Models to Install</h1>
            <p className="text-muted-foreground mb-4">
                Choose which AI models you want to install. Consider your hardware capabilities and use cases.
            </p>

            <div className="mb-6">
                <p className="text-sm font-medium">
                    Total selected size: {totalSize} GB
                </p>
            </div>

            <ScrollArea className="h-[600px] pr-4">
                <div className="grid gap-4">
                    {availableModels.map((model) => {
                        const progress = installationProgress[model.id];
                        const isSelected = selectedModels.includes(model.id);

                        return (
                            <Card key={model.id} className={model.recommended ? "border-primary" : ""}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Checkbox
                                                id={model.id}
                                                checked={isSelected}
                                                onCheckedChange={(checked) => handleModelToggle(model.id, checked as boolean)}
                                                disabled={isInstalling}
                                            />
                                            <label htmlFor={model.id} className="font-bold cursor-pointer">
                                                {model.name}
                                            </label>
                                            {model.recommended && (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                                    Recommended
                                                </span>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="mt-2">Size: {model.sizeGB} GB</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        <p>{model.description}</p>
                                        <p className="mt-2">
                                            <strong>Best for:</strong> {model.useCase}
                                        </p>
                                        {isSelected && progress && (
                                            <div className="mt-4">
                                                <Progress value={progress.progress} className="h-2" />
                                                <p className="text-xs mt-1 text-muted-foreground">
                                                    {progress.status === 'completed'
                                                        ? 'Installation complete'
                                                        : `${progress.status}: ${progress.progress}%`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </ScrollArea>

            <div className="mt-6 flex justify-end gap-4">
                <Button variant="outline" disabled={isInstalling}>
                    Cancel
                </Button>
                <Button
                    disabled={selectedModels.length === 0 || isInstalling}
                    onClick={handleInstall}
                >
                    {isInstalling
                        ? 'Installing Models...'
                        : `Install Selected Models (${selectedModels.length})`}
                </Button>
            </div>
        </div>
    );
} 