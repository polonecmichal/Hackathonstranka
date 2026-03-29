import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  data?: any;
}

interface AIChatbotProps {
  onRequestCreated?: (requestId: string) => void;
  embedded?: boolean;
}

export function AIChatbot({ onRequestCreated, embedded = false }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Dobrý deň! Som váš AI asistent. Môžem vám pomôcť s:\n\n• Hľadaním investorov\n• Hľadaním zamestnancov\n• Speaking príležitosťami\n• Marketingovou podporou\n• Sales podporou\n• Hľadaním klientov\n\nAko vám môžem pomôcť?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState<any>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI chatbot endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-87f31c81/chatbot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            message: input,
            context: conversationContext
          })
        }
      );

      const data = await response.json();

      if (data.success && data.response) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response.message,
          sender: 'bot',
          timestamp: new Date(),
          data: data.response
        };

        setMessages(prev => [...prev, botMessage]);

        // Update context
        setConversationContext({
          ...conversationContext,
          lastRequestType: data.response.detectedType,
          lastPriority: data.response.suggestedPriority
        });

        // Show follow-up questions
        if (data.response.followUpQuestions && data.response.followUpQuestions.length > 0) {
          setTimeout(() => {
            const followUpMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: "Môžete mi odpovedať na tieto otázky?\n\n" + 
                    data.response.followUpQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n'),
              sender: 'bot',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, followUpMessage]);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Prepáčte, vyskytla sa chyba. Skúste to prosím znova.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className={`flex flex-col ${embedded ? 'h-full' : 'h-[600px]'} bg-white shadow-lg overflow-y-auto`}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Assistant</h3>
            <p className="text-sm text-white/80">Vždy tu pre vás</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {message.sender === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
              <div
                className={`flex flex-col max-w-[70%] ${
                  message.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg whitespace-pre-wrap ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
                {message.data?.suggestedActions && message.data.suggestedActions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">Navrhované akcie:</p>
                    {message.data.suggestedActions.map((action: string, idx: number) => (
                      <div key={idx} className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded">
                        • {action}
                      </div>
                    ))}
                  </div>
                )}
                <span className="text-xs text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString('sk-SK', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-700" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Napíšte vašu správu..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}