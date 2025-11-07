import { readFileSync, writeFileSync } from 'fs';
import { createDecipheriv } from 'crypto';
import { generateKey } from './key';

export function decryptFile(encryptedFilePath: string, key: string, outputFilePath: string): void {
    const algorithm = 'aes-256-cbc';
    const iv = Buffer.alloc(16, 0); // Initialization vector

    const encryptedData = readFileSync(encryptedFilePath);
    const decipher = createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    writeFileSync(outputFilePath, decrypted);
}