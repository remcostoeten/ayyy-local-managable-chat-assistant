import LRU from 'lru-cache';

interface CacheOptions {
  max: number;
  ttl: number;
}

export class EmbeddingCache {
  private cache: LRU<string, number[]>;
  private chunkCache: LRU<string, string[]>;
  private similarityCache: LRU<string, Array<{ articleId: number; similarity: number; chunkText: string }>>;

  constructor(options?: Partial<CacheOptions>) {
    const defaultOptions = {
      max: 500, // Maximum number of items
      ttl: 1000 * 60 * 60 * 24, // 24 hours
    };

    const opts = { ...defaultOptions, ...options };

    this.cache = new LRU({
      max: opts.max,
      ttl: opts.ttl,
    });

    this.chunkCache = new LRU({
      max: opts.max,
      ttl: opts.ttl,
    });

    this.similarityCache = new LRU({
      max: opts.max,
      ttl: opts.ttl,
    });
  }

  // Embedding cache methods
  getEmbedding(text: string): number[] | undefined {
    return this.cache.get(this.normalizeKey(text));
  }

  setEmbedding(text: string, embedding: number[]): void {
    this.cache.set(this.normalizeKey(text), embedding);
  }

  // Chunk cache methods
  getChunks(text: string): string[] | undefined {
    return this.chunkCache.get(this.normalizeKey(text));
  }

  setChunks(text: string, chunks: string[]): void {
    this.chunkCache.set(this.normalizeKey(text), chunks);
  }

  // Similarity cache methods
  getSimilarityResults(query: string): Array<{ articleId: number; similarity: number; chunkText: string }> | undefined {
    return this.similarityCache.get(this.normalizeKey(query));
  }

  setSimilarityResults(query: string, results: Array<{ articleId: number; similarity: number; chunkText: string }>): void {
    this.similarityCache.set(this.normalizeKey(query), results);
  }

  // Clear all caches
  clearAll(): void {
    this.cache.clear();
    this.chunkCache.clear();
    this.similarityCache.clear();
  }

  private normalizeKey(text: string): string {
    return text.toLowerCase().trim();
  }
}

// Create a singleton instance
export const embeddingCache = new EmbeddingCache(); 