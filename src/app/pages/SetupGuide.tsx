import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { CheckCircle2, Database, LogIn, PlusCircle, FileText } from 'lucide-react';

export default function SetupGuide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171642] to-[#676789] p-4">
      <div className="max-w-5xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-[#11EDE2] rounded-full"></div>
            <span className="text-4xl font-extrabold text-white lowercase">
              zero one hundred
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Employee Ticket System
          </h1>
          <p className="text-xl text-[#CACADD]">
            Systém pre správu ticketov a zamestnancov
          </p>
        </div>

        {/* Setup Steps */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-extrabold text-[#171642] mb-6">
            🚀 Rýchly štart v 3 krokoch
          </h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4 p-4 bg-[#11EDE2]/10 rounded-xl border-2 border-[#11EDE2]">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#11EDE2] rounded-full flex items-center justify-center text-[#171642] font-extrabold text-xl">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#171642] mb-2">
                  <Database className="inline w-5 h-5 mr-2" />
                  Vytvorte tabuľky v Supabase
                </h3>
                <p className="text-[#676789] mb-3">
                  Prejdite do Supabase Dashboard → SQL Editor a spustite SQL skript na vytvorenie tabuliek <code className="bg-[#CACADD]/20 px-2 py-1 rounded">employees</code> a <code className="bg-[#CACADD]/20 px-2 py-1 rounded">tickets</code>
                </p>
                <Button
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  variant="outline"
                  size="sm"
                  className="border-[#11EDE2] text-[#11EDE2] hover:bg-[#11EDE2] hover:text-[#171642]"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Zobraziť SQL skript v QUICK_START.md
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-extrabold text-xl">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#171642] mb-2">
                  <PlusCircle className="inline w-5 h-5 mr-2" />
                  Vytvorte demo dáta
                </h3>
                <p className="text-[#676789] mb-3">
                  Vytvorte 5 testovacích ticketov pre 3 demo zamestnancov (Ján Horák, Mária Vargová, Peter Molnár)
                </p>
                <Button
                  onClick={() => navigate('/demo-data')}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Vytvoriť demo dáta
                </Button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-extrabold text-xl">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#171642] mb-2">
                  <LogIn className="inline w-5 h-5 mr-2" />
                  Prihláste sa ako zamestnanec
                </h3>
                <p className="text-[#676789] mb-3">
                  Zadajte meno zamestnanca (napr. "Ján Horák") a uvidíte svoje pridelené tickety
                </p>
                <Button
                  onClick={() => navigate('/employee/login')}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Prihlásiť sa
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-[#171642] mb-4">Hlavné funkcie</h3>
            <ul className="space-y-2 text-[#676789]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#11EDE2] mt-0.5 flex-shrink-0" />
                <span>Login podľa mena zamestnanca</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#11EDE2] mt-0.5 flex-shrink-0" />
                <span>Automatické načítanie ticketov z databázy</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#11EDE2] mt-0.5 flex-shrink-0" />
                <span>Zmena statusu ticketov (nový → v progrese → vyriešený)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#11EDE2] mt-0.5 flex-shrink-0" />
                <span>Štatistiky a prehľadný dashboard</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-[#171642] mb-4">Užitočné odkazy</h3>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/create-ticket')}
                variant="outline"
                className="w-full justify-start border-[#CACADD] text-[#171642] hover:border-[#11EDE2]"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Vytvoriť nový ticket
              </Button>
              <Button
                onClick={() => navigate('/employee/login')}
                variant="outline"
                className="w-full justify-start border-[#CACADD] text-[#171642] hover:border-[#11EDE2]"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Prihlásenie zamestnanca
              </Button>
              <Button
                onClick={() => navigate('/demo-data')}
                variant="outline"
                className="w-full justify-start border-[#CACADD] text-[#171642] hover:border-[#11EDE2]"
              >
                <Database className="w-4 h-4 mr-2" />
                Demo dáta
              </Button>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-yellow-900 mb-2">
            📚 Dokumentácia
          </h3>
          <p className="text-yellow-800 mb-4">
            Kompletné inštrukcie nájdete v súboroch:
          </p>
          <ul className="text-yellow-800 space-y-1">
            <li>• <code className="bg-yellow-100 px-2 py-1 rounded">QUICK_START.md</code> - Rýchly štart guide</li>
            <li>• <code className="bg-yellow-100 px-2 py-1 rounded">EMPLOYEE_SYSTEM_README.md</code> - Detailná dokumentácia</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white hover:text-[#11EDE2]"
          >
            ← Späť na hlavnú stránku
          </Button>
        </div>
      </div>
    </div>
  );
}
