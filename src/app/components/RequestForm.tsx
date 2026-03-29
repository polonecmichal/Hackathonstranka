import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface RequestFormProps {
  onSuccess?: () => void;
  source?: string;
}

export function RequestForm({ onSuccess, source = 'web' }: RequestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    userType: '',
    requestType: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...formData,
            source
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Žiadosť bola úspešne odoslaná!');
        setFormData({
          name: '',
          email: '',
          company: '',
          userType: '',
          requestType: '',
          description: '',
          priority: 'medium'
        });
        onSuccess?.();
      } else {
        toast.error('Chyba pri odosielaní žiadosti');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Chyba pri odosielaní žiadosti');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Meno a priezvisko *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Spoločnosť / Organizácia</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userType">Typ používateľa *</Label>
          <Select
            value={formData.userType}
            onValueChange={(value) => setFormData({ ...formData, userType: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Vyberte typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startup">Startup</SelectItem>
              <SelectItem value="investor">Investor</SelectItem>
              <SelectItem value="service_provider">Service Provider</SelectItem>
              <SelectItem value="community_member">Člen komunity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requestType">Typ žiadosti *</Label>
          <Select
            value={formData.requestType}
            onValueChange={(value) => setFormData({ ...formData, requestType: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Vyberte typ žiadosti" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="finding_investor">Hľadanie investora</SelectItem>
              <SelectItem value="finding_employee">Hľadanie zamestnanca</SelectItem>
              <SelectItem value="speaking_event">Speaking príležitosť</SelectItem>
              <SelectItem value="marketing_support">Marketingová podpora</SelectItem>
              <SelectItem value="sales_support">Sales podpora</SelectItem>
              <SelectItem value="finding_clients">Hľadanie klientov</SelectItem>
              <SelectItem value="other">Iné</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Popis problému / potreby *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            required
            placeholder="Popíšte detailne vašu požiadavku..."
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Odosiela sa...
            </>
          ) : (
            'Odoslať žiadosť'
          )}
        </Button>
      </form>
    </Card>
  );
}