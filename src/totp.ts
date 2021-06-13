import { OtpAuthParam } from "./store";

const parseKey = (key: string) => {
  const keyBuffer = [...key.toLowerCase()]
    .filter((c) => c !== " ")
    .map((c) => {
      const charCode = c.charCodeAt(0);
      if (charCode >= 97 && charCode <= 122) {
        return charCode - 97;
      }
      if (charCode >= 50 && charCode <= 55) {
        return charCode - 50 + 26;
      }
      throw new Error("Incorrect code");
    });

  let buffer = 0;
  let bitsLeft = 0;
  const result: number[] = [];

  keyBuffer.forEach((c) => {
    buffer <<= 5;
    buffer |= c & 31;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      result.push(buffer >> (bitsLeft - 8));
      bitsLeft -= 8;
    }
  });

  return new Uint8Array(result);
};

const truncate = (hash: Uint8Array) => {
  const offset = hash[19] & 0xf;
  const truncated =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  return truncated % 1_000_000;
};

export const getTotp = async (
  keyString: string
): Promise<{
  otp: number;
  timeRemaining: number;
}> => {
  const now = Date.now();
  const int32Bytes = new Uint32Array([Math.trunc(now / 30000), 0]);
  const bytes = new Uint8Array(int32Bytes.buffer);
  bytes.reverse();
  const key = parseKey(keyString);
  const cryptoKey = await crypto.subtle?.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle?.sign("HMAC", cryptoKey, bytes.buffer);
  return {
    otp: truncate(new Uint8Array(signature)),
    timeRemaining: 30 - ((now / 1000) % 30),
  };
};

export const otpAuthUriParser = (uri: string): OtpAuthParam | null => {
  try {
    const url = new URL(uri);

    if (url.protocol !== "otpauth:") {
      throw new Error("Invalid protocol " + url.protocol);
    }

    // Browser issue
    // Chrome & Firefox: hostname is "" and pathname is "//totp/Example..."
    // Safari: hostname is "totp" and pathname is "/Example..."
    if (url.pathname.slice(0, 7) !== "//totp/" && url.hostname !== "totp") {
      throw new Error("Invalid otpauth type " + url.toString());
    }

    const nameWithPrefix =
      url.hostname === "totp" ? url.pathname.slice(1) : url.pathname.slice(7);
    const indexOfColon = nameWithPrefix.indexOf(":");
    const name =
      indexOfColon === -1
        ? nameWithPrefix
        : nameWithPrefix.slice(indexOfColon + 1);

    const issuer = url.searchParams.get("issuer");
    if (issuer === null) {
      throw new Error("Issuer cannot be null");
    }
    const secret = url.searchParams.get("secret");
    if (secret === null) {
      throw new Error("Secret cannot be null");
    }

    return { name, issuer, secret };
  } catch (e) {
    console.error(e);
    return null;
  }
};
