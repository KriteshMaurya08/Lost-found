import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { CheckSquare, ArrowRight, AlertCircle, Clock, ShieldCheck, XCircle } from 'lucide-react';

export function MyClaimsPage({ setCurrentView, setSelectedItemId }) {
  const { user, isAuthenticated } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadClaims() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getMyClaims();
        setClaims(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError(err.message || 'Failed to load claims');
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadClaims();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500">Please sign in to view ownership claims you submitted.</p>
        <button
          onClick={() => setCurrentView('login')}
          className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Ownership Claims</h1>
        <p className="text-xs text-slate-500">Track verification status of claims you submitted for found articles</p>
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
            <div key={n} className="h-28 bg-slate-100 rounded-lg animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : claims.length > 0 ? (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Badge type={claim.status} label={claim.status} />
                  <span className="font-semibold text-slate-900 text-sm">{claim.itemTitle}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Claim ID: #{claim.id} • Filed: {new Date(claim.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 font-medium block">Proof Provided:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200/80 leading-relaxed">
                    {claim.proof_details}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium block">Administrative Review Note:</span>
                  <div className={`p-2.5 rounded border text-xs leading-relaxed ${
                    claim.status === 'ACCEPTED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : claim.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50/60 text-amber-800 border-amber-200'
                  }`}>
                    {claim.admin_notes || (
                      claim.status === 'PENDING'
                        ? 'Pending review by campus security/administration desk.'
                        : 'No additional notes provided.'
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  Item Status: <strong>{claim.itemStatus || 'ACTIVE'}</strong>
                </span>

                <button
                  onClick={() => {
                    setSelectedItemId(claim.item_id);
                    setCurrentView('item-details');
                  }}
                  className="text-xs font-medium text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Found Item Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-900 text-sm">You have not submitted any claims yet.</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            If you recognize your belongings in the Found Items directory, open the item and click Submit Ownership Claim.
          </p>
          <button
            onClick={() => setCurrentView('found-items')}
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Browse Found Items
          </button>
        </div>
      )}
    </div>
  );
}
