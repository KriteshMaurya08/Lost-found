import React from 'react';
import { Landmark, ShieldCheck, Database, Layers } from 'lucide-react';

export function Footer({ openArchModal }) {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 text-white mb-3">
              <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-white">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight">CAMPUS LOST & FOUND</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mb-4">
              Official collegiate platform for students, faculty, and administrative staff to register, recover, match, and claim lost campus belongings safely and transparently.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Direct JDBC / MySQL Relational Persistence</span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white transition-colors cursor-pointer">Browse Lost Reports</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Browse Found Items</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Possible Item Matches</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Claim Verification Guidelines</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Project Viva Architecture</h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Designed as a complete academic capstone project demonstrating clean multi-tier architecture without ORM shortcuts.
            </p>
            <button
              onClick={openArchModal}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Layers className="w-3.5 h-3.5" />
              View Architecture & ER Model
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} Campus Lost & Found Management System. Built for College Examination.
          </div>
          <div className="flex items-center gap-6">
            <span>Spring Boot REST API</span>
            <span>•</span>
            <span>PreparedStatement JDBC</span>
            <span>•</span>
            <span>MySQL 8.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
