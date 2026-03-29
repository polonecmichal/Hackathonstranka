import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { LogIn, Users, UserCheck, ChevronDown } from 'lucide-react';

type LoginRole = 'employee' | 'customer';

interface Employee {
  id: string;
  name: string;
  normalized_name?: string;
}

interface CustomerOption {
  name: string;
  email: string;
}

export default function EmployeeLogin() {
  const [role, setRole] = useState<LoginRole>('employee');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const navigate = useNavigate();

  // Load employees and unique customers on mount
  useEffect(() => {
    loadEmployees();
    loadCustomers();
  }, []);

  const loadEmployees = async () => {
    setLoadingList(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/employees`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('Error loading employees:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/tickets`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }
      );
      const data = await response.json();
      if (data.success && data.tickets) {
        // Get unique customers by name
        const uniqueMap = new Map<string, CustomerOption>();
        for (const ticket of data.tickets) {
          if (ticket.meno && !uniqueMap.has(ticket.meno.toLowerCase())) {
            uniqueMap.set(ticket.meno.toLowerCase(), {
              name: ticket.meno,
              email: ticket.email || '',
            });
          }
        }
        setCustomers(Array.from(uniqueMap.values()));
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      if (role === 'employee') {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/employee/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ name: name.trim() }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Zamestnanec nebol nájdený');
        }

        if (data.success) {
          localStorage.setItem('employeeName', data.employee.name);
          localStorage.setItem('employeeNormalizedName', data.employee.normalizedName);
          localStorage.setItem('userRole', 'employee');
          navigate('/employee/dashboard');
        }
      } else {
        // Customer login
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/customer/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ name: name.trim() }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Zákazník nebol nájdený');
        }

        if (data.success) {
          localStorage.setItem('customerName', data.customer.name);
          localStorage.setItem('customerEmail', data.customer.email);
          localStorage.setItem('userRole', 'customer');
          navigate('/customer/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Nepodarilo sa prihlásiť');
    } finally {
      setLoading(false);
    }
  };

  const currentList = role === 'employee' ? employees : customers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171642] to-[#676789] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#11EDE2] rounded-full"></div>
            <span className="text-3xl font-extrabold text-white lowercase">
              zero one hundred
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Prihlásenie</h1>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Role Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setRole('employee'); setName(''); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                role === 'employee'
                  ? 'bg-[#11EDE2] text-[#171642]'
                  : 'bg-[#CACADD]/20 text-[#676789] hover:bg-[#CACADD]/40'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Zamestnanec
            </button>
            <button
              type="button"
              onClick={() => { setRole('customer'); setName(''); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                role === 'customer'
                  ? 'bg-[#11EDE2] text-[#171642]'
                  : 'bg-[#CACADD]/20 text-[#676789] hover:bg-[#CACADD]/40'
              }`}
            >
              <Users className="w-4 h-4" />
              Zákazník
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#171642] font-bold">
                {role === 'employee' ? 'Vyberte zamestnanca' : 'Vyberte zákazníka'}
              </Label>
              
              {/* Dropdown select from DB */}
              <div className="relative">
                <select
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading || loadingList}
                  className="w-full h-10 px-3 pr-10 rounded-md border border-[#CACADD] bg-white text-[#171642] text-sm focus:border-[#11EDE2] focus:ring-1 focus:ring-[#11EDE2] outline-none appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">
                    {loadingList ? 'Načítavam...' : `-- Vyberte ${role === 'employee' ? 'zamestnanca' : 'zákazníka'} --`}
                  </option>
                  {role === 'employee'
                    ? employees.map((emp) => (
                        <option key={emp.id || emp.name} value={emp.name}>
                          {emp.name}
                        </option>
                      ))
                    : customers.map((cust) => (
                        <option key={cust.name + cust.email} value={cust.name}>
                          {cust.name} ({cust.email})
                        </option>
                      ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#676789] pointer-events-none" />
              </div>

              {role === 'employee' && employees.length === 0 && !loadingList && (
                <p className="text-xs text-[#676789]">Žiadni zamestnanci v databáze</p>
              )}
              {role === 'customer' && customers.length === 0 && !loadingList && (
                <p className="text-xs text-[#676789]">Žiadni zákazníci v ticketoch</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#11EDE2] hover:bg-[#0FEFAA] text-[#171642] font-extrabold text-lg"
              disabled={loading || !name}
            >
              {loading ? (
                'Prihlasovanie...'
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Prihlásiť sa
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-[#676789] hover:text-[#11EDE2]"
            >
              Späť na hlavnú stránku
            </Button>
          </div>
        </div>

        <p className="text-center text-[#CACADD] mt-6 text-sm">
          {role === 'employee'
            ? 'Vyberte svoje meno zo zoznamu zamestnancov'
            : 'Vyberte svoje meno zo zoznamu zákazníkov'}
        </p>
      </div>
    </div>
  );
}
