import React from 'react';
import { Badge } from '../common/Badge';
import { MapPin, Calendar, Tag, ArrowRight, ShieldAlert } from 'lucide-react';

export function ItemCard({ item, onViewDetails }) {
  const isLost = item.type === 'LOST';

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group">
      {/* Top Image or Header banner */}
      <div className="relative h-44 bg-slate-100 overflow-hidden border-b border-slate-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center');
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 bg-slate-50">
            <Tag className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{item.category_name}</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <Badge type={item.type} label={item.type} size="sm" />
          <Badge type={item.status} label={item.status} size="sm" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
            <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
              {item.category_name}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {item.date_reported}
            </span>
          </div>

          <h3 className="font-semibold text-slate-900 text-base leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {item.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-500 truncate max-w-[180px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location_name}</span>
          </div>

          <button
            onClick={() => onViewDetails(item.id)}
            className="text-xs font-medium text-slate-900 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
