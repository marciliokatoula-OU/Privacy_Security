# Simple Text File Encrypter

This project is a simple text file encrypter application that allows users to encrypt and decrypt text files using a secure key. 

## Features

- Encrypt text files with a specified key.
- Decrypt previously encrypted text files using the same key.
- Command-line interface for easy usage.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd text-file-encrypter
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## Usage

### Encrypting a File

To encrypt a file, use the following command:

```
node bin/encrypter.js encrypt <file-path> <key>
```

### Decrypting a File

To decrypt a file, use the following command:

```
node bin/encrypter.js decrypt <encrypted-file-path> <key>
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.