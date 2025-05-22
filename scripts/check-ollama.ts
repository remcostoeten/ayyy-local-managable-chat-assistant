import { exec } from 'child_process';
import { promisify } from 'util';
import { AVAILABLE_MODELS } from '../src/lib/config/model-defaults';

const execAsync = promisify(exec);

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

async function checkOllamaStatus() {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      throw new Error(`Ollama API returned ${response.status}`);
    }
    console.log('✅ Ollama is running');
    return true;
  } catch (error) {
    console.log('❌ Ollama is not running');
    return false;
  }
}

async function getInstalledModels(): Promise<string[]> {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      throw new Error(`Failed to get models: ${response.status}`);
    }
    const data = await response.json();
    return data.models.map((model: OllamaModel) => model.name);
  } catch (error) {
    console.error('Failed to get installed models:', error);
    return [];
  }
}

async function installModel(modelId: string) {
  try {
    console.log(`📥 Installing ${modelId}...`);
    await execAsync(`ollama pull ${modelId}`);
    console.log(`✅ ${modelId} installed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to install ${modelId}:`, error);
    return false;
  }
}

async function verifyModel(modelId: string): Promise<boolean> {
  try {
    console.log(`🔍 Verifying ${modelId}...`);
    // Try a simple generation to verify the model works
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        prompt: "test",
        options: {
          temperature: 0.7,
          num_predict: 1,
        },
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        console.log(`⚠️ Model ${modelId} is not loaded. Attempting to load...`);
        return false;
      }
      throw new Error(`API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    console.log(`✅ ${modelId} is working properly`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to verify ${modelId}:`, error);
    return false;
  }
}

async function checkAndInstallModels() {
  console.log('Checking AI models...');
  const installedModels = await getInstalledModels();
  const requiredModels = AVAILABLE_MODELS.map(model => model.id);
  const missingModels = requiredModels.filter(model => !installedModels.includes(model));

  if (missingModels.length === 0) {
    console.log('✅ All required AI models are installed');
  } else {
    console.log(`Missing models: ${missingModels.join(', ')}`);
    let allSuccess = true;

    for (const model of missingModels) {
      const success = await installModel(model);
      if (!success) {
        allSuccess = false;
        console.error(`❌ Failed to install ${model}`);
      }
    }

    if (!allSuccess) {
      console.error('❌ Some models failed to install. Please check the logs above.');
      return false;
    }
  }

  // Verify all models are working
  console.log('\nVerifying models...');
  let allModelsWorking = true;

  for (const modelId of requiredModels) {
    const isWorking = await verifyModel(modelId);
    if (!isWorking) {
      const success = await installModel(modelId);
      if (!success || !await verifyModel(modelId)) {
        allModelsWorking = false;
        console.error(`❌ Model ${modelId} is not working properly`);
      }
    }
  }

  if (!allModelsWorking) {
    console.error('❌ Some models are not working properly. Please check the logs above.');
    return false;
  }

  console.log('✅ All models are installed and working properly');
  return true;
}

async function startOllama() {
  try {
    console.log('Starting Ollama...');
    await execAsync('ollama serve');
    console.log('✅ Ollama started successfully');
  } catch (error) {
    console.error('Failed to start Ollama:', error);
    process.exit(1);
  }
}

async function checkOllama() {
  try {
    console.log('Checking Ollama server...');
    const response = await fetch('http://localhost:11434/api/tags');
    
    if (!response.ok) {
      throw new Error(`Failed to connect to Ollama: ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.models || [];
    const hasMistral = models.some((model: any) => model.name === 'mistral');

    if (!hasMistral) {
      console.log('❌ Mistral model not found. Installing...');
      await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'mistral' }),
      });
      console.log('✓ Mistral model installed');
    } else {
      console.log('✓ Mistral model is available');
    }

    console.log('✓ Ollama is running and ready');
  } catch (error) {
    console.error('❌ Failed to connect to Ollama server. Make sure Ollama is running:');
    console.error('   1. Install Ollama from https://ollama.ai');
    console.error('   2. Run "ollama serve" in a terminal');
    console.error('   3. Try again');
    process.exit(1);
  }
}

async function main() {
  const isRunning = await checkOllamaStatus();
  if (!isRunning) {
    await startOllama();
    // Wait for Ollama to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Check and install models
  const modelsOk = await checkAndInstallModels();
  if (!modelsOk) {
    console.error('❌ Model check failed. Please check the logs above.');
    process.exit(1);
  }
}

checkOllama();

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 