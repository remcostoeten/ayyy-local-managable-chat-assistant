'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllModelUsageStats, ModelUsageStats } from '@/lib/ai/model-installation';
import { formatDistanceToNow, format } from 'date-fns';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

function formatNumber(num: number): string {
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
}

function formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export default function ModelStatsPage() {
    const [stats, setStats] = React.useState<ModelUsageStats[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const modelStats = await getAllModelUsageStats();
                setStats(modelStats);
            } catch (err) {
                setError('Failed to load model statistics');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Model Usage Statistics</h1>
                    <p className="text-muted-foreground mt-2">
                        Monitor your AI model usage and costs
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid gap-6">
                    {/* Summary Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatNumber(stats.reduce((acc, s) => acc + s.totalRequests, 0))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatNumber(stats.reduce((acc, s) => acc + s.totalTokens, 0))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${stats.reduce((acc, s) => acc + s.costEstimate, 0).toFixed(2)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Latency</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {(stats.reduce((acc, s) => acc + s.averageLatency, 0) / stats.length || 0).toFixed(0)}ms
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Per-Model Stats */}
                    {stats.map((modelStats) => (
                        <Card key={modelStats.modelId}>
                            <CardHeader>
                                <CardTitle>{modelStats.modelId}</CardTitle>
                                <CardDescription>
                                    Last used {formatDistanceToNow(new Date(modelStats.lastUsed))} ago
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="usage">
                                    <TabsList>
                                        <TabsTrigger value="usage">Usage</TabsTrigger>
                                        <TabsTrigger value="costs">Costs</TabsTrigger>
                                        <TabsTrigger value="performance">Performance</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="usage" className="space-y-4">
                                        <div className="h-[200px] mt-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={modelStats.usageByDay}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                                    />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="tokens"
                                                        stroke="#8884d8"
                                                        name="Tokens"
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="requests"
                                                        stroke="#82ca9d"
                                                        name="Requests"
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium">Total Tokens</p>
                                                <p className="text-2xl font-bold">{formatNumber(modelStats.totalTokens)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Total Requests</p>
                                                <p className="text-2xl font-bold">{formatNumber(modelStats.totalRequests)}</p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="costs">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium">Total Cost</p>
                                                <p className="text-2xl font-bold">${modelStats.costEstimate.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Cost per 1K tokens</p>
                                                <p className="text-lg">
                                                    ${((modelStats.costEstimate * 1000) / modelStats.totalTokens).toFixed(3)}
                                                </p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="performance">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium">Average Latency</p>
                                                <p className="text-2xl font-bold">{modelStats.averageLatency.toFixed(0)}ms</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Tokens per Second</p>
                                                <p className="text-lg">
                                                    {formatNumber(Math.round((modelStats.totalTokens * 1000) / modelStats.averageLatency))}
                                                </p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
} 