import { useState, useRef, useEffect } from "react";
import { useAiCoach } from "@/hooks/use-ai-coach";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, User, Send, Sparkles, MapPin, Calendar, Clock, Trophy, Users, Mic, Paperclip, X, ChevronRight, Search, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { type Match, type UserProf } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { AuthDialog } from "./AuthDialog";
import { useChatHistory, type Message } from "@/hooks/use-chat-history";

interface AiCoachDemoProps {
  activeConversationId: string | null;
  onConversationChange: (id: string | null) => void;
}

export function AiCoachDemo({ activeConversationId, onConversationChange }: AiCoachDemoProps) {
  const { mutate: sendMessage, isPending } = useAiCoach();
  const { toast } = useToast();
  const { saveConversation, getConversation } = useChatHistory();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [joinedMatches, setJoinedMatches] = useState<number[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUser, setCurrentUser] = useState<UserProf | null>(() => {
    const saved = localStorage.getItem("user_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [pendingMatchJoin, setPendingMatchJoin] = useState<{ id: number; msgId: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversation when activeId changes
  useEffect(() => {
    if (activeConversationId) {
      const conv = getConversation(activeConversationId);
      if (conv) {
        setMessages(conv.messages);
      }
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Save conversation whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const newId = saveConversation(messages, activeConversationId || undefined);
      if (newId && !activeConversationId) {
        onConversationChange(newId);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleActionClick = (action: string) => {
    setInput(action);
    handleSend(action);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMicClick = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Voice Assistant Active",
        description: "I'm listening to your technical questions...",
      });
      setTimeout(() => {
        setIsRecording(false);
        const query = "Find some nearby matches for me";
        setInput(query);
        handleSend(query);
      }, 2500);
    }
  };

  const handleJoinMatch = async (matchId: number, msgId: string) => {
    if (!currentUser) {
      setPendingMatchJoin({ id: matchId, msgId });
      setIsRegistering(true);
      return;
    }

    try {
      const sessionId = currentUser.email;
      const res = await fetch("/api/matches/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, sessionId }),
      });

      if (res.ok) {
        setJoinedMatches(prev => [...prev, matchId]);
        setMessages(prev => prev.map(m => {
          if (m.id === msgId && m.matches) {
            return {
              ...m,
              matches: m.matches.map(mat =>
                mat.id === matchId
                  ? { ...mat, currentPlayers: mat.currentPlayers + 1 }
                  : mat
              )
            };
          }
          return m;
        }));
        toast({
          title: "Match Joined!",
          description: `Excellent choice, ${currentUser.fullName}! I'll see you on the court.`,
        });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to join match.", variant: "destructive" });
    }
  };

  const onRegistrationSuccess = (user: UserProf) => {
    setCurrentUser(user);
    setIsRegistering(false);
    if (pendingMatchJoin) {
      handleJoinMatch(pendingMatchJoin.id, pendingMatchJoin.msgId);
      setPendingMatchJoin(null);
    }
  };

  const handleSend = (textOverride?: string) => {
    const text = textOverride || input;
    if ((!text.trim() && !selectedImage) || isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);

    sendMessage(text || (selectedImage ? "Analyze this padel photo" : ""), {
      onSuccess: (data) => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          matches: data.matches
        }]);
      },
      onError: () => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Oops! I dropped the ball. Try asking again."
        }]);
      }
    });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {messages.length === 0 ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center -mt-10"
          >
            <h2 className="text-xl font-medium text-muted-foreground mb-12">Try one of these to get started</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
              {[
                { icon: <Search className="w-6 h-6 text-cyan-400" />, title: "Find Matches", desc: "Discover games in your area", query: "Find me some padel matches nearby" },
                { icon: <MapPin className="w-6 h-6 text-rose-500" />, title: "Nearby Matches", desc: "Find matches near you (GPS or location)", query: "What are the nearest padel clubs?" },
                { icon: <Calendar className="w-6 h-6 text-blue-400" />, title: "Weekend Games", desc: "Plan your matches ahead", query: "Are there any tournaments this weekend?" },
                { icon: <Target className="w-6 h-6 text-amber-500" />, title: "By Skill Level", desc: "Find your perfect match", query: "Find matches for intermediate level" },
              ].map((card, i) => (
                <button
                  key={i}
                  onClick={() => handleActionClick(card.query)}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-muted transition-all text-left relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-foreground mb-1">{card.title}</h4>
                    <p className="text-sm text-muted-foreground/70">{card.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors mt-1" />
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto space-y-6 md:space-y-8 p-4 md:p-10 scroll-smooth pb-32 md:pb-36"

            ref={scrollRef}
          >
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-6">
                <div className={cn(
                  "flex gap-4",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}>
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                    msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border border-border"
                  )}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className="space-y-4 max-w-[80%]">
                    <div className="rounded-2xl overflow-hidden border border-border shadow-2xl max-w-full">
                      <img src={msg.image} alt="Uploaded" className="max-h-64 md:max-h-96 w-full object-cover" />
                    </div>

                    <div className={cn(
                      "text-sm md:text-base leading-relaxed whitespace-pre-wrap",
                      msg.role === 'user' ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {msg.content}
                    </div>

                  </div>
                </div>

                {msg.matches && msg.matches.length > 0 && (
                  <div className="ml-10 md:ml-13 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">

                    {msg.matches.map((match) => (
                      <Card key={match.id} className="p-5 bg-card border-border hover:border-primary/30 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-foreground text-base leading-tight">{match.location}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                            {match.level}
                          </span>
                        </div>
                        <div className="space-y-3 mb-5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                            <Calendar className="w-3.5 h-3.5 text-primary" /> {match.date} • {match.time}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                            <Users className="w-3.5 h-3.5 text-secondary" /> {match.currentPlayers}/{match.maxPlayers} Players
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={joinedMatches.includes(match.id) ? "secondary" : "default"}
                          disabled={joinedMatches.includes(match.id) || match.currentPlayers >= match.maxPlayers}
                          onClick={() => handleJoinMatch(match.id, msg.id)}
                          className="w-full h-9 text-xs font-bold"
                        >
                          {joinedMatches.includes(match.id) ? "Successfully Joined" : "Join this Match"}
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isPending && (
              <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div className="flex gap-1.5 items-center bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm h-10">
                  <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Dashboard Input Area */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 p-3 md:p-8 bg-background/80 backdrop-blur-xl z-30 transition-colors">
        <div className="max-w-3xl mx-auto flex flex-col gap-3 md:gap-4">

          <div className="flex items-center gap-2 px-2">
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors relative group"
            >
              <Paperclip className="w-5 h-5" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Attach File</span>
            </button>
            <button
              onClick={handleMicClick}
              className={cn(
                "p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors relative group",
                isRecording && "text-primary bg-primary/10"
              )}
            >
              <Mic className="w-5 h-5" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Voice Input</span>
            </button>
          </div>

          <div className="relative group">
            {selectedImage && (
              <div className="absolute -top-24 left-4 p-2 bg-muted border border-border rounded-xl shadow-2xl animate-in zoom-in-95">
                <img src={selectedImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-background rounded-full border border-border flex items-center justify-center text-foreground"><X className="w-3 h-3" /></button>
              </div>
            )}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about padel..."
              className="w-full h-12 md:h-14 bg-card border-border focus-visible:ring-primary/20 focus:border-primary/30 text-sm md:text-base text-foreground rounded-xl md:rounded-2xl px-4 md:px-6 pr-14 md:pr-16 shadow-lg shadow-black/5"
              disabled={isPending}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={(!input.trim() && !selectedImage) || isPending}
              className="absolute right-1.5 top-1.5 h-9 w-9 md:h-10 md:w-10 bg-muted hover:bg-primary text-foreground hover:text-primary-foreground transition-all rounded-lg md:rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>


          <p className="text-[11px] text-muted-foreground/60 text-center">
            ChatPadel.AI specializes in padel-related queries. Press <span className="text-muted-foreground/80 font-mono">Enter</span> to send, <span className="text-muted-foreground/80 font-mono">Shift+Enter</span> for new line.
          </p>
        </div>
      </div>

      <AuthDialog
        open={isRegistering}
        onOpenChange={setIsRegistering}
        onSuccess={onRegistrationSuccess}
      />
    </div>
  );
}
