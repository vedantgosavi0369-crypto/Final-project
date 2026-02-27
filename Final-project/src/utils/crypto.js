/**
 * Web Crypto API for zero-knowledge client-side encryption of PDFs and Vault Data.
 * Uses AES-GCM for strong encryption.
 */

// Generate a random AES-256-GCM key
export async function generateCryptoKey() {
    return await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true, // Extractable so we can store/share it if needed
        ['encrypt', 'decrypt']
    );
}

export async function exportKey(key) {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importKey(base64Key) {
    const binaryDer = atob(base64Key);
    const cryptoKey = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) {
        cryptoKey[i] = binaryDer.charCodeAt(i);
    }
    return await window.crypto.subtle.importKey(
        'raw',
        cryptoKey,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt a Blob (e.g. PDF file or stringified JSON)
 * Returns { ciphertext (Blob), iv (Uint8Array) }
 */
export async function encryptData(dataBlob, key) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const arrayBuffer = await dataBlob.arrayBuffer();

    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        arrayBuffer
    );

    return {
        ciphertext: new Blob([encrypted]),
        iv: iv
    };
}

/**
 * Decrypt an ArrayBuffer back to a Blob
 */
export async function decryptData(encryptedBuffer, key, iv, mimeType = 'application/pdf') {
    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedBuffer
    );

    return new Blob([decrypted], { type: mimeType });
}
