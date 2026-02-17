import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginSchema, type InsertUser, type LoginCredentials } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, Phone, Globe, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const COUNTRY_CODES: Record<string, string> = {
    "Afghanistan": "+93", "Albania": "+355", "Algeria": "+213", "Andorra": "+376", "Angola": "+244",
    "Argentina": "+54", "Armenia": "+374", "Australia": "+61", "Austria": "+43", "Azerbaijan": "+994",
    "Bahrain": "+973", "Bangladesh": "+880", "Belarus": "+375", "Belgium": "+32", "Belize": "+501",
    "Benin": "+229", "Bhutan": "+975", "Bolivia": "+591", "Bosnia": "+387", "Botswana": "+267",
    "Brazil": "+55", "Bulgaria": "+359", "Burkina Faso": "+226", "Burundi": "+257", "Cambodia": "+855",
    "Cameroon": "+237", "Canada": "+1", "Cape Verde": "+238", "Central African Republic": "+236", "Chad": "+235",
    "Chile": "+56", "China": "+86", "Colombia": "+57", "Comoros": "+269", "Congo": "+242",
    "Costa Rica": "+506", "Croatia": "+385", "Cuba": "+53", "Cyprus": "+357", "Czech Republic": "+420",
    "Denmark": "+45", "Djibouti": "+253", "Dominica": "+1", "Dominican Republic": "+1", "Ecuador": "+593",
    "Egypt": "+20", "El Salvador": "+503", "Equatorial Guinea": "+240", "Eritrea": "+291", "Estonia": "+372",
    "Ethiopia": "+251", "Fiji": "+679", "Finland": "+358", "France": "+33", "Gabon": "+241",
    "Gambia": "+220", "Georgia": "+995", "Germany": "+49", "Ghana": "+233", "Greece": "+30",
    "Grenada": "+1", "Guatemala": "+502", "Guinea": "+224", "Guinea-Bissau": "+245", "Guyana": "+592",
    "Haiti": "+509", "Honduras": "+504", "Hong Kong": "+852", "Hungary": "+36", "Iceland": "+354",
    "India": "+91", "Indonesia": "+62", "Iran": "+98", "Iraq": "+964", "Ireland": "+353",
    "Israel": "+972", "Italy": "+39", "Ivory Coast": "+225", "Jamaica": "+1", "Japan": "+81",
    "Jordan": "+962", "Kazakhstan": "+7", "Kenya": "+254", "Kiribati": "+686", "Kuwait": "+965",
    "Kyrgyzstan": "+996", "Laos": "+856", "Latvia": "+371", "Lebanon": "+961", "Lesotho": "+266",
    "Liberia": "+231", "Libya": "+218", "Liechtenstein": "+423", "Lithuania": "+370", "Luxembourg": "+352",
    "Macau": "+853", "Macedonia": "+389", "Madagascar": "+261", "Malawi": "+265", "Malaysia": "+60",
    "Maldives": "+960", "Mali": "+223", "Malta": "+356", "Mauritania": "+222", "Mauritius": "+230",
    "Mexico": "+52", "Moldova": "+373", "Monaco": "+377", "Mongolia": "+976", "Montenegro": "+382",
    "Morocco": "+212", "Mozambique": "+258", "Myanmar": "+95", "Namibia": "+264", "Nepal": "+977",
    "Netherlands": "+31", "New Zealand": "+64", "Nicaragua": "+505", "Niger": "+227", "Nigeria": "+234",
    "North Korea": "+850", "Norway": "+47", "Oman": "+968", "Pakistan": "+92", "Palestine": "+970",
    "Panama": "+507", "Papua New Guinea": "+675", "Paraguay": "+595", "Peru": "+51", "Philippines": "+63",
    "Poland": "+48", "Portugal": "+351", "Puerto Rico": "+1", "Qatar": "+974", "Romania": "+40",
    "Russia": "+7", "Rwanda": "+250", "Saint Kitts and Nevis": "+1", "Saint Lucia": "+1", "Saint Vincent": "+1",
    "Samoa": "+685", "San Marino": "+378", "Sao Tome": "+239", "Saudi Arabia": "+966", "Senegal": "+221",
    "Serbia": "+381", "Seychelles": "+248", "Sierra Leone": "+232", "Singapore": "+65", "Slovakia": "+421",
    "Slovenia": "+386", "Solomon Islands": "+677", "Somalia": "+252", "South Africa": "+27", "South Korea": "+82",
    "South Sudan": "+211", "Spain": "+34", "Sri Lanka": "+94", "Sudan": "+249", "Suriname": "+597",
    "Swaziland": "+268", "Sweden": "+46", "Switzerland": "+41", "Syria": "+963", "Taiwan": "+886",
    "Tajikistan": "+992", "Tanzania": "+255", "Thailand": "+66", "Togo": "+228", "Tonga": "+676",
    "Trinidad and Tobago": "+1", "Tunisia": "+216", "Turkey": "+90", "Turkmenistan": "+993", "Tuvalu": "+688",
    "Uganda": "+256", "Ukraine": "+380", "UAE": "+971", "UK": "+44", "USA": "+1",
    "Uruguay": "+598", "Uzbekistan": "+998", "Vanuatu": "+678", "Vatican City": "+39", "Venezuela": "+58",
    "Vietnam": "+84", "Western Sahara": "+212", "Yemen": "+967", "Zambia": "+260", "Zimbabwe": "+263",
};

interface AuthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (user: any) => void;
    lang?: 'en' | 'fr' | 'ar';
}

const translations = {
    en: {
        register: "Complete Registration",
        registerDesc: "Join the community by creating a professional profile.",
        login: "Welcome Back",
        loginDesc: "Sign in to access your matches and profile.",
        fullName: "Full Name",
        email: "Email",
        age: "Age",
        password: "Password",
        country: "Country",
        phone: "Phone",
        submitRegister: "Register & Join",
        submitLogin: "Sign In",
        selectCountry: "Select country",
        success: "Success!",
        welcome: "Welcome",
        welcomeBack: "Welcome back",
        error: "Error",
        noAccount: "Don't have an account?",
        hasAccount: "Already have an account?",
        signUp: "Sign up",
        signIn: "Sign in",
    },
    fr: {
        register: "Compléter l'inscription",
        registerDesc: "Rejoignez la communauté en créant un profil professionnel.",
        login: "Bon retour",
        loginDesc: "Connectez-vous pour accéder à vos matchs et profil.",
        fullName: "Nom complet",
        email: "E-mail",
        age: "Âge",
        password: "Mot de passe",
        country: "Pays",
        phone: "Téléphone",
        submitRegister: "S'inscrire et rejoindre",
        submitLogin: "Se connecter",
        selectCountry: "Sélectionnez un pays",
        success: "Succès !",
        welcome: "Bienvenue",
        welcomeBack: "Bon retour",
        error: "Erreur",
        noAccount: "Pas encore de compte ?",
        hasAccount: "Déjà un compte ?",
        signUp: "S'inscrire",
        signIn: "Se connecter",
    },
    ar: {
        register: "إكمال التسجيل",
        registerDesc: "انضم إلى المجتمع من خلال إنشاء ملف تعريف احترافي.",
        login: "مرحباً بعودتك",
        loginDesc: "قم بتسجيل الدخول للوصول إلى مبارياتك وملفك الشخصي.",
        fullName: "الاسم الكامل",
        email: "البريد الإلكتروني",
        age: "العمر",
        password: "كلمة المرور",
        country: "البلد",
        phone: "الهاتف",
        submitRegister: "سجل وانضم",
        submitLogin: "تسجيل الدخول",
        selectCountry: "اختر البلد",
        success: "نجاح!",
        welcome: "مرحباً",
        welcomeBack: "مرحباً بعودتك",
        error: "خطأ",
        noAccount: "ليس لديك حساب؟",
        hasAccount: "لديك حساب بالفعل؟",
        signUp: "إنشاء حساب",
        signIn: "تسجيل الدخول",
    }
};

export function AuthDialog({ open, onOpenChange, onSuccess, lang = 'en' }: AuthDialogProps) {
    const { toast } = useToast();
    const t = translations[lang];
    const isRtl = lang === 'ar';
    const [mode, setMode] = useState<'login' | 'register'>('login');

    const form = useForm<InsertUser | LoginCredentials>({
        resolver: zodResolver(mode === 'login' ? loginSchema : insertUserSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            age: 25,
            phoneNumber: "+216 ",
            country: "Tunisia",
        },
    });

    const selectedCountry = useWatch({
        control: form.control,
        name: "country",
    });

    useEffect(() => {
        if (selectedCountry && COUNTRY_CODES[selectedCountry]) {
            const prefix = COUNTRY_CODES[selectedCountry];
            const currentPhone = form.getValues("phoneNumber");

            if (!currentPhone || Object.values(COUNTRY_CODES).some(p => currentPhone.trim() === p)) {
                form.setValue("phoneNumber", `${prefix} `);
            }
        }
    }, [selectedCountry, form]);

    const onSubmit = async (data: InsertUser | LoginCredentials) => {
        const endpoint = mode === 'login' ? "/api/login" : "/api/register";
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Request failed");
            }

            const result = await res.json();

            localStorage.setItem("user_profile", JSON.stringify(result));
            toast({
                title: t.success,
                description: mode === 'login' ? `${t.welcomeBack}, ${result.fullName}!` : `${t.welcome}, ${result.fullName}!`,
            });
            onSuccess(result);
        } catch (err: any) {
            toast({
                title: t.error,
                description: err.message,
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                dir={isRtl ? "rtl" : "ltr"}
                className={cn(
                    "sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-white/10 text-white shadow-2xl overflow-hidden",
                    isRtl ? "font-arabic" : ""
                )}
            >
                <DialogHeader className={isRtl ? "text-right" : "text-left"}>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {mode === 'login' ? <Lock className="w-6 h-6 text-primary" /> : <User className="w-6 h-6 text-primary" />}
                        {mode === 'login' ? t.login : t.register}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {mode === 'login' ? t.loginDesc : t.registerDesc}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        {mode === 'register' && (
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5" />
                                            {t.fullName}
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} className="bg-background/50 border-white/10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        {t.email}
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john@example.com" {...field} className="bg-background/50 border-white/10" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Lock className="w-3.5 h-3.5" />
                                        {t.password}
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} className="bg-background/50 border-white/10" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {mode === 'register' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Globe className="w-3.5 h-3.5" />
                                                    {t.country}
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background/50 border-white/10">
                                                            <SelectValue placeholder={t.selectCountry} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-card border-white/10 text-white">
                                                        {Object.keys(COUNTRY_CODES).map((country) => (
                                                            <SelectItem key={country} value={country}>
                                                                {country}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {t.phone}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+216 ..." {...field} className="bg-background/50 border-white/10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {t.age}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    className="bg-background/50 border-white/10"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
                            {mode === 'login' ? t.submitLogin : t.submitRegister}
                        </Button>

                        <div className="text-center pt-2">
                            <p className="text-sm text-muted-foreground">
                                {mode === 'login' ? t.noAccount : t.hasAccount}{" "}
                                <button
                                    type="button"
                                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                    className="text-primary hover:underline font-bold"
                                >
                                    {mode === 'login' ? t.signUp : t.signIn}
                                </button>
                            </p>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
