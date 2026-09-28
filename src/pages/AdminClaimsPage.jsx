import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { CheckSquare, CheckCircle, XCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

export function AdminClaimsPage({ setCurrentView, setSelectedItemId }) {
  const { isAdmin } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Review Modal state
  const [activeClaim, setActiveClaim] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const loadClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllClaims(statusFilter);
      setClaims(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching admin claims:', err);
      setError(err.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadClaims();
    }
  }, [isAdmin, statusFilter]);

  const handleDecision = async (status) => {
    if (!activeClaim) return;
    try {
      setProcessingId(activeClaim.id);
      await api.updateClaimStatus(activeClaim.id, status, adminNotes);
      setActiveClaim(null);
      setAdminNotes('');
      loadClaims();
    } catch (err) {
      alert('Failed to update claim decision: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-xs text-rose-600">Administrator access required.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ownership Claims Verification Desk</h1>
          <p className="text-xs text-slate-500">Review student proof of ownership and validate legitimate handovers</p>
        </div>

        <button
          onClick={loadClaims}
          className="px-3.5 py-1.5 text-xs font-medium border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Claims</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setStatusFilter('')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            statusFilter === ''
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          All Claims
        </button>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            statusFilter === 'PENDING'
              ? 'border-amber-600 text-amber-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setStatusFilter('ACCEPTED')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            statusFilter === 'ACCEPTED'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Accepted
        </button>
        <button
          onClick={() => setStatusFilter('REJECTED')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            statusFilter === 'REJECTED'
              ? 'border-slate-600 text-slate-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Rejected
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
            <div key={n} className="h-32 bg-slate-100 rounded-lg animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : claims.length > 0 ? (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Badge type={claim.status} label={claim.status} />
                  <h3 className="font-semibold text-slate-900 text-sm">
                    {claim.itemTitle}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Claim #{claim.id}</span>
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  Filed: {new Date(claim.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Claimant Info</span>
                  <div className="font-semibold text-slate-800">{claim.claimant_name}</div>
                  <div className="text-slate-500">{claim.claimant_email}</div>
                  <div className="text-slate-500">Ph: {claim.claimant_phone}</div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <span className="text-slate-400 font-medium block">Ownership Proof Submitted</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200/80 leading-relaxed">
                    {claim.proof_details}
                  </p>
                  {claim.explanation && (
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      Context: {claim.explanation}
                    </p>
                  )}
                </div>
              </div>

              {claim.admin_notes && (
                <div className="text-xs p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-600">
                  <strong className="text-slate-800">Admin Audit Note:</strong> {claim.admin_notes}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedItemId(claim.item_id);
                    setCurrentView('item-details');
                  }}
                  className="text-xs text-indigo-700 hover:text-indigo-900 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>View Original Found Item</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {claim.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveClaim(claim);
                        setAdminNotes('');
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Make Decision (Accept / Reject)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-900 text-sm">No claims are currently pending.</h3>
          <p className="text-xs text-slate-500">There are no ownership claims awaiting administrative verification.</p>
        </div>
      )}

      {/* Decision Modal */}
      {activeClaim && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-base">Authorize Claim Decision</h3>
                <p className="text-xs text-slate-400">Claimant: {activeClaim.claimant_name}</p>
              </div>
              <button
                onClick={() => setActiveClaim(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-700 block">Provided Identifying Proof:</span>
                <p className="text-slate-600">{activeClaim.proof_details}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Administrative Note / Verification Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Verified photo ID and matched serial number at Helpdesk Desk A..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px] leading-relaxed">
                <strong>Business Rule:</strong> Accepting this claim automatically transitions the target Found item status in MySQL to <strong>CLAIMED</strong>.
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveClaim(null)}
                  className="px-3.5 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processingId !== null}
                  onClick={() => handleDecision('REJECTED')}
                  className="px-3.5 py-2 bg-rose-600 text-white rounded font-semibold hover:bg-rose-700 cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Claim</span>
                </button>
                <button
                  type="button"
                  disabled={processingId !== null}
                  onClick={() => handleDecision('ACCEPTED')}
                  className="px-4 py-2 bg-emerald-700 text-white rounded font-semibold hover:bg-emerald-800 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Accept Claim</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
