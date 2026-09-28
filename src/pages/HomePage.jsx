import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ItemCard } from '../components/items/ItemCard';
import {
  Search, PlusCircle, ShieldCheck, CheckCircle2, ArrowRight,
  Sparkles, RefreshCw, AlertTriangle, HelpCircle, Layers
} from 'lucide-react';

export function HomePage({ setCurrentView, setSelectedItemId, openArchModal }) {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    totalLostItems: 0,
    totalFoundItems: 0,
    activeItems: 0,
    pendingClaims: 0,
    resolvedItems: 0,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch recent items and stats directly from MySQL backend
        const [itemsData, statsData] = await Promise.all([
          api.getItems({ sort: 'newest' }),
          api.getAdminStats().catch(() => null),
        ]);

        if (Array.isArray(itemsData)) {
          setRecentItems(itemsData.slice(0, 4));
        }

        if (statsData) {
          setStats(statsData);
        } else if (Array.isArray(itemsData)) {
          // Derive fallback metrics if not admin
          const lostCount = itemsData.filter((i) => i.type === 'LOST').length;
          const foundCount = itemsData.filter((i) => i.type === 'FOUND').length;
          const activeCount = itemsData.filter((i) => i.status === 'ACTIVE').length;
          setStats({
            totalLostItems: lostCount,
            totalFoundItems: foundCount,
            activeItems: activeCount,
            pendingClaims: 0,
            resolvedItems: itemsData.filter((i) => i.status === 'RETURNED' || i.status === 'RESOLVED').length,
          });
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 mb-4">
              <span>CAMPUS REGISTRY</span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold">SPRING BOOT & MYSQL BACKED</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Lost something on campus?<br />
              <span className="text-indigo-900 font-medium">Or found someone’s belongings?</span>
            </h1>

            <p className="text-base text-slate-600 mb-8 leading-relaxed max-w-2xl">
              The centralized college portal to report, search, match, and claim misplaced belongings across campus departments, libraries, lecture halls, and sports facilities.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCurrentView(isAuthenticated ? 'report-lost' : 'login')}
                className="px-5 py-2.5 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Lost Item</span>
              </button>

              <button
                onClick={() => setCurrentView(isAuthenticated ? 'report-found' : 'login')}
                className="px-5 py-2.5 bg-emerald-700 text-white rounded-md text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Found Item</span>
              </button>

              <button
                onClick={() => setCurrentView('lost-items')}
                className="px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Browse Lost
              </button>

              <button
                onClick={() => setCurrentView('found-items')}
                className="px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Browse Found
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Real Statistics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-800 gap-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Real-Time Campus Registry Activity</h2>
              <p className="text-xs text-slate-400">Aggregated database counts from MySQL relational tables</p>
            </div>
            <button
              onClick={openArchModal}
              className="text-xs text-indigo-300 hover:text-white flex items-center gap-1.5 cursor-pointer underline underline-offset-2"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Inspect Database Queries</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
            <div>
              <div className="text-3xl font-bold font-mono text-indigo-400">{stats.activeItems ?? 0}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Active Items</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-rose-400">{stats.totalLostItems ?? 0}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Lost Reports</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-emerald-400">{stats.totalFoundItems ?? 0}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Found Deposited</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-teal-400">{stats.resolvedItems ?? 0}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Returned to Owners</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Campus Recovery Protocol</h2>
          <p className="text-xs text-slate-500">Standardized verification procedure for students and campus security</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="w-10 h-10 rounded-md bg-rose-50 text-rose-700 font-mono font-bold flex items-center justify-center mb-4 border border-rose-100">
              01
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">1. Report Misplaced or Found Item</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit details including campus location, category, date, and identifying characteristics. Logged-in accounts ensure verifiable communication.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="w-10 h-10 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold flex items-center justify-center mb-4 border border-indigo-100">
              02
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">2. Automated Match & Discovery</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our rule-based engine scores similarities across categories, locations, dates, and keywords to alert students of potential recoveries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-700 font-mono font-bold flex items-center justify-center mb-4 border border-emerald-100">
              03
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">3. Claim Verification & Handover</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              For found articles, submit ownership proof. Campus administration reviews claims to authorize safe collection at the security helpdesk.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Campus Reports Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Campus Reports</h2>
            <p className="text-xs text-slate-500">Live feed from the MySQL database</p>
          </div>
          <button
            onClick={() => setCurrentView('lost-items')}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 bg-slate-100 rounded-lg animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onViewDetails={(id) => {
                  setSelectedItemId(id);
                  setCurrentView('item-details');
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500 text-sm">
            No items registered yet. Use Report Lost or Report Found to register the first campus record.
          </div>
        )}
      </section>
    </div>
  );
}
