import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft, 
  Filter, 
  Search, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Users,
  BarChart3
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';

interface Request {
  id: string;
  name: string;
  email: string;
  userType: string;
  requestType: string;
  description: string;
  priority: string;
  company: string;
  source: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolved: boolean;
  valueDelivered: string | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, statusFilter, priorityFilter]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/requests`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Chyba pri načítaní žiadostí');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(req => req.priority === priorityFilter);
    }

    setFilteredRequests(filtered);
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    resolved: requests.filter(r => r.resolved).length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      finding_investor: 'Hľadanie investora',
      finding_employee: 'Hľadanie zamestnanca',
      speaking_event: 'Speaking event',
      marketing_support: 'Marketing',
      sales_support: 'Sales',
      finding_clients: 'Hľadanie klientov',
      other: 'Iné'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Späť
              </Button>
              <h1 className="text-2xl font-bold">Dashboard - Prehľad žiadostí</h1>
            </div>
            <Button onClick={() => navigate('/admin')} variant="outline">
              Admin Panel
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Celkom žiadostí"
            value={stats.total}
            color="blue"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Čakajúce"
            value={stats.pending}
            color="yellow"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="V procese"
            value={stats.inProgress}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Vyriešené"
            value={stats.resolved}
            color="green"
          />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Hľadať..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Stav" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky stavy</SelectItem>
                  <SelectItem value="pending">Čakajúce</SelectItem>
                  <SelectItem value="in_progress">V procese</SelectItem>
                  <SelectItem value="resolved">Vyriešené</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorita" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všetky priority</SelectItem>
                  <SelectItem value="high">Vysoká</SelectItem>
                  <SelectItem value="medium">Stredná</SelectItem>
                  <SelectItem value="low">Nízka</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Načítavam žiadosti...
              </CardContent>
            </Card>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Nenašli sa žiadne žiadosti
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{request.name}</h3>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority === 'high' ? 'Vysoká' : request.priority === 'medium' ? 'Stredná' : 'Nízka'}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status === 'pending' ? 'Čakajúce' : request.status === 'in_progress' ? 'V procese' : 'Vyriešené'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{request.email}</p>
                          {request.company && (
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Spoločnosť:</span> {request.company}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Typ používateľa:</span>
                          <span className="ml-2 font-medium">
                            {request.userType === 'startup' ? 'Startup' : 
                             request.userType === 'investor' ? 'Investor' :
                             request.userType === 'service_provider' ? 'Service Provider' : 
                             'Člen komunity'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Typ žiadosti:</span>
                          <span className="ml-2 font-medium">{getRequestTypeLabel(request.requestType)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Zdroj:</span>
                          <span className="ml-2 font-medium">{request.source}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Vytvorené:</span>
                          <span className="ml-2 font-medium">
                            {new Date(request.createdAt).toLocaleDateString('sk-SK')}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Popis:</span> {request.description}
                        </p>
                      </div>

                      {request.assignedTo && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Users className="w-4 h-4" />
                          Pridelené: {request.assignedTo}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}