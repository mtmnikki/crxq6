/**
 * Resources page (Complete Resource Library)
 * - Desktop-dense layout with compact controls.
 * - Supports deep-link filtering via ?cat=handouts|billing|clinical.
 * - Category pills are interactive and synchronized with the URL.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import AppShell from '../components/layout/AppShell';
import MemberSidebar from '../components/layout/MemberSidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Search,
  ListFilter,
  LayoutGrid,
  FileText,
  BookText,
  FileSpreadsheet,
  ClipboardList,
} from 'lucide-react';
import { listAllRecords, AirtableRecord } from '../lib/airtable';

/**
 * Resource row structure for the demo table
 */
interface LibResource {
  id: string;
  name: string;
  program: string;
  type: 'Clinical' | 'Form' | 'Handout' | 'Protocol' | 'General';
}

/**
 * Category keys handled via URL param (?cat=...)
 */
type CategoryKey = 'handouts' | 'billing' | 'clinical';


/**
 * Lightweight pill component with count (compact, interactive)
 */
function CategoryPill({
  icon: Icon,
  label,
  count,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  count: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs shadow-sm',
        active
          ? 'border-blue-300 bg-blue-50 text-blue-700'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      ].join(' ')}
    >
      <Icon className={['h-3.5 w-3.5', active ? 'text-blue-600' : 'text-slate-500'].join(' ')} />
      <span>{label}</span>
      <span
        className={[
          'ml-1 rounded-[4px] px-1.5 py-0.5 text-[11px]',
          active ? 'bg-white/70 text-blue-700' : 'bg-slate-100 text-slate-600',
        ].join(' ')}
      >
        {count}
      </span>
    </button>
  );
}

/**
 * Colored badge for resource types
 */
function TypeBadge({ type }: { type: LibResource['type'] }) {
  const map: Record<LibResource['type'], string> = {
    Clinical: 'bg-amber-100 text-amber-700',
    Form: 'bg-rose-100 text-rose-700',
    Handout: 'bg-emerald-100 text-emerald-700',
    Protocol: 'bg-sky-100 text-sky-700',
    General: 'bg-slate-100 text-slate-700',
  };
  return <span className={`rounded-[4px] px-1.5 py-0.5 text-[11px] ${map[type]}`}>{type}</span>;
}

/**
 * Map category key to a resource type filter set
 * - billing -> 'Form'
 * - handouts -> 'Handout'
 * - clinical -> 'Clinical'
 */
function typesForCategory(cat: CategoryKey): Array<LibResource['type']> {
  switch (cat) {
    case 'billing':
      return ['Form'];
    case 'handouts':
      return ['Handout'];
    case 'clinical':
      return ['Clinical'];
  }
}

/**
 * Parse the active category from the current URL query string
 */
function getCategoryFromSearch(search: string): CategoryKey | null {
  const qs = new URLSearchParams(search);
  const v = (qs.get('cat') || '').toLowerCase();
  if (v === 'handouts' || v === 'billing' || v === 'clinical') return v;
  return null;
}

/**
 * Resources page component (compact + filterable)
 */
export default function Resources() {
  const location = useLocation();
  const navigate = useNavigate();

  // Search state (top bar)
  const [search, setSearch] = useState('');
  // Active category derived from URL (?cat=...)
  const [activeCat, setActiveCat] = useState<CategoryKey | null>(getCategoryFromSearch(location.search));
  const [resources, setResources] = useState<LibResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /** Sync category with URL when it changes externally (e.g., via sidebar navigation) */
  useEffect(() => {
    setActiveCat(getCategoryFromSearch(location.search));
  }, [location.search]);

  /** Load resources from Airtable */
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await listAllRecords<Record<string, any>>({
          table: 'ResourceLibrary',
          fields: ['resourceName', 'className', 'programName'],
        });
        if (!mounted) return;
        const mapped: LibResource[] = res.map((r: AirtableRecord<Record<string, any>>) => ({
          id: r.id,
          name: (r.fields['resourceName'] as string) || 'Untitled',
          program: '',
          type: ((r.fields['className'] as string) || 'General') as LibResource['type'],
        }));
        setResources(mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load resources');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  /** Apply filter function based on active category + search */
  const filtered = useMemo(() => {
    const cat = activeCat ? typesForCategory(activeCat) : null;
    return resources.filter((r) => {
      const byCat = cat ? cat.includes(r.type) : true;
      const q = search.trim().toLowerCase();
      const bySearch = q ? (r.name.toLowerCase().includes(q) || r.program.toLowerCase().includes(q)) : true;
      return byCat && bySearch;
    });
  }, [activeCat, search, resources]);

  /** Quick counters for pills */
  const counts = useMemo(() => {
    return {
      handouts: resources.filter((r) => r.type === 'Handout').length,
      clinical: resources.filter((r) => r.type === 'Clinical').length,
      billing: resources.filter((r) => r.type === 'Form').length,
      protocols: resources.filter((r) => r.type === 'Protocol').length,
    };
  }, [resources]);

  /** Handlers to set category and sync URL */
  function setCategory(cat: CategoryKey | null) {
    const qs = new URLSearchParams(location.search);
    if (cat) {
      qs.set('cat', cat);
    } else {
      qs.delete('cat');
    }
    navigate({ pathname: '/resources', search: qs.toString() }, { replace: false });
  }

  return (
    <AppShell
      header={
        <div className="mx-auto w-full max-w-[1440px] px-3 py-3 text-[13px]">
          <div className="space-y-0.5">
            <div className="text-[20px] font-semibold">Complete Resource Library</div>
            <div className="text-[12px] text-slate-600">
              Browse all {resources.length} clinical and general pharmacy resources
            </div>
          </div>

          {/* Search and actions row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by keyword, file name, or tag..."
                className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-24 text-[13px] shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
              <Button
                variant="outline"
                className="bg-transparent absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2.5 text-[12px]"
                onClick={() => {
                  // no-op submit in demo; search applies as you type
                }}
              >
                Search
              </Button>
            </div>

            <Button variant="outline" className="bg-transparent h-8 gap-1.5 px-2.5">
              <LayoutGrid className="h-3.5 w-3.5" />
              View
            </Button>
            <Button variant="outline" className="bg-transparent h-8 gap-1.5 px-2.5">
              <ListFilter className="h-3.5 w-3.5" />
              Filters
            </Button>
          </div>

          {/* Category pills (interactive) */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <CategoryPill
              icon={FileText}
              label="Patient Handouts"
              count={counts.handouts}
              active={activeCat === 'handouts'}
              onClick={() => setCategory('handouts')}
            />
            <CategoryPill
              icon={BookText}
              label="Clinical Resources"
              count={counts.clinical}
              active={activeCat === 'clinical'}
              onClick={() => setCategory('clinical')}
            />
            <CategoryPill
              icon={FileSpreadsheet}
              label="Medical Billing"
              count={counts.billing}
              active={activeCat === 'billing'}
              onClick={() => setCategory('billing')}
            />
            <CategoryPill icon={ClipboardList} label="Protocols" count={counts.protocols} active={false} />
            {/* Clear filter chip (shows when filtered) */}
            {activeCat && (
              <button
                type="button"
                onClick={() => setCategory(null)}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      }
      sidebar={<MemberSidebar />}
    >
      {loading ? (
        <div className="py-10 text-center text-sm text-slate-600">Loading resources…</div>
      ) : error ? (
        <div className="py-10 text-center text-sm text-red-600">{error}</div>
      ) : (
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Resource Library</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Header row */}
            <div className="mb-1.5 grid grid-cols-[1fr_160px_110px_110px] items-center gap-2 px-2 text-[11px] font-medium text-slate-500">
              <div>Resource Name</div>
              <div>Program</div>
              <div>Type</div>
              <div className="text-right">Action</div>
            </div>
            <div className="divide-y rounded-md border border-slate-200 bg-white">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[1fr_160px_110px_110px] items-center gap-2 px-3 py-2 text-[13px]"
                >
                  <div className="font-medium text-slate-800">{r.name}</div>
                  <div className="text-slate-700">{r.program}</div>
                  <div>
                    <TypeBadge type={r.type} />
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" className="bg-transparent h-8 px-3">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-6 text-center text-[13px] text-slate-600">
                  No resources match your filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
