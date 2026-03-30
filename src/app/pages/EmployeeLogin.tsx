import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { LogIn, Users, UserCheck } from 'lucide-react';

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
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
                {role === 'employee' ? 'Meno zamestnanca' : 'Meno zákazníka'}
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'employee' ? 'Zadajte meno zamestnanca' : 'Zadajte meno zákazníka'}
                required
                disabled={loading}
                className="border-[#CACADD] focus:border-[#11EDE2] focus:ring-[#11EDE2]"
              />
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
            ? 'Zadajte svoje meno pre prihlásenie ako zamestnanec'
            : 'Zadajte svoje meno pre prihlásenie ako zákazník'}
        </p>
      </div>
    </div>
  );
}