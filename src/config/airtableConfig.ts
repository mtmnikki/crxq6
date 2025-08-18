/**
 * Airtable configuration for the ClinicalRxQ base (ID-first)
 * - Base: appNAaCbdP5X6wWGR
 * - PAT: integrated as a dev fallback per user request (can be overridden at runtime)
 * - Exposes Table IDs and Field IDs (strictly from provided schema)
 *
 * NOTE:
 * - Consumers should use IDs only; names are for display only.
 * - You can override PAT at runtime with localStorage or window injection.
 */

export const AIRTABLE_BASE_ID = 'appNAaCbdP5X6wWGR' as const;

/**
 * DEV fallback PAT (integrated per your request as previously done).
 * SECURITY NOTE:
 * - Prefer setting this at runtime instead:
 *   localStorage.setItem('AIRTABLE_PAT', 'your_pat_here')
 * - This fallback remains for preview/dev convenience only.
 */
const DEV_FALLBACK_PAT =
  'patzYKgOjdaLI4zCp.a43d1ad432e49a3db231a07f3330636b65595d4db77edfed12f95c0a17f49e89';

/**
 * Read Airtable PAT at runtime with safe fallbacks.
 */
export function getAirtableToken(): string | null {
  try {
    const ls = localStorage.getItem('AIRTABLE_PAT');
    if (ls && typeof ls === 'string' && ls.trim()) return ls.trim();
  } catch {
    // ignore
  }
  // @ts-expect-error optional window injection
  if (typeof window !== 'undefined' && window.__AIRTABLE_PAT__) {
    // @ts-expect-error optional window injection
    return String(window.__AIRTABLE_PAT__);
  }
  return DEV_FALLBACK_PAT || null;
}

/**
 * Table IDs (from provided schema)
 */
export const TABLE_IDS = {
  clinicalPrograms: 'tblCTUDN0EQWo1jAl',        // "Clinical Programs"
  resources: 'tblVtpSmbjdQTfXdI',               // "Resources"
  tags: 'tbl3WyJjKeNRszHPP',                    // "Tags"
  resourceTagsJunction: 'tbl4gE0MMU2SdiOI8',    // "ResourceTagsJunction"
  members: 'tblsxymfQsAnyg5OU',                 // "Members"
  // Legacy alias to keep existing pages compiling where they reference TABLE_IDS.programs
  programs: 'tblCTUDN0EQWo1jAl',
} as const;

/**
 * Field IDs grouped by table (IDs only).
 * Canonical keys reflect the new schema naming.
 */
export const FIELD_IDS = {
  clinicalPrograms: {
    programName: 'fldcA9E0TK9mq3W7I',             // Program_Name (primary)
    programDescription: 'fldLOY6tn3gpumgOY',      // Program_Description
    experienceLevel: 'fldS5Yug9jIbGYY5I',         // Experience_Level (multi-select)
    programSummary: 'fld1LEc2OrpuTLcv3',          // Program Summary (aiText)
    clinicalProgramAssets: 'fldoE57JDMA4HV1M0',   // Clinical Program Assets (export shows singleLineText)
    sortOrder: 'fldRzkc9e3EeVMtS6',               // Sort Order (number)
    programPhoto: 'fldvmCsjZMJlDUhLW',            // Program Photo (attachments)
    totalResourcesRollup: 'fldhz2EQvfaWv7wMb',    // Total Resources (rollup)
    resourceNeedsAnalysis: 'fldGiZUckwFyDyiAb',   // Resource Needs Analysis (aiText)
    assetTagsLink: 'fldCOwKQ4b4QKuQdZ',           // Asset Tags (exported as singleLineText, linkage TBD)
    clinicalProgramAssetsFromTags: 'fldnaIboiuRbewwdw', // Clinical Program Assets (from Asset Tags) (lookup)
    additionalResourcesFromTags: 'fldY9kj3OHPu6UBEU',   // Additional Resources (from Asset Tags) (lookup)
    slug: 'fldx9VV9lnEJJtveA',                    // Slug (formula)
    // NEW: Link field from Clinical Programs to Tags (program ↔ tags)
    programTagLink: 'fldSj5F4Vo4Kel0aq',          // tagName (record link → Tags)
  },
  resources: {
    name: 'fldwYWMDcpdLsrFGn',                    // name (primary)
    file: 'fldgk0nUY9CB79eTm',                    // file (attachments)
    description: 'fld6fkROLvyVMZ5Mc',             // description
    resourceType: 'fldTYpGqIatZNRhms',            // resourceType (singleSelect)
    resourceTagsJunction: 'fldi1ZQ7BGkutJhdo',    // ResourceTagsJunction (links)
  },
  tags: {
    tagName: 'fldeRcbrXlYErnS0y',                 // tagName (primary)
    tagType: 'fld9WiUTF4rnZFWc2',                 // tagType (singleSelect: UI Tab | Category | Subcategory | Filter Tag)
    parentTag: 'fldfmJ63awXQNJBFE',               // parentTag (self link)
    parentBacklink: 'fldA76hXAG5hHfylw',          // backlink from parentTag
    resourceTagsJunction: 'fldOzFc6KgIjYFRpK',    // ResourceTagsJunction (links)
    // NEW: Backlink from Tags to Clinical Programs (inverse of programTagLink)
    programsBacklink: 'fldnWmM8qbPpHUZEa',        // From field: Clinical Programs link
  },
  resourceTagsJunction: {
    lookupName: 'fldEJzpEeMol7gsie',              // lookupName (primary)
    resource: 'fldBXOKwvd7BNSJFZ',                // resource (links → Resources)
    tag: 'fldHFINmFGZA4KLqe',                     // tag (links → Tags)
  },

  // Legacy alias for pages using FIELD_IDS.programs.*
  programs: {
    name: 'fldcA9E0TK9mq3W7I',
    description: 'fldLOY6tn3gpumgOY',
    level: 'fldS5Yug9jIbGYY5I',
    summary: 'fld1LEc2OrpuTLcv3',
    photo: 'fldvmCsjZMJlDUhLW',
    sortOrder: 'fldRzkc9e3EeVMtS6',
  },
} as const;
