import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import WebsiteAdminPanel from './components/WebsiteAdminPanel';
import { Shield, LogOut, BarChart3, Globe, Menu, X } from 'lucide-react';
import { supabase } from './lib/supabase';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState('platform');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const adminSession = sessionStorage.getItem('adminAuthenticated');
      if (adminSession === 'true') {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (success) => {
    if (success) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    setActivePanel('platform');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <Shield className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <AdminLogin onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <div className="min-h-screen bg-slate-50">
                  {/* Professional Header */}
                  <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
                    <div className="px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                              <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h1 className="text-xl font-bold text-slate-900">TestingVala</h1>
                              <p className="text-sm text-slate-500">Admin Dashboard</p>
                            </div>
                          </div>
                          
                          {/* Desktop Navigation */}
                          <nav className="hidden md:flex ml-8 gap-1">
                            <button
                              onClick={() => setActivePanel('platform')}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                activePanel === 'platform'
                                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              <BarChart3 className="w-4 h-4" />
                              Platform
                            </button>
                            <button
                              onClick={() => setActivePanel('website')}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                activePanel === 'website'
                                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              <Globe className="w-4 h-4" />
                              Website
                            </button>
                          </nav>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Mobile Menu Button */}
                          <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                          </button>
                          
                          {/* Logout Button */}
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </header>

                  {/* Mobile Navigation Sidebar */}
                  {sidebarOpen && (
                    <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
                      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform">
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                              <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-slate-900">Admin Panel</span>
                          </div>
                          
                          <nav className="space-y-2">
                            <button
                              onClick={() => { setActivePanel('platform'); setSidebarOpen(false); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                                activePanel === 'platform'
                                  ? 'bg-primary text-white'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <BarChart3 className="w-5 h-5" />
                              Platform Management
                            </button>
                            <button
                              onClick={() => { setActivePanel('website'); setSidebarOpen(false); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                                activePanel === 'website'
                                  ? 'bg-primary text-white'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <Globe className="w-5 h-5" />
                              Website Content
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Content */}
                  <main className="min-h-[calc(100vh-80px)]">
                    {activePanel === 'platform' ? (
                      <AdminDashboard onLogout={handleLogout} />
                    ) : (
                      <div className="p-6">
                        <WebsiteAdminPanel isOpen={true} onClose={() => setActivePanel('platform')} />
                      </div>
                    )}
                  </main>
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f8fafc',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f8fafc',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;