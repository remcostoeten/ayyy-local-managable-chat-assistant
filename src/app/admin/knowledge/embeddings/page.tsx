'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { searchEmbeddings } from '@/app/actions/embeddings';

type SearchResult = {
  chunkText: string;
  similarity: number;
  articleId: number;
}

export default function EmbeddingsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await searchEmbeddings(searchQuery);
      if (response.success && response.results) {
        setSearchResults(response.results);
      } else {
        setError(response.error || 'No results found');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching embeddings:', error);
      setError('Failed to search embeddings');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Embeddings Management</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Vector Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Enter search query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {error && (
            <div className="text-red-500 mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Similarity: {(result.similarity * 100).toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Article ID: {result.articleId}
                  </p>
                  <p className="whitespace-pre-wrap">{result.chunkText}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 