import { Command } from 'commander';
import { encryptFile } from './encrypt';
import { decryptFile } from './decrypt';
import { generateKey } from './key';
import * as fs from 'fs';

const program = new Command();

program
  .version('1.0.0')
  .description('A simple text file encrypter application');

program
  .command('encrypt <file> <key>')
  .description('Encrypt a text file')
  .action((file, key) => {
    if (!fs.existsSync(file)) {
      console.error('File does not exist.');
      process.exit(1);
    }
    encryptFile(file, key);
    console.log(`File ${file} has been encrypted.`);
  });

program
  .command('decrypt <file> <key>')
  .description('Decrypt a text file')
  .action((file, key) => {
    if (!fs.existsSync(file)) {
      console.error('File does not exist.');
      process.exit(1);
    }
    decryptFile(file, key);
    console.log(`File ${file} has been decrypted.`);
  });

program
  .command('generate-key')
  .description('Generate a new encryption key')
  .action(() => {
    const key = generateKey();
    console.log(`Generated key: ${key}`);
  });

program.parse(process.argv);