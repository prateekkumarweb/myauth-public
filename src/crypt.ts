async function getPasswordKey(password: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
}

async function deriveKey(
  passwordKey: CryptoKey,
  salt: Uint8Array,
  keyUsage: KeyUsage[]
): Promise<CryptoKey> {
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 250000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    keyUsage
  );
}

export async function encrypt(
  message: string,
  password: string
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(message);
  const passwordKey = await getPasswordKey(password);
  const aesKey = await deriveKey(passwordKey, salt, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoded
  );
  const encryptedArr = new Uint8Array(encrypted);

  const encryptedBuff = new Uint8Array(
    salt.byteLength + iv.byteLength + encryptedArr.byteLength
  );
  encryptedBuff.set(salt, 0);
  encryptedBuff.set(iv, salt.byteLength);
  encryptedBuff.set(encryptedArr, salt.byteLength + iv.byteLength);
  const encryptedBase64 = btoa(
    String.fromCharCode.apply(null, Array.from(encryptedBuff))
  );

  return encryptedBase64;
}

export async function decrypt(
  encryptedBase64: string,
  password: string
): Promise<string> {
  const encrypedBuff = Uint8Array.from(atob(encryptedBase64), (c) =>
    c.charCodeAt(0)
  );
  const salt = encrypedBuff.slice(0, 16);
  const iv = encrypedBuff.slice(16, 16 + 12);
  const encrypedArr = encrypedBuff.slice(16 + 12);

  const passwordKey = await getPasswordKey(password);
  const aesKey = await deriveKey(passwordKey, salt, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encrypedArr
  );

  return new TextDecoder().decode(decrypted);
}
