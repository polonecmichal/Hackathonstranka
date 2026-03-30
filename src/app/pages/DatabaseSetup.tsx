import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import {
  Database,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserPlus,
  Ticket,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SchemaInfo {
  tableName: string;
  columns: string[];
  sampleRows: any[];
}

interface SetupResult {
  success: boolean;
  employee?: any;
  ticketResults?: any[];
  schema?: {
    employees: string[];
    tickets: string[];
    assignColumn: string | null;
  };
  error?: string;
  hint?: string;
}

export default function DatabaseSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [employeesSchema, setEmployeesSchema] = useState<SchemaInfo | null>(null);
  const [ticketsSchema, setTicketsSchema] = useState<SchemaInfo | null>(null);
  const [schemaError, setSchemaError] = useState('');
  const [employeeName, setEmployeeName] = useState('Testovací Zamestnanec');
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    setSchemaLoading(true);
    setSchemaError('');
    try {
      const [empRes, tickRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/schema/employees`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/schema/tickets`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }),
      ]);

      const empData = await empRes.json();
      const tickData = await tickRes.json();

      if (empData.success) setEmployeesSchema(empData);
      else setSchemaError(`Employees: ${empData.error}`);

      if (tickData.success) setTicketsSchema(tickData);
      else setSchemaError(prev => prev + ` | Tickets: ${tickData.error}`);
    } catch (err) {
      setSchemaError(err instanceof Error ? err.message : 'Chyba pri načítaní schémy');
    } finally {
      setSchemaLoading(false);
    }
  };

  const runSetup = async () => {
    if (!employeeName.trim()) return;
    setLoading(true);
    setSetupResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/setup-employee`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            employeeName: employeeName.trim(),
            ticketNumbers: ['01010102', '02110403'],
          }),
        }
      );

      const data = await response.json();
      setSetupResult(data);

      if (data.success) {
        // Refresh schema after setup
        loadSchemas();
      }
    } catch (err) {
      setSetupResult({
        success: false,
        error: err instanceof Error ? err.message : 'Neznáma chyba',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'text-green-600 bg-green-50 border-green-200';
      case 'found_but_no_assign_column': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'not_found': return 'text-red-600 bg-red-50 border-red-200';
      case 'update_failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTicketStatusLabel = (status: string) => {
    switch (status) {
      case 'assigned': return '✓ Priradený';
      case 'found_but_no_assign_column': return '⚠ Nájdený, ale stĺpec pre priradenie nenájdený';
      case 'not_found': return '✗ Nenájdený';
      case 'update_failed': return '✗ Chyba pri aktualizácii';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#171642] to-[#676789]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:text-[#11EDE2] mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Späť
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#11EDE2] rounded-full flex items-center justify-center">
              <Database className="w-7 h-7 text-[#171642]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Databázová diagnostika & Setup</h1>
              <p className="text-[#CACADD]">Zobrazenie reálnej štruktúry tabuliek a nastavenie zamestnanca</p>
            </div>
          </div>
        </div>

        {/* Schema Inspector */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-[#171642] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#11EDE2]" />
              Štruktúra databázových tabuliek
            </h2>
            <Button
              variant="outline"
              onClick={loadSchemas}
              disabled={schemaLoading}
              className="border-[#11EDE2] text-[#11EDE2] hover:bg-[#11EDE2]/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${schemaLoading ? 'animate-spin' : ''}`} />
              Obnoviť schému
            </Button>
          </div>

          {schemaError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              {schemaError}
            </div>
          )}

          {schemaLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-[#11EDE2] animate-spin mx-auto mb-3" />
              <p className="text-[#676789]">Načítavam schému databázy...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employees Table */}
              <div className="border border-[#CACADD] rounded-xl overflow-hidden">
                <div className="bg-[#171642] px-4 py-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#11EDE2]" />
                  <span className="text-white font-bold">Tabuľka: employees</span>
                  {employeesSchema && (
                    <span className="ml-auto text-[#11EDE2] text-sm">
                      {employeesSchema.columns.length} stĺpcov
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {employeesSchema ? (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {employeesSchema.columns.map(col => (
                          <span
                            key={col}
                            className={`px-2 py-1 rounded text-xs font-mono font-bold border ${
                              ['name', 'meno', 'full_name', 'employee_name', 'first_name', 'display_name'].includes(col)
                                ? 'bg-[#11EDE2]/20 border-[#11EDE2] text-[#171642]'
                                : 'bg-[#CACADD]/20 border-[#CACADD] text-[#676789]'
                            }`}
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                      {employeesSchema.sampleRows.length > 0 && (
                        <div>
                          <p className="text-xs text-[#676789] font-bold mb-2">Vzorové záznamy:</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {employeesSchema.sampleRows.map((row, i) => (
                              <div key={i} className="text-xs bg-[#CACADD]/10 rounded p-2 font-mono">
                                {Object.entries(row).map(([k, v]) => (
                                  <div key={k}><span className="text-[#676789]">{k}:</span> <span className="text-[#171642]">{String(v)}</span></div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {employeesSchema.sampleRows.length === 0 && (
                        <p className="text-sm text-[#676789] italic">Tabuľka je prázdna</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-red-500">Tabuľka nenájdená alebo nedostupná</p>
                  )}
                </div>
              </div>

              {/* Tickets Table */}
              <div className="border border-[#CACADD] rounded-xl overflow-hidden">
                <div className="bg-[#171642] px-4 py-3 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#11EDE2]" />
                  <span className="text-white font-bold">Tabuľka: tickets</span>
                  {ticketsSchema && (
                    <span className="ml-auto text-[#11EDE2] text-sm">
                      {ticketsSchema.columns.length} stĺpcov
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {ticketsSchema ? (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {ticketsSchema.columns.map(col => (
                          <span
                            key={col}
                            className={`px-2 py-1 rounded text-xs font-mono font-bold border ${
                              ['meno', 'name', 'customer_name'].includes(col)
                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                : ['zakaznik', 'zamestnanec', 'employee', 'assigned_to'].includes(col)
                                ? 'bg-purple-100 border-purple-300 text-purple-700'
                                : 'bg-[#CACADD]/20 border-[#CACADD] text-[#676789]'
                            }`}
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                      {ticketsSchema.sampleRows.length > 0 && (
                        <div>
                          <p className="text-xs text-[#676789] font-bold mb-2">Vzorové záznamy:</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {ticketsSchema.sampleRows.map((row, i) => (
                              <div key={i} className="text-xs bg-[#CACADD]/10 rounded p-2 font-mono">
                                {Object.entries(row).map(([k, v]) => (
                                  <div key={k}><span className="text-[#676789]">{k}:</span> <span className="text-[#171642]">{String(v)}</span></div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {ticketsSchema.sampleRows.length === 0 && (
                        <p className="text-sm text-[#676789] italic">Tabuľka je prázdna</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-red-500">Tabuľka nenájdená alebo nedostupná</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded border bg-[#11EDE2]/20 border-[#11EDE2] text-[#171642] font-mono font-bold">stĺpec</span>
              <span className="text-[#676789]">= meno zamestnanca (employees)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded border bg-blue-100 border-blue-300 text-blue-700 font-mono font-bold">stĺpec</span>
              <span className="text-[#676789]">= meno zákazníka (tickets)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded border bg-purple-100 border-purple-300 text-purple-700 font-mono font-bold">stĺpec</span>
              <span className="text-[#676789]">= priradenie zamestnanca (tickets)</span>
            </div>
          </div>
        </div>

        {/* Setup: Create Employee + Assign Tickets */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
          <h2 className="text-xl font-extrabold text-[#171642] mb-2 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#11EDE2]" />
            Vytvoriť zamestnanca & priradiť tickety
          </h2>
          <p className="text-[#676789] text-sm mb-6">
            Systém automaticky detekuje správne stĺpce, vytvorí zamestnanca a priradí mu tickety s číslami <strong>01010102</strong> a <strong>02110403</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="empName" className="text-[#171642] font-bold">
                Meno zamestnanca *
              </Label>
              <Input
                id="empName"
                type="text"
                value={employeeName}
                onChange={e => setEmployeeName(e.target.value)}
                placeholder="Zadajte meno zamestnanca"
                className="border-[#CACADD] focus:border-[#11EDE2]"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#171642] font-bold">Čísla ticketov (fixné)</Label>
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-[#11EDE2]/10 border border-[#11EDE2] rounded-lg text-[#171642] font-mono font-bold text-sm">01010102</span>
                <span className="px-4 py-2 bg-[#11EDE2]/10 border border-[#11EDE2] rounded-lg text-[#171642] font-mono font-bold text-sm">02110403</span>
              </div>
            </div>
          </div>

          <Button
            onClick={runSetup}
            disabled={loading || !employeeName.trim()}
            className="bg-[#11EDE2] hover:bg-[#0FEFAA] text-[#171642] font-extrabold px-8"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Spúšťam setup...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Vytvoriť zamestnanca & priradiť tickety
              </>
            )}
          </Button>
        </div>

        {/* Setup Result */}
        {setupResult && (
          <div className={`bg-white rounded-2xl p-6 shadow-2xl mb-6 border-2 ${
            setupResult.success ? 'border-green-300' : 'border-red-300'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              {setupResult.success ? (
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              ) : (
                <XCircle className="w-7 h-7 text-red-500" />
              )}
              <h2 className={`text-xl font-extrabold ${setupResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {setupResult.success ? 'Setup prebehol úspešne!' : 'Setup zlyhal'}
              </h2>
            </div>

            {setupResult.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 font-bold">Chyba:</p>
                <p className="text-red-600 text-sm">{setupResult.error}</p>
                {setupResult.hint && <p className="text-red-500 text-xs mt-2">{setupResult.hint}</p>}
              </div>
            )}

            {setupResult.success && setupResult.employee && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Result */}
                <div className="border border-green-200 rounded-xl p-4 bg-green-50">
                  <h3 className="font-extrabold text-green-800 mb-3 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Zamestnanec
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-green-600 font-bold">Meno: </span>
                      <span className="text-green-900 font-bold text-base">{setupResult.employee._displayName}</span>
                    </div>
                    <div>
                      <span className="text-green-600 font-bold">ID: </span>
                      <span className="text-green-800 font-mono">{setupResult.employee.id}</span>
                    </div>
                    <div>
                      <span className="text-green-600 font-bold">Stĺpec mena: </span>
                      <span className="text-green-800 font-mono">{setupResult.employee._nameColumn}</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Results */}
                <div className="border border-[#CACADD] rounded-xl p-4">
                  <h3 className="font-extrabold text-[#171642] mb-3 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#11EDE2]" />
                    Výsledky ticketov
                  </h3>
                  <div className="space-y-3">
                    {setupResult.ticketResults?.map((tr: any, i) => (
                      <div key={i} className={`rounded-lg p-3 border ${getTicketStatusColor(tr.status)}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-sm">{tr.ticketNumber}</span>
                          <span className="text-xs font-bold">{getTicketStatusLabel(tr.status)}</span>
                        </div>
                        {tr.ticket && (
                          <p className="text-xs opacity-80">ID: {tr.ticket.id}</p>
                        )}
                        {tr.error && (
                          <p className="text-xs mt-1">{tr.error}</p>
                        )}
                        {tr.warning && (
                          <p className="text-xs mt-1">{tr.warning}</p>
                        )}
                        {tr.searchedColumns && (
                          <p className="text-xs mt-1">Hľadal som v stĺpcoch: {tr.searchedColumns.join(', ')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Schema info */}
            {setupResult.schema && (
              <div className="mt-4">
                <button
                  onClick={() => setShowRawData(!showRawData)}
                  className="flex items-center gap-2 text-sm text-[#676789] hover:text-[#171642]"
                >
                  {showRawData ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showRawData ? 'Skryť' : 'Zobraziť'} detaily schémy
                </button>
                {showRawData && (
                  <div className="mt-3 bg-[#CACADD]/10 rounded-lg p-4 text-xs font-mono">
                    <p><span className="text-[#676789]">employees columns:</span> {setupResult.schema.employees.join(', ')}</p>
                    <p><span className="text-[#676789]">tickets columns:</span> {setupResult.schema.tickets.join(', ')}</p>
                    <p><span className="text-[#676789]">assign column:</span> {setupResult.schema.assignColumn || 'nenájdený'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white/10 rounded-2xl p-6 text-white">
          <h3 className="font-extrabold text-lg mb-4">Po dokončení setupu:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/employee/login')}
              className="bg-[#11EDE2] hover:bg-[#0FEFAA] text-[#171642] font-bold rounded-xl p-4 text-sm transition-colors"
            >
              Prihlásiť sa ako zamestnanec →
            </button>
            <button
              onClick={() => navigate('/employee/login')}
              className="bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl p-4 text-sm transition-colors"
            >
              Prihlásiť sa ako zákazník →
            </button>
            <button
              onClick={loadSchemas}
              className="bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl p-4 text-sm transition-colors"
            >
              Obnoviť schému databázy ↺
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
