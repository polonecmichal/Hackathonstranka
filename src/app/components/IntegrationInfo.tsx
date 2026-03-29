import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Instagram, Facebook, MessageCircle, FileText, Zap, CheckCircle2 } from 'lucide-react';

export function IntegrationInfo() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Integrácie s populárnymi platformami</h2>
          <p className="text-xl text-gray-600">
            Seamless pripojenie na vaše existujúce nástroje a sociálne siete
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Instagram */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <Instagram className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle>Instagram</CardTitle>
                  <Badge variant="secondary" className="mt-1">Plánované</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Automatické spracovanie správ z Instagram DM. Žiadosti odoslané cez Instagram 
                sa automaticky kategorizujú a pridajú do systému.
              </p>
              <div className="space-y-2">
                <IntegrationFeature text="Webhook pre Instagram Business API" />
                <IntegrationFeature text="Automatické odpovede na správy" />
                <IntegrationFeature text="Status updates v DM" />
              </div>
            </CardContent>
          </Card>

          {/* Facebook */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Facebook className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle>Facebook Messenger</CardTitle>
                  <Badge variant="secondary" className="mt-1">Plánované</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Integrácia s Facebook Messenger pre príjem žiadostí priamo z Facebooku. 
                Automatické spracovanie a odpovede.
              </p>
              <div className="space-y-2">
                <IntegrationFeature text="Messenger webhook integration" />
                <IntegrationFeature text="Automatické parsovanie správ" />
                <IntegrationFeature text="Bot odpovede" />
              </div>
            </CardContent>
          </Card>

          {/* Discord */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle>Discord</CardTitle>
                  <Badge variant="secondary" className="mt-1">Plánované</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Discord bot s príkazmi pre odosielanie žiadostí. Notifikácie v Discord 
                kanáloch o nových a vyriešených žiadostiach.
              </p>
              <div className="space-y-2">
                <IntegrationFeature text="Slash commands pre žiadosti" />
                <IntegrationFeature text="Channel notifications" />
                <IntegrationFeature text="Status updates v Discord" />
              </div>
            </CardContent>
          </Card>

          {/* Notion */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle>Notion</CardTitle>
                  <Badge variant="secondary" className="mt-1">Plánované</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Obojsmerná synchronizácia s Notion databázou. Všetky žiadosti sa automaticky 
                exportujú do vášho Notion workspace.
              </p>
              <div className="space-y-2">
                <IntegrationFeature text="Real-time sync s Notion DB" />
                <IntegrationFeature text="Custom properties mapping" />
                <IntegrationFeature text="Automatic updates" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Benefits */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Výhody integrácií</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Automatizácia</h4>
                <p className="text-sm text-gray-600">
                  Žiadosti sa automaticky spracovávajú bez manuálneho zásahu
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Multi-kanálová podpora</h4>
                <p className="text-sm text-gray-600">
                  Prijímajte žiadosti z rôznych platforiem na jednom mieste
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Efektívnosť</h4>
                <p className="text-sm text-gray-600">
                  Rýchlejšie spracovanie a lepšia organizácia žiadostí
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Pre detailné inštrukcie k nastaveniu integrácií si pozrite{' '}
            <a href="/INTEGRATION_GUIDE.md" className="text-blue-600 hover:underline font-medium">
              Integration Guide
            </a>
          </p>
          <p className="text-sm text-gray-500">
            Poznámka: Integrácie vyžadujú konfiguráciu API kľúčov a webhookov. 
            Pre produkčné nasadenie kontaktujte technický tím.
          </p>
        </div>
      </div>
    </section>
  );
}

function IntegrationFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}
