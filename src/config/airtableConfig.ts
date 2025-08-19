/**
 * Airtable configuration for the new base.
 * Uses environment variable AIRTABLE_API_KEY for authentication.
 */

export const AIRTABLE_BASE_ID = 'appuo6esxsc55yCgI';

/**
 * Retrieve the Airtable API key from environment variables.
 */
export function getAirtableToken(): string | null {
  return process.env.AIRTABLE_API_KEY || null;
}
