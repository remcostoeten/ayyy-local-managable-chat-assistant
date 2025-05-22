#!/usr/bin/env bun
import { $ } from 'bun';
import chalk from 'chalk';
import prompts from 'prompts';

const LOCAL_MODELS = [
  {
    id: 'mistral',
    name: 'Mistral 7B',
    description: 'Fast responses, good Dutch support',
    size: '4.1GB',
    recommended: true,
    category: 'Recommended'
  },
  {
    id: 'neural-chat',
    name: 'Neural-Chat',
    description: 'Optimized for chat interactions',
    size: '4.8GB',
    recommended: true,
    category: 'Recommended'
  },
  {
    id: 'llama2',
    name: 'Llama 2 7B',
    description: 'Meta\'s latest model, good all-rounder',
    size: '3.8GB',
    recommended: false,
    category: 'Alternative'
  },
  {
    id: 'llama2:13b',
    name: 'Llama 2 13B',
    description: 'Larger, more capable version of Llama 2',
    size: '7.3GB',
    recommended: false,
    category: 'Alternative'
  },
  {
    id: 'tinyllama',
    name: 'TinyLlama',
    description: 'Ultra lightweight model, perfect for testing',
    size: '1.2GB',
    recommended: false,
    category: 'Lightweight'
  },
  {
    id: 'phi',
    name: 'Phi-2',
    description: 'Microsoft\'s small but mighty model',
    size: '1.7GB',
    recommended: false,
    category: 'Lightweight'
  }
] as const;

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check-only');

  console.log(chalk.green('\n🤖 AI Model Installation Script'));
  console.log(chalk.dim('This script will help you install the AI models for your application.\n'));

  // Show local model details
  const { showDetails } = await prompts({
    type: 'confirm',
    name: 'showDetails',
    message: 'Would you like to see details about the available models?',
    initial: true
  });

  if (showDetails) {
    console.log('\nAvailable Models by Category:');
    
    // Group models by category
    const categoryGroups = LOCAL_MODELS.reduce((acc, model) => {
      if (!acc[model.category]) {
        acc[model.category] = [];
      }
      acc[model.category].push(model);
      return acc;
    }, {} as Record<string, typeof LOCAL_MODELS[number][]>);

    // Display models by category
    Object.entries(categoryGroups).forEach(([category, models]) => {
      console.log(chalk.yellow(`\n${category}:`));
      models.forEach(model => {
        console.log(`\n${chalk.green(model.name)} ${model.recommended ? chalk.yellow('(Recommended)') : ''}`);
        console.log(chalk.dim(`Description: ${model.description}`));
        console.log(chalk.dim(`Size: ${model.size}`));
      });
    });
    console.log(''); // Empty line for spacing
  }

  // Ask which models to install
  const { selectedModels } = await prompts({
    type: 'multiselect',
    name: 'selectedModels',
    message: 'Which models would you like to install?',
    choices: LOCAL_MODELS.map(model => ({
      title: `${model.name} (${model.size})`,
      value: model.id,
      description: model.description,
      selected: model.recommended
    })),
    hint: 'Space to select, Return to submit'
  });

  if (!selectedModels || selectedModels.length === 0) {
    console.log(chalk.red('\n❌ No models selected. Installation cancelled.'));
    process.exit(0);
  }

  // Calculate total size
  const totalSize = LOCAL_MODELS
    .filter(model => selectedModels.includes(model.id))
    .reduce((acc, model) => acc + parseFloat(model.size.replace('GB', '')), 0);

  // Final confirmation
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `This will download approximately ${totalSize.toFixed(1)}GB. Continue?`,
    initial: true
  });

  if (!confirm) {
    console.log(chalk.red('\n❌ Installation cancelled.'));
    process.exit(0);
  }

  // Install models
  for (const modelId of selectedModels) {
    const model = LOCAL_MODELS.find(m => m.id === modelId)!;
    console.log(`\n📥 Installing ${chalk.green(model.name)}...`);
    try {
      await $`ollama pull ${modelId}`;
      console.log(chalk.green(`✅ Successfully installed ${model.name}`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to install ${model.name}`));
      console.error(chalk.dim(error));
    }
  }

  console.log(chalk.green('\n✨ Installation complete!'));
  console.log(chalk.dim('You can now use these models in your application.'));
  console.log(chalk.dim('Note: For cloud models like Groq, please configure your API key in the admin interface.'));
}

main().catch(error => {
  console.error(chalk.red('\n❌ An error occurred:'));
  console.error(chalk.dim(error));
  process.exit(1);
}); 