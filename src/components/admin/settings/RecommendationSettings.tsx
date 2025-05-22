'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Trash2 } from 'lucide-react';

interface RecommendationQuestion {
  id: string;
  question: string;
  category?: string;
}

export function RecommendationSettings() {
  const [questions, setQuestions] = useState<RecommendationQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/admin/recommendations');
      const data = await response.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion,
          category: newCategory || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add question');
      }

      setQuestions([...questions, data.question]);
      setNewQuestion('');
      setNewCategory('');
      toast({
        title: 'Success',
        description: 'Recommendation question added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add question',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const response = await fetch('/api/admin/recommendations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      setQuestions(questions.filter(q => q.id !== id));
      toast({
        title: 'Success',
        description: 'Question deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendation Questions</CardTitle>
        <CardDescription>
          Manage the questions that will be shown as recommendations to users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddQuestion} className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="question">New Question</Label>
            <Input
              id="question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter a recommendation question"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter a category"
            />
          </div>
          <Button type="submit" disabled={loading || !newQuestion.trim()}>
            {loading ? 'Adding...' : 'Add Question'}
          </Button>
        </form>

        <div className="space-y-4">
          <h3 className="font-medium">Current Questions</h3>
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions added yet</p>
          ) : (
            <ul className="space-y-2">
              {questions.map((q) => (
                <li
                  key={q.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div>
                    <p className="font-medium">{q.question}</p>
                    {q.category && (
                      <p className="text-sm text-muted-foreground">
                        Category: {q.category}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteQuestion(q.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 