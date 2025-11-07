export interface EncryptionOptions {
    key: string;
    outputFilePath: string;
}

export interface DecryptionOptions {
    key: string;
    encryptedFilePath: string;
    outputFilePath: string;
}