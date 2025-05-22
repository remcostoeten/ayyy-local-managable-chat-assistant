import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function generateKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

function updateEnvFile(newKey: string) {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  try {
    // Check if .env exists, if not copy from .env.example
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
    }

    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const keyRegex = /^ENCRYPTION_KEY=.*/m;
    const newKeyLine = `ENCRYPTION_KEY=${newKey}`;

    if (keyRegex.test(envContent)) {
      // Replace existing key
      envContent = envContent.replace(keyRegex, newKeyLine);
    } else {
      // Add new key
      envContent = envContent.trim() + '\n' + newKeyLine + '\n';
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Successfully generated and updated encryption key');
    console.log('🔐 New encryption key has been set in .env file');
  } catch (error) {
    console.error('❌ Error updating .env file:', error);
    process.exit(1);
  }
}

function main() {
  console.log('🔑 Generating new encryption key...');
  const newKey = generateKey();
  updateEnvFile(newKey);
}

main();