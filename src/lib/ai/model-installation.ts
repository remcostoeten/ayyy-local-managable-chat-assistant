import { Model } from '@/core/types/models';

export interface ModelInstallationProgress {
    modelId: string;
    progress: number;
    status: 'pending' | 'downloading' | 'installing' | 'completed' | 'error';
    error?: string;
    downloadedBytes?: number;
    totalBytes?: number;
    speed?: number; // bytes per second
    eta?: number; // seconds
}

interface ModelDownloadInfo {
    url: string;
    checksum: string;
    size: number;
}

const MODEL_DOWNLOAD_INFO: Record<string, ModelDownloadInfo> = {
    'gpt-4': {
        url: 'https://api.openai.com/v1/models/gpt-4/download',
        checksum: 'sha256-...',
        size: 350 * 1024 * 1024 * 1024 // 350GB
    },
    'gpt-3.5-turbo': {
        url: 'https://api.openai.com/v1/models/gpt-3.5-turbo/download',
        checksum: 'sha256-...',
        size: 45 * 1024 * 1024 * 1024 // 45GB
    },
    // Add other model download info here
};

// Browser-compatible model installation functions
export async function installModels(
    modelIds: string[],
    onProgress?: (progress: ModelInstallationProgress) => void
): Promise<void> {
    for (const modelId of modelIds) {
        try {
            // Start installation
            onProgress?.({
                modelId,
                progress: 0,
                status: 'pending'
            });

            // Download model
            onProgress?.({
                modelId,
                progress: 0,
                status: 'downloading'
            });

            // Simulate download progress for now
            const modelInfo = MODEL_DOWNLOAD_INFO[modelId];
            if (!modelInfo) {
                throw new Error(`Download information not found for model: ${modelId}`);
            }

            // Simulate download with progress
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 500));
                const speed = Math.random() * 1000000 + 500000; // Random speed between 500KB/s and 1.5MB/s
                const eta = ((100 - i) / 10) * 0.5; // Rough ETA calculation

                onProgress?.({
                    modelId,
                    progress: i,
                    status: 'downloading',
                    downloadedBytes: (modelInfo.size * i) / 100,
                    totalBytes: modelInfo.size,
                    speed,
                    eta
                });
            }

            // Verify checksum
            onProgress?.({
                modelId,
                progress: 90,
                status: 'installing'
            });

            // Simulate installation
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Save installation info (in browser, we'd use localStorage or IndexedDB)
            await saveModelInstallation(modelId);

            onProgress?.({
                modelId,
                progress: 100,
                status: 'completed'
            });
        } catch (error) {
            onProgress?.({
                modelId,
                progress: 0,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
            throw error;
        }
    }
}

interface InstalledModelInfo {
    modelId: string;
    path: string;
    installedAt: string;
    lastUsed: string;
}

async function saveModelInstallation(modelId: string): Promise<void> {
    // In browser, we'd save to localStorage or IndexedDB
    const installedModels = getInstalledModelsFromStorage();

    installedModels.push({
        modelId,
        path: `/models/${modelId}.bin`,
        installedAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
    });

    localStorage.setItem('installed-models', JSON.stringify(installedModels));
}

function getInstalledModelsFromStorage(): InstalledModelInfo[] {
    try {
        const stored = localStorage.getItem('installed-models');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        return [];
    }
}

export async function getInstalledModels(): Promise<InstalledModelInfo[]> {
    return getInstalledModelsFromStorage();
}

export async function uninstallModel(modelId: string): Promise<void> {
    const installedModels = getInstalledModelsFromStorage();
    const updatedModels = installedModels.filter(m => m.modelId !== modelId);
    localStorage.setItem('installed-models', JSON.stringify(updatedModels));
}

export async function updateModelLastUsed(modelId: string): Promise<void> {
    const installedModels = getInstalledModelsFromStorage();
    const modelIndex = installedModels.findIndex(m => m.modelId === modelId);

    if (modelIndex === -1) {
        return;
    }

    installedModels[modelIndex].lastUsed = new Date().toISOString();
    localStorage.setItem('installed-models', JSON.stringify(installedModels));
}

interface ModelUsageStats {
    modelId: string;
    totalTokens: number;
    totalRequests: number;
    averageLatency: number;
    lastUsed: string;
    costEstimate: number;
    usageByDay: {
        date: string;
        tokens: number;
        requests: number;
    }[];
}

interface ModelUsageEvent {
    modelId: string;
    timestamp: string;
    tokens: number;
    latencyMs: number;
    success: boolean;
    error?: string;
}

async function recordModelUsage(event: ModelUsageEvent): Promise<void> {
    const stats = getUsageStatsFromStorage();

    const modelStats = stats[event.modelId] || {
        modelId: event.modelId,
        totalTokens: 0,
        totalRequests: 0,
        averageLatency: 0,
        lastUsed: '',
        costEstimate: 0,
        usageByDay: []
    };

    // Update total stats
    modelStats.totalTokens += event.tokens;
    modelStats.totalRequests += 1;
    modelStats.lastUsed = event.timestamp;

    // Update average latency
    modelStats.averageLatency = (
        (modelStats.averageLatency * (modelStats.totalRequests - 1) + event.latencyMs) /
        modelStats.totalRequests
    );

    // Update daily stats
    const date = event.timestamp.split('T')[0];
    const dayStats = modelStats.usageByDay.find(d => d.date === date);
    if (dayStats) {
        dayStats.tokens += event.tokens;
        dayStats.requests += 1;
    } else {
        modelStats.usageByDay.push({
            date,
            tokens: event.tokens,
            requests: 1
        });
    }

    // Keep only last 30 days of daily stats
    modelStats.usageByDay = modelStats.usageByDay
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 30);

    // Update cost estimate (example rates, adjust based on actual model pricing)
    const rates: Record<string, number> = {
        'gpt-4': 0.03,      // $0.03 per 1K tokens
        'gpt-3.5-turbo': 0.002  // $0.002 per 1K tokens
    };

    modelStats.costEstimate = (modelStats.totalTokens / 1000) * (rates[event.modelId] || 0);

    // Save updated stats
    stats[event.modelId] = modelStats;
    localStorage.setItem('usage-stats', JSON.stringify(stats));

    // Also update last used timestamp in installation info
    await updateModelLastUsed(event.modelId);
}

function getUsageStatsFromStorage(): Record<string, ModelUsageStats> {
    try {
        const stored = localStorage.getItem('usage-stats');
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        return {};
    }
}

export async function getModelUsageStats(modelId: string): Promise<ModelUsageStats | null> {
    const stats = getUsageStatsFromStorage();
    return stats[modelId] || null;
}

export async function getAllModelUsageStats(): Promise<ModelUsageStats[]> {
    const stats = getUsageStatsFromStorage();
    return Object.values(stats);
}

// Export the recordModelUsage function for use in the API routes
export { recordModelUsage, ModelUsageEvent, ModelUsageStats }; 