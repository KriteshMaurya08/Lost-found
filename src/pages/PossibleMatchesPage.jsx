import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Sparkles, ArrowRight, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export function PossibleMatchesPage({ setCurrentView, setSelectedItemId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPossibleMatches();
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err.message || 'Failed to load algorithmic matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleStatusChange = async (matchId, status) => {
    try {
      await api.updateMatchStatus(matchId, status);
      fetchMatches();
    } catch (err) {
      alert('Failed to update match: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mb-1">
            <span>ALGORITHMIC ENGINE</span>
            <span>•</span>
            <span>RULE-BASED CROSS REFERENCING</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Possible Lost & Found Matches</h1>
          <p className="text-xs text-slate-500">
            Automated scoring pairing active Lost reports with newly registered Found items based on category, location, date proximity, and keyword overlap.
          </p>
        </div>

        <button
          onClick={fetchMatches}
          className="px-3.5 py-1.5 text-xs font-medium border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Matches</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 bg-slate-100 rounded-lg animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-6">
          {matches.map((match) => {
            const lost = match.lostItem;
            const found = match.foundItem;
            if (!lost || !found) return null;

            return (
              <div key={match.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                {/* Match Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold font-mono text-sm">
                      {match.match_score}% Confidence Match
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Pair #{match.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(match.id, 'DISMISSED')}
                      className="text-xs px-2.5 py-1 text-slate-500 hover:text-slate-800 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
                    >
                      Dismiss Pair
                    </button>
                  </div>
                </div>

                {/* Algorithmic Reason Box */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-800 block mb-1">Algorithmic Correlation Logic:</span>
                  <p className="text-slate-600 leading-relaxed">{match.match_reasons}</p>
                </div>

                {/* Dual Column: Lost vs Found Item */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lost Item Summary */}
                  <div className="p-4 rounded-lg border border-rose-100 bg-rose-50/20 space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge type="LOST" label="Reported Lost" size="sm" />
                      <span className="text-[11px] text-slate-500 font-mono">Reported: {lost.date_reported}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">{lost.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{lost.description}</p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      <span>Location: <strong>{lost.location_name}</strong></span> • <span>Category: <strong>{lost.category_name}</strong></span>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setSelectedItemId(lost.id);
                          setCurrentView('item-details');
                        }}
                        className="text-xs font-semibold text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Lost Report</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Found Item Summary */}
                  <div className="p-4 rounded-lg border border-emerald-100 bg-emerald-50/20 space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge type="FOUND" label="Discovered Found" size="sm" />
                      <span className="text-[11px] text-slate-500 font-mono">Found: {found.date_reported}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">{found.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{found.description}</p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      <span>Location: <strong>{found.location_name}</strong></span> • <span>Category: <strong>{found.category_name}</strong></span>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setSelectedItemId(found.id);
                          setCurrentView('item-details');
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Found Item</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-900 text-sm">No Potential Matches Currently</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            As new items are reported lost and found with matching categories, locations, dates, or keywords, the system automatically computes match scores and lists candidates here.
          </p>
        </div>
      )}
    </div>
  );
}
