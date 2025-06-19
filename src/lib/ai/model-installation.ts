import { Model } from '@/core/types/models';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

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

const MODELS_DIR = path.join(os.homedir(), '.aycl', 'models');
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks for progress updates

async function ensureModelsDirectory() {
    try {
        await fs.mkdir(MODELS_DIR, { recursive: true });
    } catch (error) {
        console.error('Failed to create models directory:', error);
        throw new Error('Failed to create models directory');
    }
}

async function checkDiskSpace(requiredSpace: number): Promise<boolean> {
    try {
        const stats = await fs.statfs(MODELS_DIR);
        const availableSpace = stats.bfree * stats.bsize;
        return availableSpace >= requiredSpace;
    } catch (error) {
        console.error('Failed to check disk space:', error);
        return false;
    }
}

async function downloadModel(
    modelId: string,
    onProgress: (progress: number, stats: { downloadedBytes: number; totalBytes: number; speed: number; eta: number }) => void
): Promise<string> {
    const modelInfo = MODEL_DOWNLOAD_INFO[modelId];
    if (!modelInfo) {
        throw new Error(`Download information not found for model: ${modelId}`);
    }

    const modelPath = path.join(MODELS_DIR, `${modelId}.bin`);
    const tempPath = `${modelPath}.tmp`;

    const startTime = Date.now();
    let lastUpdate = startTime;
    let downloadedBytes = 0;
    let lastDownloadedBytes = 0;

    try {
        const response = await fetch(modelInfo.url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.body) throw new Error('Response body is null');

        const totalBytes = Number(response.headers.get('content-length')) || modelInfo.size;
        const writer = createWriteStream(tempPath);
        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            writer.write(value);
            downloadedBytes += value.length;

            // Calculate progress and speed every second
            const now = Date.now();
            if (now - lastUpdate >= 1000) {
                const elapsedSeconds = (now - startTime) / 1000;
                const speed = downloadedBytes / elapsedSeconds; // bytes per second
                const remainingBytes = totalBytes - downloadedBytes;
                const eta = remainingBytes / speed;

                const progress = (downloadedBytes / totalBytes) * 100;
                onProgress(progress, {
                    downloadedBytes,
                    totalBytes,
                    speed,
                    eta
                });

                lastUpdate = now;
                lastDownloadedBytes = downloadedBytes;
            }
        }

        writer.end();
        await fs.rename(tempPath, modelPath);
        return modelPath;
    } catch (error) {
        // Clean up temp file if download failed
        try {
            await fs.unlink(tempPath);
        } catch (e) {
            // Ignore cleanup errors
        }
        throw error;
    }
}

async function verifyChecksum(filePath: string, expectedChecksum: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = createReadStream(filePath);

        stream.on('data', (data) => {
            hash.update(data);
        });

        stream.on('end', () => {
            const fileHash = hash.digest('hex');
            resolve(`sha256-${fileHash}` === expectedChecksum);
        });

        stream.on('error', reject);
    });
}

export async function installModels(
    modelIds: string[],
    onProgress?: (progress: ModelInstallationProgress) => void
): Promise<void> {
    await ensureModelsDirectory();

    // Calculate total required space
    const totalRequiredSpace = modelIds.reduce((acc, modelId) => {
        const modelInfo = MODEL_DOWNLOAD_INFO[modelId];
        return acc + (modelInfo?.size || 0);
    }, 0);

    // Check available space
    const hasSpace = await checkDiskSpace(totalRequiredSpace);
    if (!hasSpace) {
        throw new Error('Insufficient disk space for model installation');
    }

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

            const modelPath = await downloadModel(modelId, (downloadProgress, stats) => {
                onProgress?.({
                    modelId,
                    progress: downloadProgress,
                    status: 'downloading',
                    downloadedBytes: stats.downloadedBytes,
                    totalBytes: stats.totalBytes,
                    speed: stats.speed,
                    eta: stats.eta
                });
            });

            // Verify checksum
            onProgress?.({
                modelId,
                progress: 90,
                status: 'installing'
            });

            const isValid = await verifyChecksum(modelPath, MODEL_DOWNLOAD_INFO[modelId].checksum);
            if (!isValid) {
                throw new Error('Model file verification failed');
            }

            // Save installation info
            await saveModelInstallation(modelId, modelPath);

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

async function saveModelInstallation(modelId: string, modelPath: string): Promise<void> {
    const infoPath = path.join(MODELS_DIR, 'installed-models.json');
    let installedModels: InstalledModelInfo[] = [];

    try {
        const content = await fs.readFile(infoPath, 'utf-8');
        installedModels = JSON.parse(content);
    } catch (error) {
        // File doesn't exist or is invalid, start with empty array
    }

    installedModels = installedModels.filter(m => m.modelId !== modelId);
    installedModels.push({
        modelId,
        path: modelPath,
        installedAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
    });

    await fs.writeFile(infoPath, JSON.stringify(installedModels, null, 2));
}

export async function getInstalledModels(): Promise<InstalledModelInfo[]> {
    try {
        const infoPath = path.join(MODELS_DIR, 'installed-models.json');
        const content = await fs.readFile(infoPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return [];
    }
}

export async function uninstallModel(modelId: string): Promise<void> {
    const installedModels = await getInstalledModels();
    const modelInfo = installedModels.find(m => m.modelId === modelId);

    if (!modelInfo) {
        throw new Error('Model not found');
    }

    try {
        // Remove model file
        await fs.unlink(modelInfo.path);

        // Update installed models list
        const updatedModels = installedModels.filter(m => m.modelId !== modelId);
        const infoPath = path.join(MODELS_DIR, 'installed-models.json');
        await fs.writeFile(infoPath, JSON.stringify(updatedModels, null, 2));
    } catch (error) {
        console.error('Failed to uninstall model:', error);
        throw new Error('Failed to uninstall model');
    }
}

export async function updateModelLastUsed(modelId: string): Promise<void> {
    const installedModels = await getInstalledModels();
    const modelIndex = installedModels.findIndex(m => m.modelId === modelId);

    if (modelIndex === -1) {
        return;
    }

    installedModels[modelIndex].lastUsed = new Date().toISOString();
    const infoPath = path.join(MODELS_DIR, 'installed-models.json');
    await fs.writeFile(infoPath, JSON.stringify(installedModels, null, 2));
}

export async function getModelDetails(modelId: string): Promise<Model | null> {
    // TODO: Implement fetching detailed model information
    return null;
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
    const statsPath = path.join(MODELS_DIR, 'usage-stats.json');
    let stats: Record<string, ModelUsageStats> = {};

    try {
        const content = await fs.readFile(statsPath, 'utf-8');
        stats = JSON.parse(content);
    } catch (error) {
        // File doesn't exist or is invalid, start with empty object
    }

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
    await fs.writeFile(statsPath, JSON.stringify(stats, null, 2));

    // Also update last used timestamp in installation info
    await updateModelLastUsed(event.modelId);
}

export async function getModelUsageStats(modelId: string): Promise<ModelUsageStats | null> {
    try {
        const statsPath = path.join(MODELS_DIR, 'usage-stats.json');
        const content = await fs.readFile(statsPath, 'utf-8');
        const stats = JSON.parse(content);
        return stats[modelId] || null;
    } catch (error) {
        return null;
    }
}

export async function getAllModelUsageStats(): Promise<ModelUsageStats[]> {
    try {
        const statsPath = path.join(MODELS_DIR, 'usage-stats.json');
        const content = await fs.readFile(statsPath, 'utf-8');
        const stats = JSON.parse(content);
        return Object.values(stats);
    } catch (error) {
        return [];
    }
}

// Export the recordModelUsage function for use in the API routes
export { recordModelUsage, ModelUsageEvent, ModelUsageStats }; 