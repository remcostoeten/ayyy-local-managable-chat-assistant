import { HfInference } from '@huggingface/inference'

async function testHuggingFace() {
  try {
    console.log('🔍 Testing Hugging Face connection...\n');

    const hf = new HfInference('REMOVED_TOKEN')

    // Test 1: Basic embedding generation
    console.log('Test 1: Generating embedding for a simple sentence');
    const text = 'This is a test sentence.';
    
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    })

    if (!response) {
      throw new Error('No response from Hugging Face API');
    }

    console.log('✓ Successfully generated embedding');
    console.log(`• Response type: ${typeof response}`);
    if (Array.isArray(response)) {
      console.log(`• Vector length: ${response.length}`);
      console.log(`• First few dimensions: ${response.slice(0, 3).map(n => typeof n === 'number' ? n.toFixed(4) : n)}\n`);
    }

    console.log('✨ Test completed successfully!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error && error.message.includes('401')) {
      console.error('\n⚠️ Authentication failed. Make sure your HF_ACCESS_TOKEN is set correctly.');
    }
  }
}

// Run the test
testHuggingFace(); 