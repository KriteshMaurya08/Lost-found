import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import {
  ArrowLeft, MapPin, Calendar, Tag, User, Mail, Phone,
  CheckCircle, AlertCircle, ShieldAlert, Sparkles, Send, Trash2
} from 'lucide-react';

export function ItemDetailsPage({ itemId, setCurrentView, setSelectedItemId }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Claim Form State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({
    claimantName: '',
    claimantEmail: '',
    claimantPhone: '',
    proofDetails: '',
    explanation: '',
  });
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState(null);

  // Status update state (for owner/admin)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getItemById(itemId);
      setItem(data);

      // Pre-fill claim form with logged-in user data
      if (user) {
        setClaimForm((prev) => ({
          ...prev,
          claimantName: user.fullName || '',
          claimantEmail: user.email || '',
          claimantPhone: user.phone || '',
        }));
      }

      // Load algorithmic matches for this item
      try {
        const itemMatches = await api.getMatchesForItem(itemId, data.type);
        setMatches(Array.isArray(itemMatches) ? itemMatches : []);
      } catch (err) {
        console.warn('Matches fetch skipped:', err);
      }
    } catch (err) {
      console.error('Error loading item:', err);
      setError(err.message || 'Item could not be found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      loadItemDetails();
    }
  }, [itemId]);

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdateLoading(true);
      await api.updateItemStatus(item.id, newStatus);
      setFeedbackMsg(`Status successfully updated to ${newStatus}`);
      await loadItemDetails();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      await api.deleteItem(item.id);
      alert('Report deleted successfully');
      setCurrentView(item.type === 'LOST' ? 'lost-items' : 'found-items');
    } catch (err) {
      alert('Failed to delete report: ' + err.message);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimForm.claimantName || !claimForm.claimantEmail || !claimForm.claimantPhone || !claimForm.proofDetails) {
      setClaimError('Please fill in all required fields including identifying proof.');
      return;
    }

    try {
      setClaimLoading(true);
      setClaimError(null);
      await api.createClaim({
        itemId: item.id,
        claimantName: claimForm.claimantName,
        claimantEmail: claimForm.claimantEmail,
        claimantPhone: claimForm.claimantPhone,
        proofDetails: claimForm.proofDetails,
        explanation: claimForm.explanation,
      });

      setClaimSuccess(true);
      setTimeout(() => {
        setShowClaimModal(false);
        setClaimSuccess(false);
      }, 2500);
    } catch (err) {
      setClaimError(err.message || 'Failed to submit claim');
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-64 bg-slate-100 rounded-lg animate-pulse border border-slate-200" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Item Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested item record does not exist in the database.'}</p>
        <button
          onClick={() => setCurrentView('lost-items')}
          className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const isOwner = user && user.id === item.user_id;
  const canManage = isOwner || isAdmin;
  const canClaim = item.type === 'FOUND' && item.status === 'ACTIVE' && (!user || user.id !== item.user_id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => setCurrentView(item.type === 'LOST' ? 'lost-items' : 'found-items')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {item.type === 'LOST' ? 'Lost Items' : 'Found Items'}</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Item Detail Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-slate-200">
          {/* Item Image */}
          <div className="bg-slate-100 min-h-[300px] flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-200">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="max-h-[380px] w-auto object-contain rounded-md shadow-xs"
              />
            ) : (
              <div className="text-center text-slate-400 p-8">
                <Tag className="w-16 h-16 mx-auto mb-2 text-slate-300 stroke-1" />
                <span className="text-xs uppercase tracking-wider font-mono">No Image Attached</span>
              </div>
            )}
          </div>

          {/* Details Content */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge type={item.type} label={item.type} />
                <Badge type={item.status} label={item.status} />
                <span className="text-xs text-slate-500 font-mono">ID: #{item.id}</span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 leading-snug tracking-tight">
                {item.title}
              </h1>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Category</span>
                  <span className="font-semibold text-slate-800">{item.category_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Campus Location</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.location_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Date {item.type === 'LOST' ? 'Lost' : 'Found'}</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {item.date_reported}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Reported By</span>
                  <span className="font-semibold text-slate-800">{item.reporterName || 'Campus Member'}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">Item Description</h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white border border-slate-200 p-3 rounded-md">
                  {item.description}
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">Inquiry / Contact Details</h3>
                <p className="text-xs text-slate-600 font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
                  {item.contact_info || item.reporterEmail || 'Contact campus administration office'}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {canClaim && (
                <div>
                  {isAuthenticated ? (
                    <button
                      onClick={() => setShowClaimModal(true)}
                      className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit Ownership Claim</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentView('login')}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Sign In to Claim This Found Item</span>
                    </button>
                  )}
                </div>
              )}

              {/* Management controls for owner/admin */}
              {canManage && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs font-medium text-slate-700">
                    <span>Manage Item Status ({isAdmin ? 'Admin' : 'Owner'})</span>
                    <button
                      onClick={handleDeleteItem}
                      className="text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {['ACTIVE', 'CLAIMED', 'RETURNED', 'RESOLVED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        disabled={statusUpdateLoading || item.status === st}
                        className={`text-xs px-2.5 py-1 rounded font-medium border cursor-pointer transition-colors ${
                          item.status === st
                            ? 'bg-slate-900 text-white border-slate-900 cursor-default'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        Set {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Possible Matches Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Rule-Based Match Suggestions</h2>
              <p className="text-xs text-slate-500">Algorithmic scoring between opposite Lost/Found reports</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('matches')}
            className="text-xs text-indigo-600 hover:underline cursor-pointer font-medium"
          >
            All Campus Matches
          </button>
        </div>

        {matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((m) => {
              const paired = item.type === 'LOST' ? m.foundItem : m.lostItem;
              if (!paired) return null;
              return (
                <div key={m.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        {m.match_score}% Match Score
                      </span>
                      <Badge type={paired.type} label={paired.type} size="sm" />
                      <span className="text-xs font-semibold text-slate-900">{paired.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{m.match_reasons}</p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Location: {paired.location_name}</span>
                      <span>•</span>
                      <span>Date: {paired.date_reported}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedItemId(paired.id);
                      window.scrollTo(0, 0);
                    }}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  >
                    View Matching Item
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">
            No strong algorithmic matches recorded yet for this report.
          </p>
        )}
      </div>

      {/* Claim Submission Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-base">File Ownership Claim</h3>
                <p className="text-xs text-slate-400">Claiming: {item.title}</p>
              </div>
              <button
                onClick={() => setShowClaimModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {claimSuccess ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Claim Successfully Submitted</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your claim has been stored in MySQL and is now in <strong>PENDING</strong> status. Campus administrators will review your identifying proof before authorizing collection.
                </p>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="p-6 space-y-4 text-xs">
                {claimError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{claimError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={claimForm.claimantName}
                    onChange={(e) => setClaimForm({ ...claimForm, claimantName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={claimForm.claimantEmail}
                      onChange={(e) => setClaimForm({ ...claimForm, claimantEmail: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={claimForm.claimantPhone}
                      onChange={(e) => setClaimForm({ ...claimForm, claimantPhone: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Proof of Ownership / Identifying Marks *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe specific details not visible publicly (e.g. lock screen wallpaper, serial number, scratch marks, inner contents, stickers)..."
                    value={claimForm.proofDetails}
                    onChange={(e) => setClaimForm({ ...claimForm, proofDetails: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Additional Explanation (Optional)</label>
                  <input
                    type="text"
                    placeholder="Where and when you realized the item was lost..."
                    value={claimForm.explanation}
                    onChange={(e) => setClaimForm({ ...claimForm, explanation: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClaimModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={claimLoading}
                    className="px-4 py-2 bg-emerald-700 text-white rounded font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{claimLoading ? 'Submitting...' : 'Submit Claim'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
