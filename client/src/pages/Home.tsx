import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Search, MapPin, Calendar, Clock, Trophy, Globe, Zap, Settings, HelpCircle, ChevronRight, Trash2, Moon, Sun, Monitor, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AiCoachDemo } from "@/components/AiCoachDemo";
import { cn } from "@/lib/utils";
import { useChatHistory } from "@/hooks/use-chat-history";
import { Link } from "wouter";
import { useTheme } from "@/hooks/use-theme";

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const { history, activeId, setActiveId, deleteConversation } = useChatHistory();
  const { theme, setTheme } = useTheme();
  const [userProfile] = useState<any>(() => {
    const saved = localStorage.getItem("user_profile");
    return saved ? JSON.parse(saved) : null;
  });

  const handleNewChat = () => {
    setActiveId(null);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">

      {/* Sidebar - Inspired by current industry leaders (ChatGPT/Claude/Screenshot) */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 hidden md:flex transition-colors">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-6 px-2">
            <span className="text-xl">🎾</span>
            <span className="font-display font-bold text-lg text-foreground">
              Chat<span className="text-primary">Padel</span>.AI
            </span>
          </div>

          <Button
            className="w-full bg-muted hover:bg-muted/80 text-foreground border border-border justify-start gap-3 h-11 px-4 shadow-sm group"
            onClick={handleNewChat}
          >
            <Plus className="w-4 h-4 text-primary group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-medium">New Chat</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center opacity-50">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">No conversations</h4>
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                Your tactical chats will appear here
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {history.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
                    activeId === conv.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  onClick={() => setActiveId(conv.id)}
                >
                  <MessageSquare className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    activeId === conv.id ? "text-primary" : "text-muted-foreground/50"
                  )} />
                  <span className="text-xs font-medium truncate flex-1 pr-6">{conv.title}</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-all z-10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="p-4 border-t border-border space-y-4 bg-card">
          <div className="px-3 flex flex-col gap-3">
            <Link href="/matches" className="flex items-center gap-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer group">
              <Zap className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Match Discovery</span>
            </Link>
            {userProfile?.isAdmin && (
              <Link href="/admin" className="flex items-center gap-3 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer group">
                <Settings className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                <span className="font-bold tracking-tight">Admin Dashboard</span>
              </Link>
            )}
          </div>

          <div className="flex items-center justify-around p-1 bg-muted/50 rounded-xl border border-border">
            {[
              { id: 'light', icon: <Sun className="w-4 h-4" /> },
              { id: 'dark', icon: <Moon className="w-4 h-4" /> },
              { id: 'system', icon: <Monitor className="w-4 h-4" /> }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  theme === t.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.icon}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background transition-colors duration-300">
        {/* Header (Top Nav) */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-md z-20 transition-colors">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="md:hidden h-8 w-8 text-muted-foreground mr-1">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-card border-r border-border flex flex-col h-full">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2 mb-6 px-2">
                    <span className="text-xl">🎾</span>
                    <span className="font-display font-bold text-lg text-foreground">
                      Chat<span className="text-primary">Padel</span>.AI
                    </span>
                  </div>
                  <Button
                    className="w-full bg-muted hover:bg-muted/80 text-foreground border border-border justify-start gap-3 h-11 px-4 shadow-sm group"
                    onClick={handleNewChat}
                  >
                    <Plus className="w-4 h-4 text-primary group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-medium">New Chat</span>
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center opacity-50">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <MessageSquare className="w-5 h-5 text-muted-foreground/50" />
                      </div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">No conversations</h4>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {history.map((conv) => (
                        <div
                          key={conv.id}
                          className={cn(
                            "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
                            activeId === conv.id
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          )}
                          onClick={() => setActiveId(conv.id)}
                        >
                          <MessageSquare className={cn(
                            "w-4 h-4 shrink-0 transition-colors",
                            activeId === conv.id ? "text-primary" : "text-muted-foreground/50"
                          )} />
                          <span className="text-xs font-medium truncate flex-1 pr-6">{conv.title}</span>
                        </div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
                <div className="p-4 border-t border-border space-y-4 bg-card">
                  <div className="px-3 flex flex-col gap-3">
                    <Link href="/matches" className="flex items-center gap-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer group">
                      <Zap className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="font-semibold">Match Discovery</span>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2 md:hidden">
              <span className="text-xl">🎾</span>
              <span className="font-display font-bold text-foreground">ChatPadel.AI</span>
            </div>
          </div>
          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center h-8 px-3 rounded-full bg-muted border border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Elite Assistant</span>
            </div>
            <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground h-8 w-8 hover:bg-muted">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 relative flex flex-col items-center">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="w-full max-w-5xl h-full flex flex-col relative z-10 px-4 md:px-0">
            <AiCoachDemo activeConversationId={activeId} onConversationChange={setActiveId} />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      className="p-8 rounded-2xl bg-card border border-white/5 hover:border-primary/20 hover:bg-white/5 transition-all duration-300 group"
    >
      <div className="mb-6 p-4 rounded-xl bg-background border border-white/5 w-fit group-hover:scale-110 transition-transform duration-300 shadow-lg">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
