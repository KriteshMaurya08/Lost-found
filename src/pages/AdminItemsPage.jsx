import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Search, Filter, Trash2, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export function AdminItemsPage({ setCurrentView, setSelectedItemId }) {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getItems({
        search,
        type,
        status,
        categoryId,
        sort: 'newest',
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching admin items:', err);
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadItems();
    }
  }, [isAdmin, type, status, categoryId]);

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await api.updateItemStatus(itemId, newStatus);
      loadItems();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to permanently delete this item record?')) return;
    try {
      await api.deleteItem(itemId);
      loadItems();
    } catch (err) {
      alert('Failed to delete item: ' + err.message);
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-xs text-rose-600">Administrator access required.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campus Belongings Inventory</h1>
          <p className="text-xs text-slate-500">Comprehensive management of all active, claimed, and returned reports</p>
        </div>

        <button
          onClick={loadItems}
          className="px-3.5 py-1.5 text-xs font-medium border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, description, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadItems()}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-1.5 border border-slate-300 rounded bg-white text-slate-700"
        >
          <option value="">All Types (Lost & Found)</option>
          <option value="LOST">LOST Only</option>
          <option value="FOUND">FOUND Only</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-1.5 border border-slate-300 rounded bg-white text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="CLAIMED">CLAIMED</option>
          <option value="RETURNED">RETURNED</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="p-1.5 border border-slate-300 rounded bg-white text-slate-700"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <button
          onClick={loadItems}
          className="px-3 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 cursor-pointer"
        >
          Filter
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-4">Item & ID</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Reporter</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Loading MySQL database records...
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <div>{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: #{item.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge type={item.type} label={item.type} size="sm" />
                  </td>
                  <td className="py-3 px-4">{item.category_name}</td>
                  <td className="py-3 px-4 truncate max-w-[140px]">{item.location_name}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{item.date_reported}</td>
                  <td className="py-3 px-4">
                    <Badge type={item.status} label={item.status} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <div>{item.reporterName}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{item.reporterEmail}</div>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    {/* Status dropdown */}
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="text-[11px] p-1 border border-slate-300 rounded bg-white text-slate-700"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="CLAIMED">CLAIMED</option>
                      <option value="RETURNED">RETURNED</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>

                    <button
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setCurrentView('item-details');
                      }}
                      className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                      title="View Details"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No item records match the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
