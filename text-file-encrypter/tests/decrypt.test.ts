import { decryptFile } from '../src/decrypt';
import { readFileSync, writeFileSync } from 'fs';

describe('decryptFile', () => {
    const key = 'test-key';
    const encryptedFilePath = 'path/to/encrypted/file.txt';
    const decryptedFilePath = 'path/to/decrypted/file.txt';

    beforeEach(() => {
        // Setup: Create a mock encrypted file for testing
        const encryptedContent = 'mock-encrypted-content';
        writeFileSync(encryptedFilePath, encryptedContent);
    });

    afterEach(() => {
        // Cleanup: Remove the mock files after each test
        try {
            fs.unlinkSync(encryptedFilePath);
            fs.unlinkSync(decryptedFilePath);
        } catch (err) {
            // Ignore errors if files do not exist
        }
    });

    it('should decrypt the file correctly', () => {
        decryptFile(encryptedFilePath, key);

        const decryptedContent = readFileSync(decryptedFilePath, 'utf-8');
        expect(decryptedContent).toBe('original-content'); // Replace with expected original content
    });

    it('should throw an error if the encrypted file does not exist', () => {
        expect(() => {
            decryptFile('invalid/path/to/file.txt', key);
        }).toThrow('Encrypted file not found');
    });

    it('should throw an error if the key is invalid', () => {
        expect(() => {
            decryptFile(encryptedFilePath, 'invalid-key');
        }).toThrow('Invalid decryption key');
    });
});