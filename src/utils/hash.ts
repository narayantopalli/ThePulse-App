import { createHash } from 'crypto';

// SHA-256 hash function for anonymous IDs
export const UUIDhash = (str: string | undefined): string => {
    if (!str) return '';
    
    // Create SHA-256 hash
    const hash = createHash('sha256').update(str).digest('hex');
    
    // Convert to UUID format
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
};
