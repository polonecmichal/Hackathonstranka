import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { ArrowLeft, Send } from 'lucide-react';

export default function CreateTicket() {
  const [formData, setFormData] = useState({
    meno: '',
    email: '',
    opisProblemu: '',
    zakaznik: '',
    status: 'novy'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/tickets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chyba pri vytváraní ticketu');
      }

      if (data.success) {
        setSuccess(true);
        setFormData({
          meno: '',
          email: '',
          opisProblemu: '',
          zakaznik: '',
          status: 'novy'
        });
        
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(err instanceof Error ? err.message : 'Nepodarilo sa vytvoriť ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#CACADD]/10">
      {/* Header */}
      <header className="bg-white border-b border-[#CACADD] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Späť
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#11EDE2] rounded-full"></div>
              <div>
                <h1 className="text-lg font-bold text-[#171642]">Vytvoriť nový ticket</h1>
                <p className="text-sm text-[#676789]">Priraďte ticket zamestnancovi</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#CACADD]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="meno" className="text-[#171642] font-bold">
                Meno klienta *
              </Label>
              <Input
                id="meno"
                type="text"
                value={formData.meno}
                onChange={(e) => handleChange('meno', e.target.value)}
                placeholder="Zadajte meno klienta"
                required
                className="border-[#CACADD] focus:border-[#11EDE2] focus:ring-[#11EDE2]"
                disabled={loading}
              />
            </div>

            {/* Customer Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#171642] font-bold">
                Email klienta *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="klient@example.com"
                required
                className="border-[#CACADD] focus:border-[#11EDE2] focus:ring-[#11EDE2]"
                disabled={loading}
              />
            </div>

            {/* Problem Description */}
            <div className="space-y-2">
              <Label htmlFor="opisProblemu" className="text-[#171642] font-bold">
                Popis problému *
              </Label>
              <Textarea
                id="opisProblemu"
                value={formData.opisProblemu}
                onChange={(e) => handleChange('opisProblemu', e.target.value)}
                placeholder="Popíšte problém detailne..."
                required
                rows={6}
                className="border-[#CACADD] focus:border-[#11EDE2] focus:ring-[#11EDE2]"
                disabled={loading}
              />
            </div>

            {/* Assigned Employee */}
            <div className="space-y-2">
              <Label htmlFor="zakaznik" className="text-[#171642] font-bold">
                Priradiť zamestnancovi *
              </Label>
              <Input
                id="zakaznik"
                type="text"
                value={formData.zakaznik}
                onChange={(e) => handleChange('zakaznik', e.target.value)}
                placeholder="Zadajte meno zamestnanca (napr: Ján Novák)"
                required
                className="border-[#CACADD] focus:border-[#11EDE2] focus:ring-[#11EDE2]"
                disabled={loading}
              />
              <p className="text-xs text-[#676789]">
                Tip: Zadajte presné meno zamestnanca, ktorý sa má starať o tento ticket
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-[#171642] font-bold">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
                disabled={loading}
              >
                <SelectTrigger className="border-[#CACADD] focus:border-[#11EDE2] focus:ring-[#11EDE2]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novy">Nový</SelectItem>
                  <SelectItem value="v_progrese">V progrese</SelectItem>
                  <SelectItem value="vyrieseny">Vyriešený</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                ✓ Ticket bol úspešne vytvorený!
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#11EDE2] hover:bg-[#0FEFAA] text-[#171642] font-extrabold text-lg"
                disabled={loading}
              >
                {loading ? (
                  'Vytváranie...'
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Vytvoriť ticket
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="border-[#CACADD] text-[#171642]"
                disabled={loading}
              >
                Zrušiť
              </Button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-900 font-bold mb-2">Ako to funguje?</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Ticket bude automaticky priradený zamestnancovi podľa mena</li>
            <li>• Zamestnanec uvidí ticket vo svojom dashboarde po prihlásení</li>
            <li>• Zamestnanec môže meniť status ticketu (nový → v progrese → vyriešený)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
