import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ItemCard } from '../components/items/ItemCard';
import { Search, Filter, RotateCcw, PlusCircle, AlertCircle } from 'lucide-react';

export function FoundItemsPage({ setCurrentView, setSelectedItemId }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    Promise.all([api.getCategories(), api.getLocations()])
      .then(([cats, locs]) => {
        setCategories(cats || []);
        setLocations(locs || []);
      })
      .catch(console.error);
  }, []);

  const fetchFoundItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getFoundItems({
        search,
        categoryId,
        locationId,
        status,
        sort,
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching found items:', err);
      setError(err.message || 'Failed to fetch found items from the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoundItems();
  }, [categoryId, locationId, status, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFoundItems();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryId('');
    setLocationId('');
    setStatus('');
    setSort('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1">
            <span>DIRECTORY</span>
            <span>•</span>
            <span>TYPE = FOUND</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Found Belongings Directory</h1>
          <p className="text-xs text-slate-500">Items discovered on campus and awaiting rightful owner verification</p>
        </div>

        <button
          onClick={() => setCurrentView('report-found')}
          className="px-4 py-2 bg-emerald-700 text-white rounded-md text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Found Item</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, location keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="">All Locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CLAIMED">CLAIMED</option>
            <option value="RETURNED">RETURNED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>

          {(search || categoryId || locationId || status || sort !== 'newest') && (
            <button
              onClick={handleClearFilters}
              className="text-slate-500 hover:text-slate-800 ml-auto flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-64 bg-slate-100 rounded-lg animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-mono">
            Showing {items.length} found item record{items.length === 1 ? '' : 's'} from MySQL
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
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
        </div>
      ) : (
        /* Empty state */
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base">No found items have been reported yet.</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {search || categoryId || locationId || status
              ? 'No registered found items currently match your search filter criteria. Try resetting filters or search keywords.'
              : 'When students or staff deposit found items on campus, they will appear here in real time.'}
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
