/**
 * Cryptographic & Obfuscation Vault for Upside Down Reality
 * Zero plaintext strings are stored in source code or production bundles.
 */

// Obfuscated key fragments assembled at runtime
const K_PARTS = [0x32, 0x33, 0x50, 0x50, 0x53, 0x59, 0x43, 0x30, 0x31, 0x31, 0x5f, 0x4f, 0x43, 0x43, 0x55, 0x4c, 0x54, 0x5f, 0x43, 0x55, 0x4b];
const GET_KEY = () => K_PARTS.map(b => String.fromCharCode(b)).join('');

// Encrypted signatures for robust cheat code matching:
// 1. Exact case-sensitive: "This Was Made By 23PPSYC011"
// 2. Letter O variant: "This Was Made By 23PPSYCO11"
// 3. Spaceless variant: "ThisWasMadeBy23PPSYC011"
// 4. Spaceless Letter O: "ThisWasMadeBy23PPSYCO11"
// 5. Single P variant: "This Was Made By 23PSYC011"
// 6. Lowercase variant: "this was made by 23ppsyc011"
// 7. Lowercase Letter O: "this was made by 23ppsyco11"
const SIGNATURES: readonly number[][] = [
  [102, 91, 57, 35, 115, 14, 34, 67, 17, 124, 62, 43, 38, 99, 23, 53, 116, 109, 112, 5, 27, 97, 106, 19, 96, 98, 104],
  [102, 91, 57, 35, 115, 14, 34, 67, 17, 124, 62, 43, 38, 99, 23, 53, 116, 109, 112, 5, 27, 97, 106, 19, 31, 98, 104],
  [102, 91, 57, 35, 4, 56, 48, 125, 80, 85, 58, 13, 58, 113, 102, 28, 4, 12, 26, 22, 123, 3, 2],
  [102, 91, 57, 35, 4, 56, 48, 125, 80, 85, 58, 13, 58, 113, 102, 28, 4, 12, 26, 22, 4, 3, 2],
  [102, 91, 57, 35, 115, 14, 34, 67, 17, 124, 62, 43, 38, 99, 23, 53, 116, 109, 112, 5, 24, 107, 112, 96, 97, 98],
  [70, 91, 57, 35, 115, 46, 34, 67, 17, 92, 62, 43, 38, 99, 55, 53, 116, 109, 112, 37, 59, 65, 74, 51, 96, 98, 104],
  [70, 91, 57, 35, 115, 46, 34, 67, 17, 92, 62, 43, 38, 99, 55, 53, 116, 109, 112, 37, 59, 65, 74, 51, 63, 98, 104]
];

// Chamber I Encrypted Dossier
const S1_ENC: readonly number[] = [
  118, 65, 112, 2, 50, 47, 42, 94, 85, 84, 45, 111, 8, 54, 56, 45, 38, 113, 99, 2, 42, 65, 19, 62, 63, 39, 121, 34, 92, 93, 94, 40, 42, 39, 99, 60, 34, 116, 43, 43, 48, 107, 87, 86, 55, 112, 60, 43, 99, 94, 84, 68, 45, 32, 37, 38, 48, 40, 54, 62, 32, 62, 107, 94, 82, 50, 111, 115, 22, 45, 85, 17, 94, 57, 111, 55, 43, 48, 37, 38, 127, 48, 33, 62, 86, 86, 62, 36, 32, 121, 45, 81, 92, 84, 59, 111, 2, 40, 52, 34, 63, 44, 43, 52, 107, 96, 82, 57, 112, 4, 56, 48, 16, 85, 84, 49, 38, 38, 39, 117, 35, 50, 57, 38, 39, 107, 70, 91, 53, 112, 60, 41, 51, 95, 67, 69, 42, 33, 42, 55, 44, 108, 32, 48, 99, 37, 46, 64, 85, 63, 34, 62, 121, 34, 16, 95, 84, 42, 61, 44, 37, 48, 41, 48, 61, 34, 54, 32, 18, 81, 49, 35, 54, 61, 99, 66, 84, 66, 58, 46, 49, 32, 61, 108, 30, 42, 48, 33, 107, 80, 86, 51, 49, 38, 42, 38, 16, 98, 94, 50, 42, 99, 34, 57, 56, 49, 45, 99, 48, 44, 93, 19, 31, 54, 115, 58, 38, 66, 69, 80, 54, 33, 99, 32, 58, 35, 38, 59, 42, 59, 42, 70, 92, 34, 35
];

// Chamber II Encrypted Dossier
const S2_ENC: readonly number[] = [
  98, 86, 63, 32, 63, 60, 99, 88, 80, 71, 58, 111, 32, 44, 56, 33, 61, 43, 55, 48, 47, 18, 64, 37, 57, 48, 48, 39, 85, 17, 120, 49, 111, 55, 43, 48, 108, 48, 58, 51, 52, 57, 70, 94, 53, 62, 39, 119, 99, 114, 68, 69, 127, 59, 43, 38, 117, 37, 58, 57, 44, 39, 38, 83, 71, 57, 63, 61, 121, 52, 81, 66, 17, 49, 42, 53, 38, 39, 108, 56, 58, 34, 62, 46, 86, 19, 7, 56, 60, 121, 34, 94, 85, 17, 40, 39, 58, 99, 60, 63, 116, 44, 55, 60, 39, 94, 19, 56, 57, 55, 61, 38, 94, 14
];

export const MAX_TRIGGER_WINDOW = 60;

/**
 * Validates a rolling keypress buffer or pasted string against the encrypted trigger signatures.
 * Robust against prefix keystrokes, Backspace corrections, and common font variations (0 vs O).
 */
export function verifyCheatCode(buffer: string): boolean {
  if (!buffer || typeof buffer !== 'string') return false;
  const clean = buffer.trim();
  const key = GET_KEY();

  for (const sig of SIGNATURES) {
    if (clean.length >= sig.length) {
      const slice = clean.slice(-sig.length);
      let match = true;
      for (let i = 0; i < sig.length; i++) {
        const expected = sig[i];
        const actual = slice.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        if (actual !== expected) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
  }

  return false;
}

/**
 * In-memory decryption of classified room dossiers.
 * Only called while biometric clearance & screen armor are actively confirmed.
 */
export function decryptSecret(roomIndex: number): string {
  const key = GET_KEY();
  const targetArr = roomIndex === 0 ? S1_ENC : roomIndex === 1 ? S2_ENC : [];
  if (targetArr.length === 0) return '';
  
  return targetArr
    .map((code, idx) => String.fromCharCode(code ^ key.charCodeAt(idx % key.length)))
    .join('');
}
