/**
 * Validation utilities for BetterMe authentication and user input.
 */

/**
 * Validates that an email address is syntactically valid and not a reserved/test/dummy domain
 * (e.g. RFC 2606 / RFC 6761 reserved test domains like example.com, test.com, invalid, localhost).
 * Prevents invalid test addresses from being sent to live Supabase Auth.
 */
export function validateEmailForAuth(rawEmail: string): { isValid: boolean; error?: string } {
  const email = (rawEmail || '').trim().toLowerCase();

  if (!email) {
    return { isValid: false, error: 'Please enter an email address.' };
  }

  // RFC 5322 compliant regex for basic syntax validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address format (e.g. name@domain.com).' };
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email address structure.' };
  }

  const domain = parts[1];

  // Reserved, dummy, and test domains that Supabase rejects or should never receive real verification emails
  const blockedDomains = [
    'example.com',
    'example.org',
    'example.net',
    'example.edu',
    'test.com',
    'test.org',
    'test.net',
    'invalid',
    'localhost',
    'test',
  ];

  if (
    blockedDomains.includes(domain) ||
    domain.endsWith('.test') ||
    domain.endsWith('.example') ||
    domain.endsWith('.invalid') ||
    domain.endsWith('.localhost')
  ) {
    return {
      isValid: false,
      error: `Test and reserved domains (@${domain}) are not permitted. Please use a valid, deliverable email address.`,
    };
  }

  return { isValid: true };
}
