export interface Model {
    id: string;
    name: string;
    description: string;
    sizeGB: number;
    version: string;
    provider: string;
    capabilities: string[];
    requirements: {
        minRAM: number;  // in GB
        minDisk: number; // in GB
        recommendedGPU: boolean;
    };
    metadata: {
        lastUpdated: string;
        downloadCount: number;
        rating: number;
        tags: string[];
    };
} 