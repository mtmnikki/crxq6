/**
 * AirtableStatus
 * - Purpose: Show a tiny status indicator for Airtable configuration (token presence).
 * - Note: Non-intrusive visual chip for quick diagnostics.
 */

import React from 'react';
import { getAirtableToken } from '../../config/airtableConfig';

/**
 * AirtableStatus component
 */
export default function AirtableStatus() {
  const hasToken = Boolean(getAirtableToken());
  return (
    <span
      className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
        hasToken ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}
      title={hasToken ? 'Airtable token detected' : 'Airtable token not configured'}
    >
      {hasToken ? 'Airtable: Configured' : 'Airtable: Not Configured'}
    </span>
  );
}
