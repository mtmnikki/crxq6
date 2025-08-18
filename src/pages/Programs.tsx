/**
 * Programs page showcasing actual ClinicalRxQ training programs pulled from Airtable
 * - Uses Table IDs and Field IDs only (provided).
 * - Links to ProgramDetail using a human-readable slug derived from Program Name.
 * - Uses listAllRecords to transparently handle pagination.
 * - Shows subtle skeletons while loading for better UX.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Clock, Users, Star, CheckCircle } from 'lucide-react';
import { listAllRecords, AirtableRecord, getAttachmentArray } from '../lib/airtable';
import { FIELD_IDS, TABLE_IDS } from '../config/airtableConfig';
import { slugify } from '../lib/slug';
import { getSelectText } from '../lib/cellValue';
import SafeText from '../components/common/SafeText';

/**
 * UI type for a single program card on the Programs page
 */
interface ProgramUIItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  level?: string;
  image?: string;
  sortOrder?: number;
}

/**
 * Map a program level to a gradient and optional label style
 */
function levelBadge(level?: string) {
  if (!level) return null;
  const className = 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 text-white border-0';
  return { className, label: level };
}

/**
 * Skeleton card used while loading programs
 */
function ProgramCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-100 animate-pulse" />
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse mb-2" />
        <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 rounded bg-gray-200 animate-pulse" />
          <div className="h-10 rounded bg-gray-200 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Programs page component
 */
export default function Programs() {
  const [items, setItems] = useState<ProgramUIItem[] | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load programs from Airtable using Field IDs with transparent pagination
   */
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setIsLoading(true);
        setError('');

        // Fetch all program records across pages
        const records = await listAllRecords<Record<string, any>>({
          tableId: TABLE_IDS.programs,
          pageSize: 100,
          fields: [
            FIELD_IDS.programs.name,
            FIELD_IDS.programs.summary,
            FIELD_IDS.programs.description,
            FIELD_IDS.programs.level,
            FIELD_IDS.programs.photo,
            FIELD_IDS.programs.sortOrder,
          ],
        });

        if (!mounted) return;

        const ui: ProgramUIItem[] = records.map((rec: AirtableRecord<Record<string, any>>) => {
          const title = (rec.fields[FIELD_IDS.programs.name] as string) || 'Untitled Program';
          const summary = (rec.fields[FIELD_IDS.programs.summary] as string) || '';
          const description = summary || ((rec.fields[FIELD_IDS.programs.description] as string) || '');
          const levelRaw = rec.fields[FIELD_IDS.programs.level];
          const level = getSelectText(levelRaw);
          const image = getAttachmentArray(rec.fields[FIELD_IDS.programs.photo])[0]?.url;
          const sortOrderRaw = rec.fields[FIELD_IDS.programs.sortOrder];
          const sortOrder = typeof sortOrderRaw === 'number' ? sortOrderRaw : Number(sortOrderRaw || 0);

          return {
            id: rec.id,
            title,
            description,
            level,
            image,
            sortOrder,
          };
        });

        ui.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setItems(ui);
      } catch (e: any) {
        setError(e?.message || 'Failed to load programs');
        setItems(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Fallback static items for preview if Airtable is not available
   */
  const fallback: ProgramUIItem[] = useMemo(
    () => [
      {
        id: 'fallback-1',
        title: 'MTM The Future Today',
        description:
          'Comprehensive, team-based training system for highly efficient Medication Therapy Management services in community pharmacy.',
        level: 'Foundation',
        image:
          'https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/946cb9a3-fa24-49e7-b738-de077d81b547.jpg',
      },
      {
        id: 'fallback-2',
        title: 'TimeMyMeds Sync',
        description:
          'Medication synchronization program that transitions your pharmacy to proactive, appointment-based care.',
        level: 'Essential',
        image:
          'https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/c1c309c4-6e70-4a4e-80ab-46570de640d6.jpg',
      },
      {
        id: 'fallback-3',
        title: 'Test & Treat Services',
        description: 'CLIA-waived testing with pharmacist-led treatment for Flu, Strep, and COVID-19.',
        level: 'Advanced',
        image:
          'https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/367fbd69-f039-41cd-844a-6541f1f1925a.jpg',
      },
      {
        id: 'fallback-4',
        title: 'HbA1c Testing',
        description: 'Point-of-care A1c testing integrated with diabetes care and MTM workflows.',
        level: 'Intermediate',
        image:
          'https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/1cbdfd06-c689-489d-83cb-85872718236c.jpg',
      },
    ],
    []
  );

  const programs = items ?? fallback;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Professional Training Programs</h1>
            <p className="text-xl mb-8 text-white/90">
              Complete &quot;business-in-a-box&quot; solutions for advanced community pharmacy practice
            </p>
            <div className="flex justify-center items-center gap-8 text-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>8,000+ Active Members</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Turnkey Implementation</span>
              </div>
            </div>
            {error && (
              <p className="mt-6 text-sm bg-white/15 px-3 py-2 rounded-md">
                <SafeText value={error} />
                {' — showing example data for preview.'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <ProgramCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {programs.map((program) => {
                const badge = levelBadge(program.level);
                const imageSrc =
                  program.image ||
                  'https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/a79c5fc3-1105-4482-a7dc-92ab738ffa20.jpg';
                const to = `/program/${slugify(program.title)}`;

                return (
                  <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                      <img src={imageSrc} alt={program.title} className="w-full h-full object-cover" />
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          {badge ? (
                            <Badge variant="secondary" className={badge.className + ' text-xs'}>
                              <SafeText value={badge.label} />
                            </Badge>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1 opacity-0">
                          {/* Rating placeholder removed (no rating from Airtable). Keep layout consistent. */}
                          <Star className="h-4 w-4" />
                          <span className="text-sm font-medium">—</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl">
                        <SafeText value={program.title} />
                      </CardTitle>
                      {program.subtitle ? (
                        <CardDescription className="text-cyan-400 font-medium">
                          <SafeText value={program.subtitle} />
                        </CardDescription>
                      ) : null}
                      {program.description ? (
                        <p className="text-gray-600 mt-2">
                          <SafeText value={program.description} />
                        </p>
                      ) : null}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Comprehensive Training
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={to} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 hover:from-blue-700 hover:via-cyan-600 hover:to-teal-400">
                            Learn More
                          </Button>
                        </Link>
                        <Link to="/enroll" className="flex-1">
                          <Button variant="outline" className="bg-transparent w-full">
                            Enroll Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
