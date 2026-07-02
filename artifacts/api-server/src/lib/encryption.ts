import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
// Generate a 32-byte key from the environment variable or default fallback
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "dev_encryption_key_default_12345_abc";
const KEY = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);

/**
 * Encrypt a string using AES-256-GCM
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Format: iv:encrypted_text:auth_tag
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

/**
 * Decrypt a string using AES-256-GCM
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }
  
  const [ivHex, encrypted, authTagHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
