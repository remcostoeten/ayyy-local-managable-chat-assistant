import { generateEmbedding } from './embeddings';

async function testEmbeddings() {
  try {
    console.log('🔍 Testing Hugging Face embeddings...\n');

    // Test 1: Basic embedding generation
    console.log('Test 1: Generating embedding for a simple sentence');
    const text = 'This is a test sentence.';
    const embedding = await generateEmbedding(text);
    console.log('✓ Successfully generated embedding');
    console.log(`• Vector length: ${embedding.length}`);
    console.log(`• First few dimensions: ${embedding.slice(0, 3).map(n => n.toFixed(4))}\n`);

    // Test 2: Similarity between related sentences
    console.log('Test 2: Testing similarity between related sentences');
    const text1 = 'I love programming';
    const text2 = 'Coding is my passion';
    const embedding1 = await generateEmbedding(text1);
    const embedding2 = await generateEmbedding(text2);
    
    // Calculate cosine similarity
    const similarity = cosineSimilarity(embedding1, embedding2);
    console.log(`✓ Similarity score: ${similarity.toFixed(4)}\n`);

    // Test 3: Error handling
    console.log('Test 3: Testing error handling with empty input');
    try {
      await generateEmbedding('');
      console.log('✕ Should have thrown an error for empty input');
    } catch (error) {
      console.log('✓ Successfully caught error for empty input\n');
    }

    console.log('✨ All tests completed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Utility function to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

// Run the tests
testEmbeddings(); 