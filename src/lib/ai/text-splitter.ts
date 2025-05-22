interface ChunkOptions {
  chunkSize: number;
  chunkOverlap: number;
  minChunkLength: number;
  splitOnNewline: boolean;
}

export class TextSplitter {
  private options: ChunkOptions;

  constructor(options?: Partial<ChunkOptions>) {
    this.options = {
      chunkSize: 500,
      chunkOverlap: 100,
      minChunkLength: 50,
      splitOnNewline: true,
      ...options,
    };
  }

  splitText(text: string): string[] {
    // Normalize text
    const normalizedText = text.trim().replace(/\s+/g, ' ');
    
    if (normalizedText.length <= this.options.chunkSize) {
      return [normalizedText];
    }

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < normalizedText.length) {
      let endIndex = this.findOptimalSplitPoint(
        normalizedText,
        startIndex,
        Math.min(startIndex + this.options.chunkSize, normalizedText.length)
      );

      // Ensure minimum chunk length
      if (endIndex - startIndex < this.options.minChunkLength && chunks.length > 0) {
        // Append to previous chunk if possible
        const lastChunk = chunks.pop()!;
        chunks.push(lastChunk + ' ' + normalizedText.slice(startIndex, endIndex));
      } else {
        chunks.push(normalizedText.slice(startIndex, endIndex));
      }

      // Move start index for next chunk, accounting for overlap
      startIndex = endIndex - this.options.chunkOverlap;
    }

    return this.postProcessChunks(chunks);
  }

  private findOptimalSplitPoint(text: string, start: number, end: number): number {
    // Try to split on sentence boundaries first
    const sentenceEnd = text.slice(start, end).search(/[.!?]\s/);
    if (sentenceEnd !== -1 && sentenceEnd > this.options.minChunkLength) {
      return start + sentenceEnd + 2; // +2 to include the punctuation and space
    }

    // Then try paragraph boundaries
    if (this.options.splitOnNewline) {
      const newlinePos = text.slice(start, end).search(/\n/);
      if (newlinePos !== -1 && newlinePos > this.options.minChunkLength) {
        return start + newlinePos + 1;
      }
    }

    // Fall back to word boundaries
    const lastSpace = text.slice(start, end).lastIndexOf(' ');
    if (lastSpace !== -1) {
      return start + lastSpace + 1;
    }

    // If no good split point found, just split at max length
    return end;
  }

  private postProcessChunks(chunks: string[]): string[] {
    return chunks.map(chunk => {
      // Remove extra whitespace
      chunk = chunk.trim().replace(/\s+/g, ' ');
      
      // Ensure chunks end with proper punctuation
      if (!chunk.match(/[.!?]$/)) {
        chunk = chunk + '...';
      }
      
      return chunk;
    });
  }

  // Utility method to estimate token count (rough approximation)
  private estimateTokenCount(text: string): number {
    return Math.ceil(text.split(/\s+/).length * 1.3); // Rough estimate: words * 1.3
  }
}

// Create optimal chunk size based on model context window
export function getOptimalChunkSize(modelContextWindow: number): ChunkOptions {
  return {
    chunkSize: Math.floor(modelContextWindow * 0.75), // 75% of context window
    chunkOverlap: Math.floor(modelContextWindow * 0.1), // 10% overlap
    minChunkLength: Math.floor(modelContextWindow * 0.1), // Minimum 10% of context window
    splitOnNewline: true,
  };
} 