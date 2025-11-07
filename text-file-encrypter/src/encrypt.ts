import { readFileSync, writeFileSync } from 'fs';
import { createCipheriv, randomBytes } from 'crypto';

export function encryptFile(filePath: string, key: Buffer): void {
    const iv = randomBytes(16); // Initialization vector
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    
    const fileContent = readFileSync(filePath);
    const encrypted = Buffer.concat([cipher.update(fileContent), cipher.final()]);
    
    // Write the encrypted data to a new file
    writeFileSync(`${filePath}.enc`, Buffer.concat([iv, encrypted]));
}