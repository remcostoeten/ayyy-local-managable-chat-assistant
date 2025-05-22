"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { editKnowledgeArticle } from "@/app/actions/admin";
import { Loader2 } from "lucide-react";

interface KnowledgeEditorProps {
  article: {
    id: string;
    title: string;
    content: string;
    categories: string[];
    sourceUrl?: string;
  };
  onSave?: () => void;
}

export default function KnowledgeEditor({ article, onSave }: KnowledgeEditorProps) {
  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [categories, setCategories] = useState(article.categories.join(", "));
  const [sourceUrl, setSourceUrl] = useState(article.sourceUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await editKnowledgeArticle(article.id, {
        title,
        content,
        sourceUrl: sourceUrl || undefined,
        categories: categories.split(",").map(cat => cat.trim()).filter(Boolean),
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Article updated successfully",
        });
        onSave?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update article",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Article</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Article content..."
            className="min-h-[200px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceUrl">Source URL</Label>
          <Input
            id="sourceUrl"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
          />
          <p className="text-sm text-muted-foreground">
            Optional: Add the source URL for this article
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categories">Categories</Label>
          <Input
            id="categories"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="Comma-separated categories..."
          />
          <p className="text-sm text-muted-foreground">
            Separate categories with commas
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 