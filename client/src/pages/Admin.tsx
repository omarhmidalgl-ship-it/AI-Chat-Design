import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, Mail, Phone, Globe, Calendar, CheckCircle, Search, Settings, LayoutDashboard, MessageSquare, Menu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { AdminLogin } from "@/components/AdminLogin";

interface User {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    country: string;
    age: number;
    createdAt: string;
}

interface MatchJoin {
    id: number;
    location: string;
    date: string;
    time: string;
    level: string;
    user: User | null;
}

interface WaitlistEntry {
    id: number;
    email: string;
    createdAt: string;
}

export default function Admin() {
    const { theme } = useTheme();
    const [users, setUsers] = useState<User[]>([]);
    const [joins, setJoins] = useState<MatchJoin[]>([]);
    const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [adminUser, setAdminUser] = useState<any>(null);

    // Immediate check on mount
    useEffect(() => {
        const checkAdmin = () => {
            const savedUser = localStorage.getItem("user_profile");
            if (!savedUser) {
                setLoading(false);
                return;
            }

            const parsedUser = JSON.parse(savedUser);
            if (!parsedUser.isAdmin) {
                setLoading(false);
                return;
            }
            setAdminUser(parsedUser);
            fetchData(parsedUser);
        };

        checkAdmin();
        const interval = setInterval(() => {
            const savedUser = localStorage.getItem("user_profile");
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                if (parsedUser.isAdmin) fetchData(parsedUser);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async (currentUser: any) => {
        try {
            const fetchOptions = {
                headers: {
                    "x-user-email": currentUser.email
                }
            };

            const [usersRes, joinsRes, waitlistRes] = await Promise.all([
                fetch("/api/admin/users", fetchOptions),
                fetch("/api/admin/user-matches", fetchOptions),
                fetch("/api/admin/waitlist", fetchOptions)
            ]);

            if (!usersRes.ok || !joinsRes.ok || !waitlistRes.ok) {
                throw new Error("Failed to fetch admin data");
            }

            const usersData = await usersRes.json();
            const joinsData = await joinsRes.json();
            const waitlistData = await waitlistRes.json();
            setUsers(usersData);
            setJoins(joinsData);
            setWaitlist(waitlistData);
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredWaitlist = waitlist.filter(w =>
        w.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Show login screen if not authenticated
    if (!adminUser) {
        return <AdminLogin onSuccess={(user) => setAdminUser(user)} />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl hidden md:flex flex-col p-6">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-black text-xl">
                        C
                    </div>
                    <span className="font-display font-bold text-lg tracking-tight">AdminPanel</span>
                </div>

                <nav className="space-y-2 flex-1">
                    {[
                        { icon: LayoutDashboard, label: "Dashboard", active: true },
                        { icon: Users, label: "Users" },
                        { icon: Trophy, label: "Matches" },
                        { icon: MessageSquare, label: "Messages" },
                        { icon: Settings, label: "Settings" },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                item.active
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="pt-6 border-t border-border">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                                {adminUser?.fullName?.charAt(0) || "AD"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{adminUser?.fullName || "Administrator"}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{adminUser?.email || "admin@chatpadel.ai"}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10 text-glow">
                    <div className="flex items-center gap-3">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button size="icon" variant="ghost" className="md:hidden h-10 w-10 text-muted-foreground mr-1">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72 bg-card border-r border-border flex flex-col h-full">
                                <div className="p-6 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-black text-xl">
                                            C
                                        </div>
                                        <span className="font-display font-bold text-lg tracking-tight">AdminPanel</span>
                                    </div>
                                </div>
                                <nav className="p-4 space-y-2 flex-1">
                                    {[
                                        { icon: LayoutDashboard, label: "Dashboard", active: true },
                                        { icon: Users, label: "Users" },
                                        { icon: Trophy, label: "Matches" },
                                        { icon: MessageSquare, label: "Messages" },
                                        { icon: Settings, label: "Settings" },
                                    ].map((item, i) => (
                                        <button
                                            key={i}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                                item.active
                                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.label}
                                        </button>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Padel Operations</h1>
                            <p className="text-sm text-muted-foreground mt-1">Monitor registrations and bridge the gap for our players.</p>
                        </div>
                    </div>


                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-10 w-full sm:w-64 bg-card/50 border-border rounded-xl focus:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => fetchData(adminUser)} variant="outline" className="rounded-xl border-border px-4 h-11">
                            Refresh
                        </Button>
                    </div>

                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">

                    {[
                        { label: "Account Registrations", value: users.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: "Waitlist Entries", value: waitlist.length, icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10" },
                        { label: "Active Sessions", value: joins.length, icon: Trophy, color: "text-green-500", bg: "bg-green-500/10" },
                        { label: "Success Rate", value: "94%", icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" },
                    ].map((stat, i) => (
                        <Card key={i} className="p-6 bg-card/40 border-border backdrop-blur-xl relative overflow-hidden group hover:border-primary/30 transition-all">
                            <div className={cn("absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 -mr-12 -mt-12", stat.bg)} />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", stat.bg)}>
                                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <Tabs defaultValue="registrations" className="w-full">
                    <TabsList className="bg-muted/50 p-1 mb-6 rounded-xl border border-border flex w-full md:w-fit overflow-x-auto no-scrollbar">
                        <TabsTrigger value="registrations" className="flex-1 md:flex-none rounded-lg px-4 md:px-6 font-bold flex gap-2 items-center text-xs md:text-sm whitespace-nowrap">
                            <Users className="w-4 h-4" />
                            Accounts
                        </TabsTrigger>
                        <TabsTrigger value="waitlist" className="flex-1 md:flex-none rounded-lg px-4 md:px-6 font-bold flex gap-2 items-center text-xs md:text-sm whitespace-nowrap">
                            <Calendar className="w-4 h-4" />
                            Waitlist
                        </TabsTrigger>
                        <TabsTrigger value="joins" className="flex-1 md:flex-none rounded-lg px-4 md:px-6 font-bold flex gap-2 items-center text-xs md:text-sm whitespace-nowrap">
                            <Trophy className="w-4 h-4" />
                            Joins
                        </TabsTrigger>
                    </TabsList>


                    <TabsContent value="registrations">
                        <Card className="bg-card/40 border-border backdrop-blur-md overflow-hidden rounded-2xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30 font-display">
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Age/Level</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {loading ? (
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i} className="animate-pulse h-16"><td colSpan={4} className="p-4 bg-muted/5" /></tr>
                                            ))
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                                {user.fullName?.charAt(0) || "U"}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm">{user.fullName}</p>
                                                                <p className="text-[10px] text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 space-y-1">
                                                        <div className="flex items-center gap-2 text-[12px] text-foreground/80">
                                                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                                            {user.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[12px] text-foreground/80">
                                                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                                            {user.phoneNumber}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 space-y-1">
                                                        <div className="flex items-center gap-2 text-[12px] text-foreground/80">
                                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                            {user.age} Years
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[12px] text-foreground/80">
                                                            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                                                            {user.country}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <Button size="sm" variant="outline" className="rounded-lg text-xs font-bold h-8">
                                                            Message
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="waitlist">
                        <Card className="bg-card/40 border-border backdrop-blur-md overflow-hidden rounded-2xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30 font-display">
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Registered At</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {loading ? (
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i} className="animate-pulse h-16"><td colSpan={3} className="p-4 bg-muted/5" /></tr>
                                            ))
                                        ) : filteredWaitlist.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="py-20 text-center text-muted-foreground">
                                                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                                    <p className="font-medium">No waitlist entries found</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredWaitlist.map((entry) => (
                                                <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-4 font-medium text-sm">{entry.email}</td>
                                                    <td className="p-4 text-xs text-muted-foreground">
                                                        {new Date(entry.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase border border-amber-500/20">
                                                            Pending
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="joins">
                        <Card className="bg-card/40 border-border backdrop-blur-md p-6 rounded-2xl border">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {joins.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-muted-foreground">
                                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                        <p className="font-medium">No session joins yet</p>
                                    </div>
                                ) : (
                                    joins.map((join, i) => (
                                        <Card key={i} className="bg-muted/20 border-border hover:border-primary/30 transition-all p-5 relative overflow-hidden group border">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8" />
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Session</span>
                                                    <h4 className="font-bold text-foreground text-sm leading-tight">{join.location}</h4>
                                                </div>
                                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase border border-primary/20">
                                                    {join.level}
                                                </span>
                                            </div>
                                            <div className="space-y-2 mb-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {join.date} at {join.time}</div>
                                            </div>
                                            <div className="pt-4 border-t border-border flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                                                    {join.user?.fullName?.charAt(0) || "?"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate">{join.user?.fullName || "Guest Account"}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{join.user?.email || "No email"}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
