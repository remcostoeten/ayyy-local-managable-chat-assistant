import { db } from '@/lib/db/client';
import { articles } from '@/lib/db/schema';
import { storeArticleEmbeddings } from '@/lib/ai/embeddings';

async function generateEmbeddingsForExistingArticles() {
  console.log('Fetching all articles...');
  const allArticles = await db.select().from(articles);
  console.log(`Found ${allArticles.length} articles`);

  for (let i = 0; i < allArticles.length; i++) {
    const article = allArticles[i];
    console.log(`Processing article ${i + 1}/${allArticles.length}: ${article.title}`);
    
    try {
      await storeArticleEmbeddings(article.id, article.content);
      console.log('✓ Successfully generated embeddings');
    } catch (error) {
      console.error(`✗ Error generating embeddings for article ${article.id}:`, error);
    }
  }
}

generateEmbeddingsForExistingArticles()
  .then(() => {
    console.log('Finished generating embeddings');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  }); 