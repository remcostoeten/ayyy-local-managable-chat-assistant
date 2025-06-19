'use client';

import { ModelSelectionSetup } from '@/components/admin/settings/ModelSelectionSetup';
import { Card } from '@/components/ui/card';

export default function SetupPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl p-6">
                <div className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">Welcome to AYCL Setup</h1>
                        <p className="text-muted-foreground mt-2">
                            Let's get your AI assistant configured with the models you need.
                        </p>
                    </div>

                    <ModelSelectionSetup />
                </div>
            </Card>
        </div>
    );
} 