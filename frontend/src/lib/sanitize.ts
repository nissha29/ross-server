/**
 * Sanitization utilities for user input to prevent XSS attacks
 */

// HTML entities that should be escaped
const HTML_ENTITIES: { [key: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

// Dangerous patterns that should be removed or escaped
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
  /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:/gi,
  /on\w+\s*=/gi, // onclick, onload, etc.
];

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"'`=\/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove dangerous HTML patterns
 */
function removeDangerousPatterns(text: string): string {
  let sanitized = text;
  DANGEROUS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "");
  });
  return sanitized;
}

/**
 * Sanitize user input for safe storage and display
 * @param input - The user input to sanitize
 * @returns Sanitized text safe for storage and display
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Remove dangerous patterns first
  sanitized = removeDangerousPatterns(sanitized);

  // Escape HTML entities
  sanitized = escapeHtml(sanitized);

  // Remove any remaining HTML tags (basic protection)
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // Limit length to prevent abuse (max 5000 characters)
  if (sanitized.length > 5000) {
    sanitized = sanitized.substring(0, 5000);
  }

  return sanitized;
}

/**
 * Validate that input is safe (contains only text, no scripts)
 * @param input - The input to validate
 * @returns true if input is safe, false otherwise
 */
export function isInputSafe(input: string): boolean {
  if (!input || typeof input !== "string") {
    return true;
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      return false;
    }
  }

  // Check for HTML tags
  if (/<[^>]*>/g.test(input)) {
    return false;
  }

  // Check for javascript: or data: URLs
  if (/javascript:|data:/gi.test(input)) {
    return false;
  }

  return true;
}

/**
 * Sanitize and validate input for question notes
 * @param input - The note input
 * @returns Sanitized and validated note text
 */
export function sanitizeNoteInput(input: string): string {
  const sanitized = sanitizeInput(input);

  // Additional validation for notes
  if (!isInputSafe(sanitized)) {
    throw new Error("Invalid input: Contains potentially dangerous content");
  }

  return sanitized;
}
