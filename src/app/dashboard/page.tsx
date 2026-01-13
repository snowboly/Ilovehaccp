"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Plus, 
  FileText, 
  Clock, 
  MoreVertical, 
  Trash2, 
  Edit,
  LogOut,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Lock,
  Search,
  LayoutGrid,
  List as ListIcon,
  Settings,
  ArrowRight,
  Link2
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import HACCPDocument from '@/components/pdf/HACCPDocument';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { getDictionary } from '@/lib/locales';

interface Plan {
  id: string;
  product_name: string;
  business_name: string;
  created_at: string;
  status: string;
  payment_status: string;
  hazard_analysis: any;
  full_plan: any;
  intended_use: string;
  storage_type: string;
  business_type: string;
}

function DashboardContent() {
  const dict = getDictionary('en').pdf;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [importId, setImportId] = useState('');
  const [importing, setImporting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('session_id')) {
        setShowSuccess(true);
        // Clear URL params without reloading
        window.history.replaceState({}, '', '/dashboard');
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      fetchPlans();
    };
    checkUser();
  }, [router, searchParams]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan? This cannot be undone.')) return;
    
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setPlans(plans.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting plan:', err);
      alert('Failed to delete plan.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDownloadWord = async (plan: Plan) => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`/api/download-word?planId=${plan.id}`, {
              headers: { Authorization: `Bearer ${session.access_token}` }
          });
          
          if (!res.ok) throw new Error('Download failed');
          
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `HACCP_Plan_${plan.business_name.replace(/\s+/g, '_')}.docx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
      } catch (e) {
          console.error(e);
          alert('Failed to download Word document.');
      }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importId) return;
    
    // Extract ID if full URL is pasted
    let cleanId = importId.trim();
    if (cleanId.includes('id=')) {
        cleanId = cleanId.split('id=')[1].split('&')[0];
    }
    
    setImporting(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch('/api/claim-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ planId: cleanId })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to import');
        
        alert('Plan imported successfully!');
        setImportId('');
        fetchPlans();
    } catch (err: any) {
        alert(err.message);
    } finally {
        setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-4 lg:px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl">ilovehaccp.com</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
             <span className="text-xs text-gray-400 font-medium">Logged in as</span>
             <span className="text-sm font-bold text-gray-700">{user?.email}</span>
          </div>
          <Link href="/dashboard/settings" className="text-gray-400 hover:text-gray-600 transition-colors p-2">
            <Settings className="h-5 w-5" />
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {showSuccess && (
            <div className="mb-8 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <div>
                        <span className="font-bold text-lg text-emerald-900 block">Payment Successful!</span>
                        <span className="font-medium text-sm">Your plan is unlocked. Our expert has been notified and will contact you via email within 48h.</span>
                    </div>
                </div>
                <button onClick={() => setShowSuccess(false)} className="text-emerald-400 hover:text-emerald-600">
                    <XCircle className="w-5 h-5" />
                </button>
            </div>
        )}

        {/* Promo Banner for Review Service */}
        <div className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-blue-500/30">
                    New Service
                </div>
                <h2 className="text-2xl font-black mb-2">Have an old HACCP plan?</h2>
          <p className="text-slate-500 max-w-lg mb-6 leading-relaxed">
            Get it reviewed by our certified experts. We&apos;ll update it to align with the latest 2026 standards (EU & UK) and provide a detailed action report.
          </p>
            </div>
            <Link 
                href="/contact?subject=Review" 
                className="relative z-10 whitespace-nowrap bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
            >
                Get Reviewed <span className="text-blue-600 font-medium">From</span> <span className="text-blue-600">€99</span> <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Plans</h1>
            <p className="text-gray-500">Manage your food safety documentation</p>
          </div>
          <Link
            href="/builder"
            target="_blank"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create New Plan
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No plans yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first HACCP plan.</p>
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium"
            >
              Start Builder <Plus className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            plan.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {plan.payment_status === 'paid' ? 'Paid' : 'Draft'}
                        </div>
                    </div>
                    <div className="relative group">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {/* Simple Dropdown */}
                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg hidden group-hover:block z-10">
                        <button 
                          onClick={() => handleDelete(plan.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{plan.product_name || 'Untitled Plan'}</h3>
                  <p className="text-gray-500 text-sm mb-4">{plan.business_name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    Last edited {new Date(plan.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="border-t bg-gray-50 p-4 grid grid-cols-3 gap-2">
                  <Link 
                      href={`/builder?id=${plan.id}`}
                      target="_blank"
                      className="flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                  >
                      <Edit className="h-3 w-3" /> Edit
                  </Link>
                  
                  <PDFDownloadLink
                      document={
                      <HACCPDocument 
                          dict={dict}
                          data={{
                          businessName: plan.business_name,
                          productName: plan.product_name,
                          productDescription: `HACCP Plan for ${plan.business_type}`,
                          intendedUse: plan.intended_use,
                          storageType: plan.storage_type,
                          analysis: plan.hazard_analysis,
                          fullPlan: plan.full_plan
                          }} 
                      />
                      }
                      fileName={`${plan.business_name.replace(/\s+/g, '_')}_HACCP.pdf`}
                      className="flex items-center justify-center gap-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                      {({ loading }) => (
                      <>
                          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                          PDF
                      </>
                      )}
                  </PDFDownloadLink>

                  {plan.payment_status === 'paid' ? (
                      <button
                          onClick={() => handleDownloadWord(plan)}
                          className="flex items-center justify-center gap-1 bg-blue-800 text-white py-2 rounded-lg text-xs font-medium hover:bg-blue-900 transition-colors"
                          title="Download Editable Word Doc"
                      >
                          <FileText className="h-3 w-3" /> DOCX
                      </button>
                  ) : (
                      <button disabled className="flex items-center justify-center gap-1 bg-gray-100 text-gray-400 py-2 rounded-lg text-xs font-medium cursor-not-allowed" title="Upgrade to Unlock Word">
                          <Lock className="h-3 w-3" /> DOCX
                      </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-12 border-t pt-8">
            <div className="max-w-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Missing a plan?</h3>
                <p className="text-gray-500 text-sm mb-4">
                    If you generated a plan before signing up, enter the Plan ID (or the full link from your email) below to add it to your dashboard.
                </p>
                <form onSubmit={handleImport} className="flex gap-3">
                    <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Paste Plan ID or Link..." 
                            value={importId}
                            onChange={(e) => setImportId(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={importing}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={importing || !importId}
                        className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50"
                    >
                        {importing ? 'Importing...' : 'Import Plan'}
                    </button>
                </form>
            </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  const dict = getDictionary('en').pdf; // Default to EN for dashboard
  const [plans, setPlans] = useState<Plan[]>([]);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
