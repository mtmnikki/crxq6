/**
 * Dashboard page
 * - Shows member info and list of clinical programs loaded from Airtable.
 * - Desktop-dense pass: compact typography, smaller paddings, tighter grid gaps.
*/

import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../components/auth/AuthContext';
import { listAllRecords } from '../lib/airtable';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText } from 'lucide-react';
import { Link } from 'react-router';
import AirtableStatus from '../components/ui/AirtableStatus';
import MemberSidebar from '../components/layout/MemberSidebar';

/**
 * Helper UI chips (compact)
 */
const StatChip: React.FC<{ label: string }> = ({ label }) => (
  <div className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">{label}</div>
);

/**
 * Dashboard component (compact)
 */
export default function Dashboard() {
  const { member } = useAuth();
  const [programs, setPrograms] = useState<Array<{ id: string; name: string; description: string; slug: string }>>([]);

  /**
   * Load programs from Airtable
   */
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await listAllRecords<Record<string, any>>({
          table: 'ClinicalPrograms',
          fields: ['programName', 'programDescription', 'programSlug'],
        });
        if (!mounted) return;
        const mapped = res.map((r) => ({
          id: r.id,
          name: (r.fields['programName'] as string) || 'Untitled Program',
          description: (r.fields['programDescription'] as string) || '',
          slug: (r.fields['programSlug'] as string) || r.id,
        }));
        setPrograms(mapped);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error loading programs:', e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  /** Compute subscription color chip */
  const subColor = useMemo(() => {
    switch (member?.subscriptionStatus) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Expiring':
        return 'bg-amber-100 text-amber-700';
      case 'Expired':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }, [member?.subscriptionStatus]);

  return (
    <AppShell
      header={
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-3 py-3 text-[13px]">
          <div>
            <div className="text-lg font-semibold">Welcome back, {member?.pharmacyName ?? 'Member'}</div>
            {/* Meta row: keep useful context chips, remove dates */}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-slate-600">
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${subColor}`}>
                {member?.subscriptionStatus ?? 'Active'}
              </span>
              <AirtableStatus />
            </div>
          </div>
          <Link to="/resources">
            <Button variant="outline" className="bg-transparent h-8 px-3">
              Browse Resources
            </Button>
          </Link>
        </div>
      }
      sidebar={<MemberSidebar />}
    >
      {/* Programs overview */}
      <section className="mb-6">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Clinical Programs</h2>
          <div className="flex items-center gap-1.5">
            <StatChip label="49+ Active Pharmacies" />
            <StatChip label="HIPAA Compliant" />
            <StatChip label="Updated Monthly" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((p) => (
            <Link key={p.slug} to={`/program/${p.slug}`}>
              <Card className="group border-blue-50 hover:border-blue-200 hover:shadow-md">
                <CardHeader className="pb-1.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-sm">{p.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-[13px] text-slate-600">{p.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
