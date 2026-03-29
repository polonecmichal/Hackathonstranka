import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Database, ArrowLeft, Loader2 } from 'lucide-react';

export default function DemoData() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const demoTickets = [
    {
      meno: "Peter Novák",
      email: "peter.novak@example.com",
      opisProblemu: "Potrebujem pomoc s nastavením nového účtu v systéme. Nemôžem sa prihlásiť.",
      zakaznik: "Ján Horák",
      status: "novy"
    },
    {
      meno: "Eva Kováčová",
      email: "eva.kovacova@example.com",
      opisProblemu: "Mám problém s fakturáciou. Faktúra sa nezobrazuje správne.",
      zakaznik: "Ján Horák",
      status: "novy"
    },
    {
      meno: "Martin Szabó",
      email: "martin.szabo@example.com",
      opisProblemu: "Chcel by som pridať nového používateľa do tímu, ale neviem ako na to.",
      zakaznik: "Mária Vargová",
      status: "novy"
    },
    {
      meno: "Lucia Tóthová",
      email: "lucia.tothova@example.com",
      opisProblemu: "Exportovanie dát nefunguje. Keď kliknem na tlačidlo Export, nič sa nestane.",
      zakaznik: "Mária Vargová",
      status: "v_progrese"
    },
    {
      meno: "Tomáš Balog",
      email: "tomas.balog@example.com",
      opisProblemu: "Potrebujem zmeniť email adresu v profile, ale systém mi to nedovolí.",
      zakaznik: "Peter Molnár",
      status: "novy"
    }
  ];

  const createDemoTickets = async () => {
    setLoading(true);
    setStatus('Vytváram demo tickety...');

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const ticket of demoTickets) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/tickets`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify(ticket),
            }
          );

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          console.error('Error creating ticket:', error);
        }
      }

      setStatus(`✓ Hotovo! Vytvorené: ${successCount}, Chyby: ${errorCount}`);
    } catch (error) {
      setStatus(`✗ Chyba: ${error instanceof Error ? error.message : 'Neznáma chyba'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171642] to-[#676789] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:text-[#11EDE2] mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Späť na hlavnú stránku
          </Button>
          
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#11EDE2] rounded-full flex items-center justify-center">
                <Database className="w-7 h-7 text-[#171642]" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-[#171642]">Demo Data Generator</h1>
                <p className="text-[#676789]">Vytvorte testovacie tickety pre testovanie systému</p>
              </div>
            </div>

            {/* Demo Employees Info */}
            <div className="bg-[#11EDE2]/10 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-[#171642] mb-4">Demo zamestnanci</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="font-bold text-[#171642]">Ján Horák</p>
                  <p className="text-sm text-[#676789]">2 tickety</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-bold text-[#171642]">Mária Vargová</p>
                  <p className="text-sm text-[#676789]">2 tickety</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="font-bold text-[#171642]">Peter Molnár</p>
                  <p className="text-sm text-[#676789]">1 ticket</p>
                </div>
              </div>
            </div>

            {/* Demo Tickets Preview */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#171642] mb-4">Tickety na vytvorenie</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {demoTickets.map((ticket, idx) => (
                  <div key={idx} className="bg-[#CACADD]/20 rounded-lg p-4 border border-[#CACADD]">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-[#171642]">{ticket.meno}</p>
                      <span className="text-xs bg-[#11EDE2]/20 text-[#171642] px-2 py-1 rounded-full">
                        {ticket.zakaznik}
                      </span>
                    </div>
                    <p className="text-sm text-[#676789] mb-1">{ticket.email}</p>
                    <p className="text-sm text-[#171642]">{ticket.opisProblemu}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Message */}
            {status && (
              <div className={`mb-6 p-4 rounded-lg ${
                status.startsWith('✓') 
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : status.startsWith('✗')
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-blue-50 border border-blue-200 text-blue-700'
              }`}>
                {status}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={createDemoTickets}
                disabled={loading}
                className="flex-1 bg-[#11EDE2] hover:bg-[#0FEFAA] text-[#171642] font-extrabold text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Vytváram...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Vytvoriť demo tickety
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/employee/login')}
                disabled={loading}
                className="border-[#CACADD] text-[#171642]"
              >
                Prihlásiť sa
              </Button>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-900 font-bold mb-2">Ako používať:</h3>
              <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                <li>Kliknite na "Vytvoriť demo tickety"</li>
                <li>Počkajte, kým sa vytvoria všetky tickety</li>
                <li>Prihláste sa ako jeden z demo zamestnancov (napr. "Ján Horák")</li>
                <li>Uvidíte svoje pridelené tickety v dashboarde</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
