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
  LogOut
} from 'lucide-react';

interface Plan {
  id: string;
  product_name: string;
  business_name: string;
  created_at: string;
  status: string;
}

export default function Dashboard() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      fetchPlans(session.user.id);
    };
    checkUser();
  }, [router]);

  const fetchPlans = async (userId: string) => {
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
          <span className="text-sm text-gray-500 hidden sm:inline">{user?.email}</span>
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Plans</h1>
            <p className="text-gray-500">Manage your food safety documentation</p>
          </div>
          <Link
            href="/builder"
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
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {plan.status || 'Draft'}
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
                <div className="border-t bg-gray-50 p-4 flex gap-2">
                  <Link 
                    href={`/builder?id=${plan.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </Link>
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
