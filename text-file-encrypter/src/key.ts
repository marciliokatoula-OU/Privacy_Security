import { randomBytes } from 'crypto';

export function generateKey(length: number = 32): Buffer {
    return randomBytes(length);
}

// Additional functions for key validation or management can be added here.