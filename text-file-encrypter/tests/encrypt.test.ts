import { encryptFile } from '../src/encrypt';
import * as fs from 'fs';
import * as path from 'path';

describe('encryptFile', () => {
    const testFilePath = path.join(__dirname, 'test.txt');
    const encryptedFilePath = path.join(__dirname, 'test.enc');
    const key = 'test-key';

    beforeAll(() => {
        fs.writeFileSync(testFilePath, 'This is a test file.');
    });

    afterAll(() => {
        fs.unlinkSync(testFilePath);
        fs.unlinkSync(encryptedFilePath);
    });

    test('should encrypt the file successfully', async () => {
        await encryptFile(testFilePath, key);
        const encryptedData = fs.readFileSync(encryptedFilePath, 'utf-8');
        expect(encryptedData).not.toBe('This is a test file.');
    });

    test('should throw an error if the file does not exist', async () => {
        await expect(encryptFile('nonexistent.txt', key)).rejects.toThrow();
    });

    test('should throw an error if the key is invalid', async () => {
        await expect(encryptFile(testFilePath, '')).rejects.toThrow();
    });
});