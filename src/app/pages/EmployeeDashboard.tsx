import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { 
  LogOut, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Mail,
  User
} from 'lucide-react';

interface Ticket {
  id: string;
  status: string;
  meno: string;
  email: string;
  opis_problemu: string;
  zakaznik: string;
  created_at: string;
  updated_at: string;
}

export default function EmployeeDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const name = localStorage.getItem('employeeName');
    const normalizedName = localStorage.getItem('employeeNormalizedName');
    
    if (!name || !normalizedName) {
      navigate('/employee/login');
      return;
    }

    setEmployeeName(name);
    loadTickets(normalizedName);
  }, [navigate]);

  const loadTickets = async (normalizedName: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/employee/${normalizedName}/tickets`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chyba pri načítaní ticketov');
      }

      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať tickety');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeName');
    localStorage.removeItem('employeeNormalizedName');
    navigate('/employee/login');
  };

  const handleRefresh = () => {
    const normalizedName = localStorage.getItem('employeeNormalizedName');
    if (normalizedName) {
      loadTickets(normalizedName);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/tickets/${ticketId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chyba pri aktualizácii ticketu');
      }

      // Refresh tickets after update
      handleRefresh();
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert('Nepodarilo sa aktualizovať ticket');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'vyrieseny':
      case 'dokončený':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'v_progrese':
      case 'prebiehajúci':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'vyrieseny':
      case 'dokončený':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'v_progrese':
      case 'prebiehajúci':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      novy: 'Nový',
      v_progrese: 'V progrese',
      vyrieseny: 'Vyriešený',
      dokončený: 'Dokončený',
      prebiehajúci: 'Prebiehajúci'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-[#CACADD]/10">
      {/* Header */}
      <header className="bg-white border-b border-[#CACADD] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#11EDE2] rounded-full"></div>
                <span className="text-xl font-extrabold text-[#171642] lowercase">
                  zero one hundred
                </span>
              </div>
              <div className="h-8 w-px bg-[#CACADD]"></div>
              <div>
                <h1 className="text-lg font-bold text-[#171642]">Dashboard zamestnanca</h1>
                <p className="text-sm text-[#676789]">{employeeName}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-[#CACADD] text-[#171642] hover:border-[#11EDE2]"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Obnoviť
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-[#676789] hover:text-[#171642]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Odhlásiť sa
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-[#CACADD]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#676789] font-bold">Celkový počet</p>
                <p className="text-3xl font-extrabold text-[#171642] mt-1">{tickets.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#11EDE2]/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[#11EDE2]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#CACADD]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#676789] font-bold">V progrese</p>
                <p className="text-3xl font-extrabold text-[#171642] mt-1">
                  {tickets.filter(t => t.status === 'v_progrese' || t.status === 'prebiehajúci').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#CACADD]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#676789] font-bold">Vyriešené</p>
                <p className="text-3xl font-extrabold text-[#171642] mt-1">
                  {tickets.filter(t => t.status === 'vyrieseny' || t.status === 'dokončený').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tickets Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold text-[#171642]">Moje tickety</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-[#11EDE2] animate-spin mx-auto mb-4" />
              <p className="text-[#676789]">Načítavam tickety...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-[#CACADD]">
              <AlertCircle className="w-12 h-12 text-[#676789] mx-auto mb-4" />
              <p className="text-[#676789] text-lg">Zatiaľ nemáte žiadne priradené tickety</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl p-6 border border-[#CACADD] hover:border-[#11EDE2] hover:shadow-lg transition-all"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${getStatusBadgeClass(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {getStatusLabel(ticket.status)}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-[#676789] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-[#676789] font-bold">Meno klienta</p>
                        <p className="text-sm text-[#171642] font-bold">{ticket.meno}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-[#676789] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-[#676789] font-bold">Email</p>
                        <p className="text-sm text-[#171642] break-all">{ticket.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="mb-4">
                    <p className="text-xs text-[#676789] font-bold mb-1">Popis problému</p>
                    <p className="text-sm text-[#171642] line-clamp-3">{ticket.opis_problemu}</p>
                  </div>

                  {/* Timestamp */}
                  <p className="text-xs text-[#676789] mb-4">
                    Vytvorené: {new Date(ticket.created_at).toLocaleDateString('sk-SK', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>

                  {/* Status Actions */}
                  <div className="flex gap-2 pt-4 border-t border-[#CACADD]">
                    {ticket.status === 'novy' && (
                      <Button
                        size="sm"
                        onClick={() => updateTicketStatus(ticket.id, 'v_progrese')}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                      >
                        Začať riešiť
                      </Button>
                    )}
                    {(ticket.status === 'v_progrese' || ticket.status === 'prebiehajúci') && (
                      <Button
                        size="sm"
                        onClick={() => updateTicketStatus(ticket.id, 'vyrieseny')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs"
                      >
                        Označiť ako vyriešený
                      </Button>
                    )}
                    {(ticket.status === 'vyrieseny' || ticket.status === 'dokončený') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTicketStatus(ticket.id, 'v_progrese')}
                        className="flex-1 border-[#CACADD] text-[#171642] text-xs"
                      >
                        Znovu otvoriť
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}