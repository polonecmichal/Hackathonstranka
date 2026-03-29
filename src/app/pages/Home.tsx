import { useState } from 'react';
import { Button } from '../components/ui/button';
import { AIChatbot } from '../components/AIChatbot';
import { RequestForm } from '../components/RequestForm';
import { IntegrationInfo } from '../components/IntegrationInfo';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Zap, 
  Instagram, 
  Facebook, 
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useNavigate } from 'react-router';

export default function Home() {
  const [showChatbot, setShowChatbot] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-[#CACADD] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-[#11EDE2] rounded-full"></div>
              </div>
              <span className="text-2xl font-extrabold text-[#171642] firstuppercase">
                zero one hundred
              </span>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/setup')}
                className="text-[#171642] hover:text-[#FFFFFF]"
              >
                setup
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="text-[#171642] hover:text-[#FFFFFF]"
              >
                dashboard
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin')}
                className="text-[#171642] hover:text-[#FFFFFF]"
              >
                admin
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/employee/login')}
                className="text-[#171642] hover:text-[#FFFFFF]"
              >
                zamestnanec
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/create-ticket')}
                className="text-[#171642] hover:text-[#FFFFFF]"
              >
                nový ticket
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#11EDE2] hover:bg-[#0FEFAA] text-[#FFFFFF] font-bold">
                    kontaktujte nás
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Odoslať žiadosť</DialogTitle>
                  </DialogHeader>
                  <RequestForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Circle Element */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#11EDE2] rounded-full opacity-10 -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-6 py-2 bg-[#11EDE2]/10 text-[#171642] rounded-full text-sm font-bold firstuppercase">
                Ai-powered request management
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-[#171642] leading-tight firstuppercase">
                Inteligentný systém pre{' '}
                <span className="text-[#11EDE2]">
                  Zero one hundred
                </span>
              </h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => setShowChatbot(!showChatbot)}
                  className="bg-[#11EDE2] hover:bg-[#0FEFAA] text-[#171642] text-lg px-8 font-extrabold lowercase"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Spustiť ai chatbot
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="text-lg px-8 border-[#171642] text-[#171642] hover:bg-[#CACADD]/20 font-extrabold firstuppercase">
                      Odoslať žiadosť
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nová žiadosť</DialogTitle>
                    </DialogHeader>
                    <RequestForm />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Integration badges */}
              <div className="flex items-center gap-6 pt-4">
                <span className="text-sm text-[#676789] font-bold firstuppercase">Integrácia s:</span>
                <div className="flex gap-4">
                  <Instagram className="w-6 h-6 text-[#11EDE2]" />
                  <Facebook className="w-6 h-6 text-[#11EDE2]" />
                  <MessageCircle className="w-6 h-6 text-[#11EDE2]" />
                </div>
              </div>
            </div>

            {/* Chatbot Preview */}
            <div className="relative">
              {showChatbot ? (
                <div className="h-[600px]">
                  <AIChatbot />
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-[#CACADD]">
                  <div className="aspect-video bg-gradient-to-br from-[#11EDE2]/20 to-[#0FEFAA]/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#11EDE2]/10"></div>
                    <MessageSquare className="w-24 h-24 text-[#11EDE2] relative z-10" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-extrabold text-[#171642] firstuppercase">Ai asistent je pripravený</h3>
                    <p className="text-pt26  [#676789] firstuppercase">
                      Kliknite na tlačidlo vyššie pre spustenie inteligentného chatbota, 
                      ktorý vám pomôže s kategorizáciou a spracovaním žiadostí.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#CACADD]/10 overflow-hidden">
        {/* Background Circle Element */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0FEFAA] rounded-full opacity-10 translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 text-[#171642] lowercase">Kľúčové funkcie systému</h2>
            <p className="text-xl text-[#676789]">
              Komplexné riešenie pre efektívne riadenie žiadostí
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 firstuppercase">
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8"  />}
              title="Zadávanie žiadostí"
              description="Startupy, investori a partneri môžu jednoducho zadať svoje potreby s všetkými relevantnými informáciami."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Automatická kategorizácia"
              description="Ai systém automaticky určí typ žiadosti a pridelí správnu kategóriu."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Prioritizácia"
              description="Inteligentné určenie dôležitosti každej žiadosti na základe kontextu."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Matchmaking"
              description="Systém navrhuje najvhodnejšie osoby z tímu pre riešenie konkrétnej žiadosti."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-8 h-8" />}
              title="Sledovanie stavu"
              description="Prehľadná evidencia vyriešených žiadostí a hodnoty, ktorú priniesli."
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title="Integrácie"
              description="Priame napojenie na instagram, facebook, discord a notion."
            />
          </div>
        </div>
      </section>

      {/* Request Types Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 text-[#171642] firstuppercase">Typy podporovaných žiadostí</h2>
            <p className="text-xl text-[#676789]">
              Systém spracováva širokú škálu požiadaviek
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RequestTypeCard title="hľadanie investora" />
            <RequestTypeCard title="hľadanie zamestnanca" />
            <RequestTypeCard title="speaking príležitosti" />
            <RequestTypeCard title="marketingová podpora" />
            <RequestTypeCard title="sales podpora" />
            <RequestTypeCard title="hľadanie klientov" />
          </div>
        </div>
      </section>

      {/* Integration Info */}
      <IntegrationInfo />

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#171642] overflow-hidden">
        {/* Background Circle Elements */}
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#11EDE2] rounded-full opacity-20 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#0FEFAA] rounded-full opacity-20 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <h2 className="text-4xl font-extrabold mb-6 lowercase">Pripravení začať?</h2>
          <p className="text-xl mb-8 text-[#CACADD]">
            Spustite ai chatbota alebo odošlite žiadosť priamo cez formulár
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setShowChatbot(true)}
              className="bg-[#11EDE2] text-[#171642] hover:bg-[#0FEFAA] text-lg px-8 font-extrabold lowercase"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Chatovať s ai
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-[#11EDE2] text-[#11EDE2] hover:bg-[#11EDE2]/10 text-lg px-8 font-extrabold lowercase"
            >
              Otvoriť dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#171642] border-t border-[#676789] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#11EDE2] rounded-full"></div>
            <span className="text-xl font-extrabold lowercase">zero one hundred</span>
          </div>
          <p className="text-[#CACADD]">
            Inteligentný systém zero one hundred © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-white rounded-2xl hover:shadow-xl transition-all border border-[#CACADD] hover:border-[#11EDE2] group">
      <div className="w-14 h-14 bg-[#11EDE2] rounded-full flex items-center justify-center text-[#171642] mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-extrabold mb-2 text-[#171642] lowercase">{title}</h3>
      <p className="text-[#676789]">{description}</p>
    </div>
  );
}

function RequestTypeCard({ title }: { title: string }) {
  return (
    <div className="p-6 bg-white rounded-xl border-2 border-[#CACADD] hover:border-[#11EDE2] transition-all hover:shadow-lg group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#11EDE2]/10 rounded-full flex items-center justify-center group-hover:bg-[#11EDE2] transition-colors">
          <CheckCircle2 className="w-6 h-6 text-[#11EDE2] group-hover:text-[#171642]" />
        </div>
        <h3 className="text-lg font-extrabold text-[#171642] lowercase">{title}</h3>
      </div>
    </div>
  );
}