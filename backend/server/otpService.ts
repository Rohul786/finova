import crypto from "crypto";

interface OtpEntry {
  email: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
  used: boolean;
}

interface ResetTokenEntry {
  email: string;
  token: string;
  expiresAt: number;
  used: boolean;
}

interface RequestRateEntry {
  requests: number[];
  lastRequestTime: number;
}

// In-memory store for active OTPs & reset tokens
const otpStore = new Map<string, OtpEntry>();
const resetTokenStore = new Map<string, ResetTokenEntry>();
const rateLimitStore = new Map<string, RequestRateEntry>();

const OTP_SECRET_SALT = process.env.OTP_SECRET_SALT || "finova_secure_otp_salt_2026";
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 4;
const COOLDOWN_SECONDS = 60;

/**
 * Computes a secure HMAC-SHA256 hash of the OTP
 */
function hashOtp(code: string, email: string): string {
  return crypto
    .createHmac("sha256", OTP_SECRET_SALT)
    .update(`${email.toLowerCase()}:${code}`)
    .digest("hex");
}

/**
 * Checks rate limiting for an email address
 */
export function checkRateLimit(email: string): { allowed: boolean; retryAfterSeconds?: number; reason?: string } {
  const cleanEmail = email.toLowerCase().trim();
  const now = Date.now();
  const entry = rateLimitStore.get(cleanEmail);

  if (!entry) {
    rateLimitStore.set(cleanEmail, { requests: [now], lastRequestTime: now });
    return { allowed: true };
  }

  // Check cooldown between successive requests
  const elapsedSinceLast = (now - entry.lastRequestTime) / 1000;
  if (elapsedSinceLast < COOLDOWN_SECONDS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(COOLDOWN_SECONDS - elapsedSinceLast),
      reason: `Please wait ${Math.ceil(COOLDOWN_SECONDS - elapsedSinceLast)}s before requesting a new code.`,
    };
  }

  // Filter requests within the active window
  const recentRequests = entry.requests.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recentRequests[0];
    const waitTime = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: waitTime,
      reason: `Too many password reset requests. Please wait ${Math.ceil(waitTime / 60)} minute(s) before trying again.`,
    };
  }

  recentRequests.push(now);
  rateLimitStore.set(cleanEmail, { requests: recentRequests, lastRequestTime: now });
  return { allowed: true };
}

/**
 * Generates a cryptographically random 6-digit OTP code and securely stores its hash
 */
export function createOtpSession(email: string): { otpCode: string; expiresAt: number } {
  const cleanEmail = email.toLowerCase().trim();
  const code = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;
  const codeHash = hashOtp(code, cleanEmail);

  otpStore.set(cleanEmail, {
    email: cleanEmail,
    codeHash,
    expiresAt,
    attempts: 0,
    createdAt: Date.now(),
    used: false,
  });

  return { otpCode: code, expiresAt };
}

/**
 * Verifies the 6-digit OTP code with constant-time equality and attempt counting
 */
export function verifyOtpCode(
  email: string,
  candidateCode: string
): { success: boolean; resetToken?: string; error?: string; remainingAttempts?: number } {
  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = candidateCode.trim();
  const session = otpStore.get(cleanEmail);

  if (!session || session.used) {
    return {
      success: false,
      error: "No active verification code found. Please request a new code.",
    };
  }

  if (Date.now() > session.expiresAt) {
    otpStore.delete(cleanEmail);
    return {
      success: false,
      error: "Verification code has expired. Please request a new code.",
    };
  }

  if (session.attempts >= MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(cleanEmail);
    return {
      success: false,
      error: "Too many incorrect attempts. This code has been invalidated for your security.",
    };
  }

  session.attempts += 1;
  const candidateHash = hashOtp(cleanCode, cleanEmail);

  const hashBufferA = Buffer.from(session.codeHash, "hex");
  const hashBufferB = Buffer.from(candidateHash, "hex");

  const isMatch =
    hashBufferA.length === hashBufferB.length &&
    crypto.timingSafeEqual(hashBufferA, hashBufferB);

  if (!isMatch) {
    const remaining = MAX_VERIFY_ATTEMPTS - session.attempts;
    return {
      success: false,
      error: remaining > 0 ? `Invalid verification code. ${remaining} attempt(s) remaining.` : "Invalid code. Maximum attempts reached.",
      remainingAttempts: remaining,
    };
  }

  // Mark OTP as used immediately so it cannot be used again
  session.used = true;
  otpStore.delete(cleanEmail);

  // Generate single-use reset authorization token
  const resetToken = crypto.randomBytes(32).toString("hex");
  resetTokenStore.set(resetToken, {
    email: cleanEmail,
    token: resetToken,
    expiresAt: Date.now() + RESET_TOKEN_EXPIRY_MS,
    used: false,
  });

  return {
    success: true,
    resetToken,
  };
}

/**
 * Validates the single-use reset token and authorizes password change
 */
export function authorizePasswordReset(
  email: string,
  resetToken: string
): { authorized: boolean; error?: string } {
  const cleanEmail = email.toLowerCase().trim();
  const tokenEntry = resetTokenStore.get(resetToken);

  if (!tokenEntry || tokenEntry.used) {
    return { authorized: false, error: "Invalid or expired reset session. Please start over." };
  }

  if (tokenEntry.email !== cleanEmail) {
    return { authorized: false, error: "Reset token does not match the requested account." };
  }

  if (Date.now() > tokenEntry.expiresAt) {
    resetTokenStore.delete(resetToken);
    return { authorized: false, error: "Reset session has expired. Please request a new code." };
  }

  // Invalidate token immediately upon consumption
  tokenEntry.used = true;
  resetTokenStore.delete(resetToken);

  return { authorized: true };
}
