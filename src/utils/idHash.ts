import * as Crypto from 'expo-crypto';

export async function hashUUID(str: string): Promise<string> {
    // SHA‑256 → 64‑char hex; just slice & format
    const hex = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        str,
        { encoding: Crypto.CryptoEncoding.HEX }
    );

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
