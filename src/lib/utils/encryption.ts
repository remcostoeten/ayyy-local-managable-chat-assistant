import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || randomBytes(32);
const ALGORITHM = 'aes-256-gcm';

export function encryptText(text: string): { encryptedData: string; iv: string; tag: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex')
  };
}

export function decryptText(encryptedData: string, iv: string, tag: string): string {
  const decipher = createDecipheriv(
    ALGORITHM, 
    ENCRYPTION_KEY, 
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function isEncrypted(data: { iv: string | null; tag: string | null }): boolean {
  return Boolean(data.iv && data.tag);
} 