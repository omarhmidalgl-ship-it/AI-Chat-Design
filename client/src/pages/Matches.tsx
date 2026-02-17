import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Calendar, MapPin, Globe, Moon, Sun, Languages, List, Check, Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Link } from "wouter";
import { AuthDialog } from "@/components/AuthDialog";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";

type Language = 'en' | 'fr' | 'ar';

const translations = {
    en: {
        matches: "Matches",
        signIn: "Sign In / Sign Up",
        signUp: "Sign Up",
        discover: "Discover",
        active: "Active",
        padelMatches: "Padel Matches",
        stats: "Over 150+ matches happening this week. Join the community!",
        signInToView: "Sign in to view matches",
        ctaDesc: "Create an account to see real-time match details and join the action.",
        getStarted: "Get Started Now",
        tryAiFirst: "Try ChatPadel.AI First",
        tryAiDesc: "Browse matches using our AI assistant without signing up. Limited access, no commitment required.",
        tryAiFeature1: "Conversational match search",
        tryAiFeature2: "No registration needed",
        tryAiFeature3: "Try before you commit",
        tryAiButton: "Try AI Assistant",
    },
    fr: {
        matches: "Matchs",
        signIn: "Connexion",
        signUp: "S'inscrire",
        discover: "Découvrir",
        active: "Actifs",
        padelMatches: "Matchs de Padel",
        stats: "Plus de 150 matchs cette semaine. Rejoignez la communauté !",
        signInToView: "Connectez-vous pour voir les matchs",
        ctaDesc: "Créez un compte pour voir les détails des matchs en temps réel.",
        getStarted: "Commencer maintenant",
        tryAiFirst: "Essayer ChatPadel.AI en premier",
        tryAiDesc: "Parcourez les matchs via notre assistant IA sans inscription. Accès limité, sans engagement.",
        tryAiFeature1: "Recherche de matchs conversationnelle",
        tryAiFeature2: "Aucune inscription requise",
        tryAiFeature3: "Essayez avant de vous engager",
        tryAiButton: "Essayer l'Assistant IA",
    },
    ar: {
        matches: "المباريات",
        signIn: "تسجيل الدخول / الاشتراك",
        signUp: "إنشاء حساب",
        discover: "اكتشف",
        active: "النشطة",
        padelMatches: "مباريات الباديل",
        stats: "أكثر من 150 مباراة هذا الأسبوع. انضم إلى المجتمع!",
        signInToView: "سجل دخولك لرؤية المباريات",
        ctaDesc: "أنشئ حسابًا لرؤية تفاصيل المباريات في الوقت الفعلى والانضمام إلى المرح.",
        getStarted: "ابدأ الآن",
        tryAiFirst: "جرب ChatPadel.AI أولاً",
        tryAiDesc: "تصفح المباريات باستخدام مساعدنا الذكي دون تسجيل. وصول محدود، لا يلزم الالتزام.",
        tryAiFeature1: "بحث محادثاتي عن المباريات",
        tryAiFeature2: "لا يلزم التسجيل",
        tryAiFeature3: "جرب قبل الالتزام",
        tryAiButton: "جرب مساعد الذكاء الاصطناعي",
    }
};

export default function Matches() {
    const { theme, setTheme } = useTheme();
    const [lang, setLang] = useState<Language>(() => {
        return (localStorage.getItem("preferred_lang") as Language) || 'en';
    });
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [user, setUser] = useState<any>(() => {
        const saved = localStorage.getItem("user_profile");
        return saved ? JSON.parse(saved) : null;
    });
    const [matches, setMatches] = useState<any[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [joiningId, setJoiningId] = useState<number | null>(null);

    const { toast } = useToast();
    const t = translations[lang];
    const isRtl = lang === 'ar';

    const fetchMatches = async () => {
        setLoadingMatches(true);
        try {
            const res = await fetch("/api/matches");
            if (res.ok) {
                const data = await res.json();
                setMatches(data);
            }
        } catch (err) {
            console.error("Failed to fetch matches", err);
        } finally {
            setLoadingMatches(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMatches();
        }
    }, [user]);

    const handleJoin = async (matchId: number) => {
        if (!user) {
            setIsRegistering(true);
            return;
        }

        setJoiningId(matchId);
        try {
            const res = await fetch("/api/matches/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    matchId,
                    sessionId: user.id.toString()
                })
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "You've joined the match! Check your email and phone for confirmation.",
                });
                fetchMatches(); // Refresh list to see updated player count
            } else {
                throw new Error("Failed to join");
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Could not join the match. Please try again.",
                variant: "destructive"
            });
        } finally {
            setJoiningId(null);
        }
    };

    useEffect(() => {
        localStorage.setItem("preferred_lang", lang);
        document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    }, [lang, isRtl]);

    return (
        <div className={cn(
            "min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-white transition-colors duration-300",
            isRtl ? "font-arabic" : ""
        )}>
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl z-50">
                <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button size="icon" variant="ghost" className="md:hidden h-9 w-9 text-muted-foreground mr-1">
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-card border-r border-white/10 p-6 flex flex-col gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-black text-xl">
                                        C
                                    </div>
                                    <span className="font-display font-bold text-lg tracking-tight text-foreground">ChatPadel</span>
                                </div>
                                <nav className="flex flex-col gap-4">
                                    <Link href="/matches" className="flex items-center gap-3 text-primary font-bold text-lg">
                                        <List className="w-5 h-5" />
                                        <span>{t.matches}</span>
                                    </Link>
                                    <Link href="/" className="flex items-center gap-3 text-muted-foreground hover:text-foreground font-medium text-lg transition-colors">
                                        <Sparkles className="w-5 h-5" />
                                        <span>AI Assistant</span>
                                    </Link>
                                </nav>
                                <div className="mt-auto pt-6 border-t border-white/5">
                                    <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest font-bold">Preferences</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Appearance</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                            className="h-9 w-9"
                                        >
                                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <Link href="/matches" className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-black text-xl">
                                C
                            </div>
                            <span className="font-display font-bold text-lg tracking-tight text-foreground">ChatPadel</span>
                        </Link>
                    </div>


                    <nav className="hidden md:flex items-center gap-8">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 text-primary font-semibold text-sm cursor-pointer group">
                                <List className="w-4 h-4" />
                                <span>{t.matches}</span>
                            </div>
                            <div className="h-0.5 w-full bg-primary mt-1 rounded-full" />
                        </div>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="p-2 text-muted-foreground hover:text-foreground transition-colors bg-white/5 dark:bg-white/5 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                            >
                                <Languages className="w-4 h-4" />
                                <span>{lang}</span>
                            </button>

                            <AnimatePresence>
                                {isLangOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-12 right-0 bg-card border border-white/10 rounded-xl p-1 shadow-2xl min-w-[120px] overflow-hidden"
                                    >
                                        {[
                                            { code: 'en', label: 'English' },
                                            { code: 'fr', label: 'Français' },
                                            { code: 'ar', label: 'العربية' }
                                        ].map((l) => (
                                            <button
                                                key={l.code}
                                                onClick={() => {
                                                    setLang(l.code as Language);
                                                    setIsLangOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                                                    lang === l.code ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                                )}
                                            >
                                                <span>{l.label}</span>
                                                {lang === l.code && <Check className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 text-muted-foreground hover:text-foreground transition-all active:scale-95"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />

                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-foreground">{user.fullName}</p>
                                    <p className="text-[10px] text-muted-foreground">{user.email}</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center font-bold text-primary">
                                    {user.fullName.charAt(0)}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        localStorage.removeItem("user_profile");
                                        setUser(null);
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-red-500"
                                >
                                    Log Out
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setIsRegistering(true)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 rounded-lg transition-all hover:scale-105 shadow-[0_4px_20px_-4px_rgba(34,197,94,0.4)]"
                            >
                                {t.signUp}
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6 max-w-7xl mx-auto">

                <div className="text-center mb-16 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(34,197,94,0.15)]"
                    >
                        <Trophy className="w-8 h-8 text-primary" />
                    </motion.div>

                    <motion.h1
                        key={lang}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-4xl md:text-6xl font-display font-bold mb-4 md:mb-6 tracking-tight text-foreground leading-tight"
                    >

                        {isRtl ? (
                            <>
                                {t.discover} {t.padelMatches} <span className="text-primary italic">{t.active}</span>
                            </>
                        ) : (
                            <>
                                {t.discover} <span className="text-primary italic">{t.active}</span> {t.padelMatches}
                            </>
                        )}
                    </motion.h1>

                    <motion.p
                        key={`${lang}-p`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-muted-foreground/80 max-w-2xl mx-auto font-medium"
                    >
                        {t.stats}
                    </motion.p>
                </div>

                {/* Dynamic Matches Grid */}
                <div className="relative mt-12 min-h-[500px]">
                    {user ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {loadingMatches ? (
                                [...Array(6)].map((_, i) => (
                                    <div key={i} className="h-72 rounded-3xl bg-card animate-pulse border border-white/5" />
                                ))
                            ) : (
                                matches.map((match) => (
                                    <motion.div
                                        key={match.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <Card className="group relative bg-card/40 border-white/5 backdrop-blur-xl p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] hover:border-primary/30 transition-all duration-500 overflow-hidden">

                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />

                                            <div className="relative z-10 flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform">
                                                        <MapPin className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                                                        {match.level}
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{match.location}</h3>

                                                <div className="space-y-3 mb-8">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="w-4 h-4" />
                                                        {match.date}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Users className="w-4 h-4" />
                                                        {match.currentPlayers} / {match.maxPlayers} {t.padelMatches}
                                                    </div>
                                                </div>

                                                <Button
                                                    disabled={joiningId === match.id || match.currentPlayers >= match.maxPlayers}
                                                    onClick={() => handleJoin(match.id)}
                                                    className={cn(
                                                        "mt-auto py-6 rounded-2xl font-bold text-lg transition-all",
                                                        match.currentPlayers >= match.maxPlayers
                                                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                                                            : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                                                    )}
                                                >
                                                    {joiningId === match.id ? "Joining..." : match.currentPlayers >= match.maxPlayers ? "Match Full" : "Join Now"}
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="relative rounded-3xl overflow-hidden min-h-[500px] border border-white/5 bg-card/50">
                            <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 blur-md opacity-30 select-none pointer-events-none">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i} className="p-6 bg-muted/20 border-white/10 h-64 shadow-2xl">
                                        <div className="w-full h-8 bg-white/5 rounded-md mb-4" />
                                        <div className="w-2/3 h-6 bg-white/5 rounded-md mb-2" />
                                        <div className="w-1/2 h-6 bg-white/5 rounded-md" />
                                    </Card>
                                ))}
                            </div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gradient-to-t from-background via-background/60 to-transparent p-6 text-center">
                                <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 mb-6 shadow-[0_0_50px_rgba(34,197,94,0.15)] scale-110">
                                    <Trophy className="w-10 h-10 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">{t.signInToView}</h2>
                                <p className="text-muted-foreground text-sm mb-8 font-medium max-w-md">{t.ctaDesc}</p>
                                <Button
                                    onClick={() => setIsRegistering(true)}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 py-6 rounded-xl text-lg transition-all hover:scale-105 shadow-[0_10px_30px_-10px_rgba(34,197,94,0.5)]"
                                >
                                    {t.getStarted}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Try AI First Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24 p-8 md:p-12 rounded-[2.5rem] bg-card/40 border border-white/5 backdrop-blur-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest">
                                <Sparkles className="w-3 h-3" />
                                AI-First Experience
                            </div>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
                                {t.tryAiFirst}
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                                {t.tryAiDesc}
                            </p>

                            <ul className="space-y-4">
                                {[t.tryAiFeature1, t.tryAiFeature2, t.tryAiFeature3].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="shrink-0">
                            <Link href="/">
                                <Button
                                    size="lg"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 py-8 rounded-2xl text-xl transition-all hover:scale-105 shadow-[0_10px_30px_-10px_rgba(34,197,94,0.5)] group"
                                >
                                    <Sparkles className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                                    {t.tryAiButton}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
            </main>

            {/* Shared Registration Flow */}
            <AuthDialog
                open={isRegistering}
                onOpenChange={setIsRegistering}
                onSuccess={(userData: any) => {
                    setIsRegistering(false);
                    setUser(userData);
                }}
                lang={lang}
            />
        </div>
    );
}
