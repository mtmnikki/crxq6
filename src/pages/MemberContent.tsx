/**
 * Member Content page - Central hub for accessing all clinical programs and resources
 * - Adds breadcrumb navigation anchored at Dashboard.
 * Uses Airtable Table IDs and Field IDs directly (no formulas).
 * Links Program Detail using a human-readable slug derived from Program Name.
 * ProgramDetail supports both slug and recXXXXXXXX for backward compatibility.
 * - Sanitizes description/level fields to avoid rendering [object Object].
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { BookOpen, FileText, Clock as ClockIcon, Zap, Award, Play } from 'lucide-react';

import { listRecords, AirtableRecord } from '../lib/airtable';
import { FIELD_IDS, TABLE_IDS } from '../config/airtableConfig';
import { slugify } from '../lib/slug';
import { getSelectText } from '../lib/cellValue';
import SafeText from '../components/common/SafeText';
import Breadcrumbs from '../components/common/Breadcrumbs';

/** UI type for program card on MemberContent */
interface ProgramUIItem {
  id: string;
  title: string;
  description: string;
  level?: string;
  highlights?: string[];
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Coerce unknown Airtable field to a usable text string.
 * - Strings trimmed
 * - Arrays of strings joined
 * - Objects try common keys (text, value, plain_text, content, description)
 * - Otherwise empty string
 */
function coerceToText(value: unknown): string {
  if (typeof value === 'string') {
    const s = value.trim();
    return s;
  }
  if (value == null) return '';
  if (Array.isArray(value)) {
    const parts = value.map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean);
    return parts.join(' ').trim();
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const candidates = [obj['text'], obj['value'], obj['plain_text'], obj['content'], obj['description']];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c.trim();
      if (Array.isArray(c)) {
        const s = c.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean).join(' ').trim();
        if (s) return s;
      }
    }
  }
  return '';
}

/**
 * Map a textual level/category to a gradient + icon
 */
function getProgramVisuals(level?: string) {
  const lower = (level || '').toLowerCase();
  if (lower.includes('advanced') || lower.includes('expert')) {
    return { color: 'from-blue-600 via-cyan-500 to-teal-300', icon: Zap };
  }
  if (lower.includes('intermediate')) {
    return { color: 'from-blue-600 via-cyan-500 to-teal-300', icon: Award };
  }
  if (lower.includes('beginner') || lower.includes('foundation') || lower.includes('essential')) {
    return { color: 'from-blue-600 via-cyan-500 to-teal-300', icon: FileText };
  }
  return { color: 'from-blue-600 via-cyan-500 to-teal-300', icon: FileText };
}

export default function MemberContent() {
  const [items, setItems] = useState<ProgramUIItem[] | null>(null);
  const [error, setError] = useState<string>('');

  /** Load programs via Table/Field IDs (no formulas). */
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await listRecords<Record<string, any>>({
          tableId: TABLE_IDS.programs,
          pageSize: 100,
          fields: [
            FIELD_IDS.programs.name,
            FIELD_IDS.programs.summary,
            FIELD_IDS.programs.description,
            FIELD_IDS.programs.level,
            FIELD_IDS.programs.sortOrder,
          ],
        });

        if (!mounted) return;

        // Map to UI and sort by Sort Order (ascending) when available.
        const ui = res.records
          .map((rec: AirtableRecord<Record<string, any>>): ProgramUIItem => {
            const title = (rec.fields[FIELD_IDS.programs.name] as string) || 'Untitled Program';
            const summaryRaw = rec.fields[FIELD_IDS.programs.summary];
            const descriptionRaw = rec.fields[FIELD_IDS.programs.description];
            const description = coerceToText(summaryRaw) || coerceToText(descriptionRaw) || '';
            const levelSelect = getSelectText(rec.fields[FIELD_IDS.programs.level]);
            const level = coerceToText(levelSelect) || undefined;
            const visuals = getProgramVisuals(level);
            return {
              id: rec.id, // Airtable record ID
              title,
              description,
              level,
              highlights: level ? [level] : undefined,
              color: visuals.color,
              icon: visuals.icon,
            };
          })
          .sort((a, b) => {
            const aRec = res.records.find((r) => r.id === a.id);
            const bRec = res.records.find((r) => r.id === b.id);
            const aSort = Number(aRec?.fields[FIELD_IDS.programs.sortOrder] || 0);
            const bSort = Number(bRec?.fields[FIELD_IDS.programs.sortOrder] || 0);
            return aSort - bSort;
          });

        setItems(ui);
      } catch (e: any) {
        setError(e?.message || 'Failed to load programs');
        setItems(null);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Static fallback items for preview if Airtable fails
  const fallbackPrograms: ProgramUIItem[] = useMemo(
    () => [
      {
        id: 'fallback-1',
        title: 'MTM The Future Today',
        description:
          'Comprehensive, team-based training system for Medication Therapy Management services',
        level: 'Foundation',
        highlights: ['Flagship Program', 'Team-Based', 'Proven ROI'],
        color: 'from-blue-600 via-cyan-500 to-teal-300',
        icon: FileText,
      },
      {
        id: 'fallback-2',
        title: 'TimeMyMeds',
        description:
          'Medication synchronization program creating proactive, appointment-based patient care',
        level: 'Essential',
        highlights: ['Operational Flywheel', 'Patient Loyalty', 'Workflow'],
        color: 'from-blue-600 via-cyan-500 to-teal-300',
        icon: ClockIcon,
      },
    ],
    []
  );

  const programs = items ?? fallbackPrograms;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Breadcrumbs
              variant="light"
              items={[
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Clinical Programs' },
              ]}
              className="mb-4"
            />
            <h1 className="text-4xl font-bold mb-4">Member Content</h1>
            <p className="text-xl text-white/90">Access your clinical training programs and exclusive resources</p>
          </div>
        </div>
      </section>

      {/* Quick Access to Resources */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 border-cyan-400">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Resource Library</h3>
                    <p className="text-gray-600">Access clinical tools, forms, and educational materials</p>
                  </div>
                </div>
                <Link to="/resources">
                  <Button className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 hover:opacity-90">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Resources
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Clinical Programs */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Your Clinical Programs</h2>
              <p className="text-gray-600 text-lg">
                Complete training programs with protocols, resources, and implementation support
              </p>
              {error && <p className="text-sm text-red-600 mt-2"><SafeText value={error} /> — showing example data for preview</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {programs.map((program) => {
                const Icon = program.icon;
                const to = `/program/${slugify(program.title)}`;

                return (
                  <Card key={program.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${program.color}`}></div>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${program.color} flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {program.level && (
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <SafeText value={program.level} />
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2">
                        <SafeText value={program.title} />
                      </CardTitle>
                      {/* Description under program name - sanitized */}
                      {program.description ? (
                        <CardDescription className="text-gray-600 mb-4">
                          <SafeText value={program.description} />
                        </CardDescription>
                      ) : null}
                    </CardHeader>

                    <CardContent>
                      <div className="flex gap-3">
                        <Link to={to} className="flex-1">
                          <Button className={`w-full bg-gradient-to-r ${program.color} hover:opacity-90`}>
                            <Play className="h-4 w-4 mr-2" />
                            View Program
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
