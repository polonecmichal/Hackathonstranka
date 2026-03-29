import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  UserPlus, 
  Check, 
  X,
  Users,
  Target,
  Settings
} from 'lucide-react';
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
  status: string;
  assignedTo: string | null;
  createdAt: string;
  resolved: boolean;
  valueDelivered: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  email: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [matchingSuggestions, setMatchingSuggestions] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch requests
      const requestsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/requests`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const requestsData = await requestsResponse.json();
      if (requestsData.success) {
        setRequests(requestsData.requests);
      }

      // Fetch team members
      const teamResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/team`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const teamData = await teamResponse.json();
      if (teamData.success) {
        setTeamMembers(teamData.team);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Chyba pri načítaní dát');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequest = async (requestId: string, updates: Partial<Request>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/requests/${requestId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(updates)
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Žiadosť bola aktualizovaná');
        fetchData();
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Chyba pri aktualizácii žiadosti');
    }
  };

  const getMatchingSuggestions = async (request: Request) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/matchmaking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            requestType: request.requestType,
            description: request.description
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        setMatchingSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error getting matchmaking suggestions:', error);
    }
  };

  const addTeamMember = async (member: Omit<TeamMember, 'id'>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/team`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(member)
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Člen tímu bol pridaný');
        fetchData();
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Chyba pri pridávaní člena tímu');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const inProgressRequests = requests.filter(r => r.status === 'in_progress');
  const resolvedRequests = requests.filter(r => r.resolved);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Pridať člena tímu
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nový člen tímu</DialogTitle>
                </DialogHeader>
                <AddTeamMemberForm onSubmit={addTeamMember} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Správa žiadostí</TabsTrigger>
            <TabsTrigger value="team">Tím</TabsTrigger>
            <TabsTrigger value="matchmaking">Matchmaking</TabsTrigger>
          </TabsList>

          {/* Requests Management */}
          <TabsContent value="requests" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pending */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    Čakajúce ({pendingRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingRequests.map(request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onUpdate={updateRequest}
                      onViewDetails={(req) => {
                        setSelectedRequest(req);
                        getMatchingSuggestions(req);
                      }}
                    />
                  ))}
                  {pendingRequests.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Žiadne čakajúce žiadosti
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* In Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    V procese ({inProgressRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {inProgressRequests.map(request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onUpdate={updateRequest}
                      onViewDetails={(req) => {
                        setSelectedRequest(req);
                        getMatchingSuggestions(req);
                      }}
                    />
                  ))}
                  {inProgressRequests.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Žiadne žiadosti v procese
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Resolved */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Vyriešené ({resolvedRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {resolvedRequests.map(request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onUpdate={updateRequest}
                      onViewDetails={setSelectedRequest}
                    />
                  ))}
                  {resolvedRequests.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Žiadne vyriešené žiadosti
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Request Details Dialog */}
            {selectedRequest && (
              <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Detail žiadosti</DialogTitle>
                  </DialogHeader>
                  <RequestDetailsView
                    request={selectedRequest}
                    suggestions={matchingSuggestions}
                    onUpdate={updateRequest}
                    onClose={() => setSelectedRequest(null)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* Team Management */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Členovia tímu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map(member => (
                    <Card key={member.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <p className="text-xs text-gray-500 mt-1">{member.email}</p>
                          {member.expertise && member.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {member.expertise.map((exp, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {exp}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {teamMembers.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Zatiaľ neboli pridaní žiadni členovia tímu
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matchmaking */}
          <TabsContent value="matchmaking">
            <Card>
              <CardHeader>
                <CardTitle>AI Matchmaking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Systém automaticky navrhuje najvhodnejších členov tímu pre každú žiadosť na základe typu žiadosti a popisu.
                </p>
                <div className="space-y-4">
                  {requests.filter(r => !r.resolved).map(request => (
                    <Card key={request.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{request.name}</h3>
                          <p className="text-sm text-gray-600">{request.requestType}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            getMatchingSuggestions(request);
                          }}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Nájsť match
                        </Button>
                      </div>
                      {request.assignedTo && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Users className="w-4 h-4" />
                          Pridelené: {request.assignedTo}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RequestCard({ 
  request, 
  onUpdate,
  onViewDetails 
}: { 
  request: Request; 
  onUpdate: (id: string, updates: Partial<Request>) => void;
  onViewDetails: (request: Request) => void;
}) {
  return (
    <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(request)}>
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{request.name}</h4>
            <p className="text-xs text-gray-600">{request.company}</p>
          </div>
          <Badge className={`text-xs ${
            request.priority === 'high' ? 'bg-red-100 text-red-700' :
            request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {request.priority === 'high' ? 'Vysoká' : request.priority === 'medium' ? 'Stredná' : 'Nízka'}
          </Badge>
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">{request.description}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(request.id, { 
                status: request.status === 'pending' ? 'in_progress' : 'resolved',
                resolved: request.status !== 'pending'
              });
            }}
          >
            {request.status === 'pending' ? 'Začať' : 'Vyriešiť'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function RequestDetailsView({ 
  request, 
  suggestions,
  onUpdate, 
  onClose 
}: { 
  request: Request;
  suggestions: any[];
  onUpdate: (id: string, updates: Partial<Request>) => void;
  onClose: () => void;
}) {
  const [assignedTo, setAssignedTo] = useState(request.assignedTo || '');
  const [status, setStatus] = useState(request.status);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onUpdate(request.id, { assignedTo, status });
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Meno</Label>
          <p className="font-medium">{request.name}</p>
        </div>
        <div>
          <Label>Email</Label>
          <p className="font-medium">{request.email}</p>
        </div>
        <div>
          <Label>Spoločnosť</Label>
          <p className="font-medium">{request.company || '-'}</p>
        </div>
        <div>
          <Label>Typ žiadosti</Label>
          <p className="font-medium">{request.requestType}</p>
        </div>
      </div>

      <div>
        <Label>Popis</Label>
        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
      </div>

      {suggestions.length > 0 && (
        <div>
          <Label className="mb-2 block">AI odporúčania</Label>
          <div className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{suggestion.name}</p>
                  <p className="text-xs text-gray-600">{suggestion.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{suggestion.matchScore}% match</Badge>
                  <Button
                    size="sm"
                    onClick={() => setAssignedTo(suggestion.name)}
                  >
                    Prideliť
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="assignedTo">Prideliť členu tímu</Label>
          <Input
            id="assignedTo"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Meno člena tímu"
          />
        </div>

        <div>
          <Label htmlFor="status">Stav</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Čakajúce</SelectItem>
              <SelectItem value="in_progress">V procese</SelectItem>
              <SelectItem value="resolved">Vyriešené</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1">
          <Check className="w-4 h-4 mr-2" />
          Uložiť zmeny
        </Button>
        <Button onClick={onClose} variant="outline">
          <X className="w-4 h-4 mr-2" />
          Zrušiť
        </Button>
      </div>
    </div>
  );
}

function AddTeamMemberForm({ onSubmit }: { onSubmit: (member: Omit<TeamMember, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    expertise: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      expertise: formData.expertise.split(',').map(e => e.trim()).filter(e => e)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Meno *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="role">Rola *</Label>
        <Input
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="expertise">Expertíza (oddelené čiarkami)</Label>
        <Input
          id="expertise"
          value={formData.expertise}
          onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
          placeholder="napr. investment, marketing, sales"
        />
      </div>
      <Button type="submit" className="w-full">
        Pridať člena tímu
      </Button>
    </form>
  );
}