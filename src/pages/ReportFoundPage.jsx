import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, PlusCircle, CheckCircle, AlertCircle } from 'lucide-react';

export function ReportFoundPage({ setCurrentView, setSelectedItemId }) {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const [form, setForm] = useState({
    title: '',
    categoryId: '',
    locationId: '',
    dateReported: new Date().toISOString().split('T')[0],
    description: '',
    imageUrl: '',
    contactInfo: 'Turned into Campus Main Reception Desk',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getLocations()])
      .then(([cats, locs]) => {
        setCategories(cats || []);
        setLocations(locs || []);
        if (cats?.length > 0) setForm((prev) => ({ ...prev, categoryId: cats[0].id }));
        if (locs?.length > 0) setForm((prev) => ({ ...prev, locationId: locs[0].id }));
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to register a found item');
      setCurrentView('login');
      return;
    }

    if (!form.title || !form.categoryId || !form.locationId || !form.dateReported || !form.description) {
      setError('Please fill in all mandatory fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const createdItem = await api.createItem({
        ...form,
        type: 'FOUND',
      });

      setSuccess(true);
      setTimeout(() => {
        if (createdItem?.id) {
          setSelectedItemId(createdItem.id);
          setCurrentView('item-details');
        } else {
          setCurrentView('found-items');
        }
      }, 1500);
    } catch (err) {
      console.error('Error reporting found item:', err);
      setError(err.message || 'Failed to submit report to MySQL database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <button
          onClick={() => setCurrentView('found-items')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Found Directory</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="pb-6 border-b border-slate-200 mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1">
            <span>OFFICIAL REPORT</span>
            <span>•</span>
            <span>FOUND ITEM FORM</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report a Found Item</h1>
          <p className="text-xs text-slate-500">
            Log an article found on campus to help its owner reclaim it safely.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-md text-xs flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Found Item Report Registered</h3>
            <p className="text-xs text-slate-600">
              The article is recorded in MySQL and students can now submit claims. Redirecting to item details...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block text-slate-800 font-semibold mb-1">
                Item Name / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Found Blue Wireless Earbuds, Student ID Card, Scientific Calculator"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Category *</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-md text-sm bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Location Where Found *</label>
                <select
                  required
                  value={form.locationId}
                  onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-md text-sm bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name} ({l.campus_zone})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Date Discovered *</label>
                <input
                  type="date"
                  required
                  value={form.dateReported}
                  onChange={(e) => setForm({ ...form, dateReported: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-semibold mb-1">Optional Reference Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1">General Description *</label>
              <textarea
                rows={4}
                required
                placeholder="Describe general appearance. (Tip: keep distinct secret markings or passwords confidential so claimant can prove ownership!)..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-semibold mb-1">Safekeeping Location / Handover Point *</label>
              <input
                type="text"
                required
                value={form.contactInfo}
                onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                placeholder="e.g. Handed to Central Library Inquiry Desk, Held by Security Office"
                className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('found-items')}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-700 text-white rounded-md font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{loading ? 'Submitting to MySQL...' : 'Submit Found Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
