/**
 * Program Detail page - Shows detailed information about a specific clinical program
 * - Uses Airtable Table IDs and Field IDs directly
 * - Supports both slug and record ID in the URL for backward compatibility
 * - Shows program overview, modules, resources, and implementation details
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  CheckCircle, 
  Play, 
  Download,
  ArrowLeft,
  Star
} from 'lucide-react';
import { getRecord, listRecords, AirtableRecord } from '../lib/airtable';
import { FIELD_IDS, TABLE_IDS } from '../config/airtableConfig';
import { slugify } from '../lib/slug';
import { getSelectText } from '../lib/cellValue';
import SafeText from '../components/common/SafeText';
import Breadcrumbs from '../components/common/Breadcrumbs';
import GradientStrokeIcon from '../components/common/GradientStrokeIcon';

interface ModuleUI {
  id: string;
  title: string;
  description: string;
  duration?: string;
  videoUrl?: string;
  completed?: boolean;
}

interface ResourceUI {
  id: string;
  title: string;
  type: string;
  url?: string;
  description?: string;
}

interface ProgramDetailUI {
  id: string;
  title: string;
  description: string;
  level?: string;
  duration?: string;
  modules: ModuleUI[];
  resources: ResourceUI[];
  image?: string;
  highlights?: string[];
}

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<ProgramDetailUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    async function loadProgram() {
      try {
        setLoading(true);
        setError('');

        // Try to find by slug first, then by record ID
        let record: AirtableRecord<Record<string, any>> | null = null;
        
        // Try to get by record ID first (for backward compatibility)
        if (id.startsWith('rec')) {
          try {
            record = await getRecord<Record<string, any>>({
              tableId: TABLE_IDS.programs,
              recordId: id,
              fields: [
                FIELD_IDS.programs.name,
                FIELD_IDS.programs.description,
                FIELD_IDS.programs.level,
                FIELD_IDS.programs.photo,
                FIELD_IDS.programs.summary,
              ],
            });
          } catch (e) {
            // Record not found by ID, continue to slug search
          }
        }

        // If not found by ID, search by slug
        if (!record) {
          const allRecords = await listRecords<Record<string, any>>({
            tableId: TABLE_IDS.programs,
            pageSize: 100,
            fields: [
              FIELD_IDS.programs.name,
              FIELD_IDS.programs.description,
              FIELD_IDS.programs.level,
              FIELD_IDS.programs.photo,
              FIELD_IDS.programs.summary,
            ],
          });

          const found = allRecords.records.find(r => {
            const title = r.fields[FIELD_IDS.programs.name] as string || '';
            return slugify(title) === id;
          });

          if (found) {
            record = found;
          }
        }

        if (!record) {
          setError('Program not found');
          return;
        }

        // Map to UI format
        const title = (record.fields[FIELD_IDS.programs.name] as string) || 'Untitled Program';
        const description = (record.fields[FIELD_IDS.programs.description] as string) || 
                           (record.fields[FIELD_IDS.programs.summary] as string) || '';
        const level = getSelectText(record.fields[FIELD_IDS.programs.level]);
        
        // Mock modules and resources for now
        const modules: ModuleUI[] = [
          {
            id: '1',
            title: 'Introduction',
            description: 'Overview of the program and its objectives',
            duration: '30 min',
            videoUrl: '#',
            completed: false
          },
          {
            id: '2',
            title: 'Core Concepts',
            description: 'Understanding the fundamental principles',
            duration: '45 min',
            videoUrl: '#',
            completed: false
          }
        ];

        const resources: ResourceUI[] = [
          {
            id: '1',
            title: 'Program Manual',
            type: 'PDF',
            url: '#',
            description: 'Comprehensive guide to implementing the program'
          },
          {
            id: '2',
            title: 'Training Video',
            type: 'Video',
            url: '#',
            description: 'Step-by-step implementation guide'
          }
        ];

        const image = record.fields[FIELD_IDS.programs.photo] as any;
        const imageUrl = image && image.length > 0 ? image[0].url : undefined;

        const programData: ProgramDetailUI = {
          id: record.id,
          title,
          description,
          level,
          duration: '8 weeks',
          modules,
          resources,
          image: imageUrl,
          highlights: level ? [level] : []
        };

        if (mounted) {
          setProgram(programData);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || 'Failed to load program');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProgram();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-64 bg-gray-200 rounded mb-8"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Program Not Found</h1>
            <p className="text-gray-600 mb-8">
              The program you're looking for doesn't exist or may have been moved.
            </p>
            <Link to="/programs">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Programs
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', to: '/dashboard' },
              { label: 'Clinical Programs', to: '/member-content' },
              { label: program.title },
            ]}
          />
        </div>

        {/* Hero Section */}
        <div className="mb-8">
          <Link to="/member-content" className="inline-flex items-center text-cyan-600 hover:text-cyan-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Link>
          
          <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 text-white rounded-2xl p-8 mb-6">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold">
                    <SafeText value={program.title} />
                  </h1>
                  {program.level && (
                    <Badge className="bg-white/20 text-white border-white/30">
                      <SafeText value={program.level} />
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-white/90 mb-4">
                  <SafeText value={program.description} />
                </p>
                <div className="flex items-center gap-6 text-white/80">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span><SafeText value={program.duration} /></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Self-paced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Certificate</span>
                  </div>
                </div>
              </div>
              
              {program.image && (
                <div className="lg:w-1/3">
                  <img 
                    src={program.image} 
                    alt={program.title}
                    className="rounded-xl shadow-lg w-full h-64 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Program Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      <SafeText value={program.description} />
                    </p>
                    
                    {program.highlights && program.highlights.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Key Highlights</h3>
                        <ul className="space-y-2">
                          {program.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">
                                <SafeText value={highlight} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="modules" className="mt-6">
              <div className="space-y-4">
                {program.modules.map((module) => (
                  <Card key={module.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              <SafeText value={module.title} />
                            </h3>
                            {module.completed && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">
                            <SafeText value={module.description} />
                          </p>
                          {module.duration && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span><SafeText value={module.duration} /></span>
                            </div>
                          )}
                        </div>
                        <Button>
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {program.resources.map((resource) => (
                  <Card key={resource.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 rounded-lg flex items-center justify-center text-white">
                            {resource.type === 'PDF' ? (
                              <GradientStrokeIcon name="file" size={20} />
                            ) : (
                              <GradientStrokeIcon name="video" size={20} />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1">
                            <SafeText value={resource.title} />
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            <SafeText value={resource.description} />
                          </p>
                          <Badge variant="outline" className="bg-transparent">
                            <SafeText value={resource.type} />
                          </Badge>
                        </div>
                        <div className="flex-shrink-0">
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="implementation" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Implementation Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
                      <ol className="space-y-2 list-decimal list-inside text-gray-700">
                        <li>Review all program materials and resources</li>
                        <li>Complete the assessment to determine your readiness</li>
                        <li>Develop an implementation timeline for your pharmacy</li>
                        <li>Train your team on the core concepts and workflows</li>
                        <li>Launch with a pilot group of patients</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Success Factors</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Team buy-in and commitment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Consistent workflow implementation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">Regular performance monitoring</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}