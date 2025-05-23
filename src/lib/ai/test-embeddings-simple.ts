import { HfInference } from '@huggingface/inference'
import type { FeatureExtractionOutput } from '@huggingface/inference'

const hf = new HfInference('REMOVED_TOKEN')

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await hf.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: text,
  }) as FeatureExtractionOutput
  
  if (Array.isArray(response)) {
    return response as number[]
  } else if (typeof response === 'number') {
    return [response]
  } else if (Array.isArray((response as number[][])[0])) {
    return (response as number[][])[0]
  }
  return []
}

async function testEmbeddings() {
  try {
    console.log('🔍 Testing embeddings functionality...\n');

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

    // Test 3: Similarity between unrelated sentences
    console.log('Test 3: Testing similarity between unrelated sentences');
    const text3 = 'I love programming';
    const text4 = 'The weather is nice today';
    const embedding3 = await generateEmbedding(text3);
    const embedding4 = await generateEmbedding(text4);
    
    const similarity2 = cosineSimilarity(embedding3, embedding4);
    console.log(`✓ Similarity score: ${similarity2.toFixed(4)}\n`);

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