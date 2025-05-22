import { exec } from 'child_process';
import { promisify } from 'util';
import { AVAILABLE_MODELS } from '../src/lib/config/model-defaults';
import ora from 'ora';
import chalk from 'chalk';
import boxen from 'boxen';

const execAsync = promisify(exec);

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warning: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✖'), msg),
  title: (msg: string) => console.log('\n' + chalk.bold(msg)),
};

async function checkOllamaStatus() {
  const spinner = ora('Checking if Ollama is running...').start();
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) throw new Error(`Ollama API returned ${response.status}`);
    spinner.succeed('Ollama is running and healthy');
    return true;
  } catch (error) {
    spinner.fail('Ollama is not running');
    return false;
  }
}

async function getInstalledModels(): Promise<string[]> {
  const spinner = ora('Checking installed models...').start();
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) throw new Error(`Failed to get models: ${response.status}`);
    const data = await response.json();
    const models = data.models.map((model: OllamaModel) => model.name);
    spinner.succeed(`Found ${models.length} installed models`);
    return models;
  } catch (error) {
    spinner.fail('Could not check installed models');
    return [];
  }
}

async function installModel(modelId: string) {
  const spinner = ora(`Installing ${modelId}...`).start();
  try {
    await execAsync(`ollama pull ${modelId}`);
    spinner.succeed(`Successfully installed ${modelId}`);
    return true;
  } catch (error) {
    spinner.fail(`Failed to install ${modelId}`);
    log.error(`Error details: ${error}`);
    return false;
  }
}

async function verifyModel(modelId: string): Promise<boolean> {
  const spinner = ora(`Verifying ${modelId}...`).start();
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        prompt: "test",
        options: { temperature: 0.7, num_predict: 1 },
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        spinner.warn(`Model ${modelId} needs to be loaded`);
        return false;
      }
      throw new Error(`API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    spinner.succeed(`${modelId} is working properly`);
    return true;
  } catch (error) {
    spinner.fail(`${modelId} verification failed`);
    return false;
  }
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

async function displayModelInfo() {
  const spinner = ora('Fetching model information...').start();
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) throw new Error(`Failed to get models: ${response.status}`);
    const data = await response.json();
    spinner.stop();

    // Get model details from config
    const modelDetails = new Map(AVAILABLE_MODELS.map(model => [model.id, model]));

    console.log(boxen(
      chalk.bold('### Available Models\n\n') +
      data.models.map((model: OllamaModel) => {
        const baseModelId = model.name.split(':')[0] as (typeof AVAILABLE_MODELS)[number]['id'];
        const details = modelDetails.get(baseModelId);
        return `${chalk.blue('●')} ${chalk.bold(model.name)}${details?.recommended ? ' ' + chalk.yellow('⭐') : ''}\n` +
          `  ${chalk.dim('Description:')} ${details?.description || 'Custom model'}\n` +
          `  ${chalk.dim('Size:')} ${formatBytes(model.size)}\n` +
          `  ${chalk.dim('Max Tokens:')} ${details?.maxTokens || 'Unknown'}\n` +
          `  ${chalk.dim('Last modified:')} ${new Date(model.modified_at).toLocaleString()}`;
      }).join('\n\n'),
      { padding: 1, margin: 1, borderStyle: 'round' }
    ));

    // Show available but not installed models
    const installedModelIds = new Set(data.models.map((m: OllamaModel) => m.name.split(':')[0]));
    const notInstalled = AVAILABLE_MODELS.filter(m => !installedModelIds.has(m.id));
    
    if (notInstalled.length > 0) {
      console.log(boxen(
        chalk.bold('### Additional Available Models\n\n') +
        notInstalled.map(model => 
          `${chalk.gray('○')} ${chalk.bold(model.name)}${model.recommended ? ' ' + chalk.yellow('⭐') : ''}\n` +
          `  ${chalk.dim('Description:')} ${model.description}\n` +
          `  ${chalk.dim('Max Tokens:')} ${model.maxTokens}`
        ).join('\n\n'),
        { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'gray' }
      ));
    }
  } catch (error) {
    spinner.fail('Could not fetch model information');
    return [];
  }
}

async function checkAndInstallModels() {
  log.title('🤖 AI Model Setup');
  
  const installedModels = await getInstalledModels();
  const requiredModels = AVAILABLE_MODELS.map(model => model.id);
  const missingModels = requiredModels.filter(model => !installedModels.includes(model));

  if (missingModels.length === 0) {
    log.success('All required AI models are installed');
  } else {
    log.warning(`Need to install: ${missingModels.join(', ')}`);
    
    for (const model of missingModels) {
      const success = await installModel(model);
      if (!success) {
        log.error(`Could not install ${model}`);
        return false;
      }
    }
  }

  log.title('🔍 Model Verification');
  let allModelsWorking = true;

  for (const modelId of requiredModels) {
    const isWorking = await verifyModel(modelId);
    if (!isWorking) {
      const success = await installModel(modelId);
      if (!success || !await verifyModel(modelId)) {
        allModelsWorking = false;
        log.error(`Model ${modelId} is not working properly`);
      }
    }
  }

  if (!allModelsWorking) {
    log.error('Some models are not working properly');
    return false;
  }

  log.success('All models are ready to use! 🎉');
  return true;
}

async function startOllama() {
  const spinner = ora('Starting Ollama...').start();
  try {
    await execAsync('ollama serve');
    spinner.succeed('Ollama started successfully');
  } catch (error) {
    spinner.fail('Failed to start Ollama');
    showSetupInstructions();
    process.exit(1);
  }
}

function showSetupInstructions() {
  console.log(boxen(chalk.bold('📚 Ollama Setup Instructions\n\n') +
    '1. Install Ollama from https://ollama.ai\n' +
    '2. Run "ollama serve" in a terminal\n' +
    '3. Try this setup again\n\n' +
    chalk.dim('Need help? Check our docs or Discord community'),
    { padding: 1, margin: 1, borderStyle: 'round' }
  ));
}

async function main() {
  console.log(boxen(chalk.bold.blue('🚀 AI Model Setup Assistant\n\n') +
    'This will help you set up all required AI models\n' +
    'for your application to work properly.',
    { padding: 1, margin: 1, borderStyle: 'round' }
  ));

  const isRunning = await checkOllamaStatus();
  if (!isRunning) {
    await startOllama();
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  await displayModelInfo();

  const modelsOk = await checkAndInstallModels();
  if (!modelsOk) {
    log.error('Setup incomplete - please check the errors above');
    process.exit(1);
  }

  console.log(boxen(
    chalk.bold.green('🎉 Success!\n\n') +
    'All AI models are installed and verified.\n' +
    'Your application is ready to use AI features.',
    { padding: 1, margin: 1, borderStyle: 'round' }
  ));
}

main().catch(error => {
  log.error('Fatal error:');
  console.error(error);
  process.exit(1);
}); 