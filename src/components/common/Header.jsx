import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from './Badge';
import {
  Search, PlusCircle, FileText, CheckSquare, Sparkles,
  Shield, User, LogOut, Menu, X, Landmark, Layers
} from 'lucide-react';

export function Header({ currentView, setCurrentView, openArchModal }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top institution banner */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex justify-between items-center">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-mono text-[11px] text-slate-300">CAMPUS UTILITY PORTAL • SPRING BOOT & JDBC BACKEND</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={openArchModal}
              className="text-xs font-mono text-indigo-300 hover:text-white flex items-center gap-1.5 cursor-pointer underline underline-offset-2"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Viva & Architecture Inspector</span>
            </button>
            {isAuthenticated && (
              <span className="hidden sm:inline text-slate-400">
                Signed in as <strong className="text-white">{user?.fullName}</strong> ({user?.role})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('home')}>
            <div className="w-10 h-10 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Landmark className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 leading-none tracking-tight">CAMPUS LOST & FOUND</div>
              <div className="text-[11px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">University Belongings Registry</div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            {/* If Admin: show admin links */}
            {isAdmin ? (
              <>
                <button
                  onClick={() => navigate('admin-dashboard')}
                  className={`px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    currentView === 'admin-dashboard' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-4 h-4" /> Dashboard
                </button>
                <button
                  onClick={() => navigate('admin-items')}
                  className={`px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    currentView === 'admin-items' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Items Management
                </button>
                <button
                  onClick={() => navigate('admin-claims')}
                  className={`px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    currentView === 'admin-claims' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" /> Claims Review
                </button>
                <button
                  onClick={() => navigate('admin-users')}
                  className={`px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    currentView === 'admin-users' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Users Directory
                </button>
                <button
                  onClick={() => navigate('matches')}
                  className={`px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    currentView === 'matches' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" /> Matches
                </button>
              </>
            ) : (
              /* Public and Student Links */
              <>
                <button
                  onClick={() => navigate('home')}
                  className={`px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    currentView === 'home' ? 'text-indigo-700 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => navigate('lost-items')}
                  className={`px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    currentView === 'lost-items' ? 'text-indigo-700 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Lost Items
                </button>
                <button
                  onClick={() => navigate('found-items')}
                  className={`px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    currentView === 'found-items' ? 'text-indigo-700 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  Found Items
                </button>
                <button
                  onClick={() => navigate('matches')}
                  className={`px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    currentView === 'matches' ? 'text-indigo-700 font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" /> Matches
                </button>

                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => navigate('my-reports')}
                      className={`px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                        currentView === 'my-reports' ? 'text-indigo-700 font-semibold' : 'hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-4 h-4" /> My Reports
                    </button>
                    <button
                      onClick={() => navigate('my-claims')}
                      className={`px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                        currentView === 'my-claims' ? 'text-indigo-700 font-semibold' : 'hover:text-slate-900'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" /> My Claims
                    </button>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Action CTAs & Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {!isAdmin && (
                  <>
                    <button
                      onClick={() => navigate('report-lost')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Report Lost
                    </button>
                    <button
                      onClick={() => navigate('report-found')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Report Found
                    </button>
                  </>
                )}

                <button
                  onClick={() => navigate('profile')}
                  className={`p-2 text-slate-600 hover:text-slate-900 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer ${
                    currentView === 'profile' ? 'bg-slate-100 border-indigo-300' : ''
                  }`}
                  title="Profile & Student ID"
                >
                  <User className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    logout();
                    navigate('home');
                  }}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-md border border-slate-200 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('login')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('register')}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                >
                  Register Account
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-md cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => navigate('admin-dashboard')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('admin-items')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100"
              >
                Items Management
              </button>
              <button
                onClick={() => navigate('admin-claims')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100"
              >
                Claims Review
              </button>
              <button
                onClick={() => navigate('admin-users')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100"
              >
                Users Directory
              </button>
              <button
                onClick={() => navigate('matches')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100"
              >
                Possible Matches
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('home')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100"
              >
                Home
              </button>
              <button
                onClick={() => navigate('lost-items')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100"
              >
                Browse Lost Items
              </button>
              <button
                onClick={() => navigate('found-items')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100"
              >
                Browse Found Items
              </button>
              <button
                onClick={() => navigate('matches')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100"
              >
                Possible Matches
              </button>

              {isAuthenticated && (
                <>
                  <button
                    onClick={() => navigate('report-lost')}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-rose-700 bg-rose-50 rounded-md"
                  >
                    Report Lost Item
                  </button>
                  <button
                    onClick={() => navigate('report-found')}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-md"
                  >
                    Report Found Item
                  </button>
                  <button
                    onClick={() => navigate('my-reports')}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100"
                  >
                    My Reports
                  </button>
                  <button
                    onClick={() => navigate('my-claims')}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100"
                  >
                    My Claims
                  </button>
                  <button
                    onClick={() => navigate('profile')}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100"
                  >
                    My Profile
                  </button>
                </>
              )}
            </>
          )}

          <div className="pt-4 border-t border-slate-200">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  navigate('home');
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 rounded-md hover:bg-rose-50"
              >
                Sign Out
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => navigate('login')}
                  className="w-full text-center px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-md"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('register')}
                  className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md"
                >
                  Register Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
