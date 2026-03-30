import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { LogOut, RefreshCw, CheckCircle2, Clock, AlertCircle, Mail, User } from 'lucide-react';

interface Ticket {
  id: string;
  status: string;
  meno?: string;
  name?: string;
  customer_name?: string;
  email?: string;
  mail?: string;
  opis_problemu?: string;
  description?: string;
  zakaznik?: string;
  employee?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('customerName');
    const role = localStorage.getItem('userRole');

    if (!name || role !== 'customer') {
      navigate('/employee/login');
      return;
    }

    setCustomerName(name);
    loadTickets(name);
  }, [navigate]);

  const loadTickets = async (name: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/customer/${encodeURIComponent(name)}/tickets`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chyba pri načítaní ticketov');
      if (data.success) setTickets(data.tickets);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať tickety');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('userRole');
    navigate('/employee/login');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      novy: 'Nový', v_progrese: 'V progrese', vyrieseny: 'Vyriešený',
      dokončený: 'Dokončený', prebiehajúci: 'Prebiehajúci'
    };
    return labels[status] || status;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'vyrieseny': case 'dokončený': return 'bg-green-100 text-green-800 border-green-200';
      case 'v_progrese': case 'prebiehajúci': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'vyrieseny': case 'dokončený': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'v_progrese': case 'prebiehajúci': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#CACADD]/10">
      <header className="bg-white border-b border-[#CACADD] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#11EDE2] rounded-full"></div>
                <span className="text-xl font-extrabold text-[#171642] lowercase">zero one hundred</span>
              </div>
              <div className="h-8 w-px bg-[#CACADD]"></div>
              <div>
                <h1 className="text-lg font-bold text-[#171642]">Moje tickety</h1>
                <p className="text-sm text-[#676789]">{customerName}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => loadTickets(customerName)} disabled={loading}
                className="border-[#CACADD] text-[#171642] hover:border-[#11EDE2]">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Obnoviť
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="text-[#676789] hover:text-[#171642]">
                <LogOut className="w-4 h-4 mr-2" />
                Odhlásiť sa
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-[#CACADD]">
            <p className="text-sm text-[#676789] font-bold">Celkový počet</p>
            <p className="text-3xl font-extrabold text-[#171642] mt-1">{tickets.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#CACADD]">
            <p className="text-sm text-[#676789] font-bold">V progrese</p>
            <p className="text-3xl font-extrabold text-[#171642] mt-1">
              {tickets.filter(t => t.status === 'v_progrese' || t.status === 'prebiehajúci').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#CACADD]">
            <p className="text-sm text-[#676789] font-bold">Vyriešené</p>
            <p className="text-3xl font-extrabold text-[#171642] mt-1">
              {tickets.filter(t => t.status === 'vyrieseny' || t.status === 'dokončený').length}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        <h2 className="text-2xl font-extrabold text-[#171642] mb-4">Moje tickety</h2>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-[#11EDE2] animate-spin mx-auto mb-4" />
            <p className="text-[#676789]">Načítavam tickety...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-[#CACADD]">
            <AlertCircle className="w-12 h-12 text-[#676789] mx-auto mb-4" />
            <p className="text-[#676789] text-lg">Nemáte žiadne tickety</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl p-6 border border-[#CACADD] hover:border-[#11EDE2] hover:shadow-lg transition-all">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border mb-4 ${getStatusBadgeClass(ticket.status)}`}>
                  {getStatusIcon(ticket.status)}
                  {getStatusLabel(ticket.status)}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-[#676789] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#676789] font-bold">Priradený</p>
                      <p className="text-sm text-[#171642] font-bold">{ticket.zakaznik || ticket.employee || ticket.assigned_to || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-[#676789] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#676789] font-bold">Email</p>
                      <p className="text-sm text-[#171642] break-all">{ticket.email || ticket.mail || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-[#676789] font-bold mb-1">Popis problému</p>
                  <p className="text-sm text-[#171642] line-clamp-3">{ticket.opis_problemu || ticket.description || ticket.message || '—'}</p>
                </div>

                <p className="text-xs text-[#676789]">
                  Vytvorené: {new Date(ticket.created_at).toLocaleDateString('sk-SK', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}