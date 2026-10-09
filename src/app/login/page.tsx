"use client";
import EcButton from "@/components/EcButton/EcButton";
import config from "@/config/config";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { setUser } from "@/redux/features/auth/authSlice";
import { TUser } from "@/redux/features/auth/interface";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { TErrorMessages, TErrorResponse } from "@/types/response";
import decodeJWT from "@/utilities/decodeJWT";
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import logo from "../../../public/logo.png";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

const securityTips = [
  {
    icon: Lock,
    title: "Use a strong password",
    description:
      "Combine uppercase, lowercase, numbers, and symbols. Avoid reusing passwords.",
  },
  {
    icon: Smartphone,
    title: "Never share credentials",
    description:
      "Admin access is personal. Do not share your login details with anyone.",
  },
  {
    icon: KeyRound,
    title: "Sign out on shared devices",
    description:
      "Always log out after finishing work on public or shared computers.",
  },
  {
    icon: ShieldCheck,
    title: "Watch for phishing",
    description:
      "Only sign in from trusted URLs. We will never ask for your password by email.",
  },
];

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const [login, { isLoading }] = useLoginMutation();
  const [serverMessage, setServerMessage] = useState<null | TErrorMessages[]>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Already authenticated — skip login (profile has no permission gates)
  useEffect(() => {
    if (token) {
      router.replace("/dashboard/accounts");
    }
  }, [token, router]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setServerMessage(null);
    try {
      const payload: FieldValues = {};
      for (const key in data) {
        if (key) {
          payload[key] = data[key]?.trim();
        }
      }
      const res = await login(payload).unwrap();
      const user = decodeJWT(res.data.accessToken) as TUser;
      dispatch(setUser({ user: user, token: res.data.accessToken }));
      if (typeof document !== "undefined") {
        const maxAge = Math.floor(
          Number(config.token_data.access_token_cookie_expires || 86400000) /
            1000
        );
        const domainAttr =
          config.env === "production" && config.main_domain
            ? `; domain=.${config.main_domain}`
            : "";
        document.cookie = `_app.ec.at=${res.data.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax${domainAttr}`;
      }
      toast({
        className: "bg-success text-success-foreground border-none",
        title: "Welcome Back!",
        description: res.message || "Logged in successfully.",
      });
      // Land on profile first — avoids permission redirects on other dashboard pages
      router.replace("/dashboard/accounts");
    } catch (error) {
      const err = (error as { data: TErrorResponse }).data;
      if (err?.errorMessages?.length) {
        setServerMessage(err.errorMessages);
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: err?.message || "Something went wrong.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-slate-50 text-slate-900">
      {/* Left — Security tips */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-primary px-10 xl:px-14 py-12 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
        >
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 space-y-3 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-sm ring-1 ring-white/15">
            <ShieldCheck size={14} />
            Account security
          </div>
          <h2 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight max-w-md">
            Keep your dashboard safe
          </h2>
          <p className="text-white/75 text-sm xl:text-base max-w-sm leading-relaxed">
            A few simple habits protect your admin access and customer data.
          </p>
        </div>

        <ul className="relative z-10 mt-10 space-y-4 flex-1 flex flex-col justify-center">
          {securityTips.map(({ icon: Icon, title, description }, index) => (
            <li
              key={title}
              className="group flex gap-4 rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:ring-white/20 animate-in fade-in slide-in-from-left-6 fill-mode-both"
              style={{ animationDelay: `${150 + index * 80}ms` }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary-foreground transition-transform duration-300 group-hover:scale-105">
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm xl:text-base">{title}</h3>
                <p className="mt-1 text-xs xl:text-sm text-white/70 leading-relaxed">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="relative z-10 text-xs text-white/50 mt-8">
          Secured admin access · Encrypted session
        </p>
      </aside>

      {/* Right — Sign in form */}
      <main className="flex flex-col items-center justify-center px-4 sm:px-8 py-10 sm:py-14 relative">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
        >
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/[0.04] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-secondary/[0.06] blur-3xl" />
        </div>

        {/* Mobile security strip */}
        <div className="lg:hidden w-full max-w-[420px] mb-6 rounded-xl bg-primary p-4 text-white animate-in fade-in duration-500">
          <div className="flex items-start gap-3">
            <ShieldCheck className="shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-sm">Stay secure</p>
              <p className="text-xs text-white/75 mt-1 leading-relaxed">
                Use a strong password, never share credentials, and sign out on
                shared devices.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[420px] animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="mb-6 flex justify-start">
            <div className="bg-black px-3.5 py-1.5 rounded-xl shadow-xs inline-flex items-center">
              <Image
                src={logo}
                alt="TechMela Logo"
                width={130}
                height={34}
                className="h-7 w-auto object-contain"
                priority
              />
            </div>
          </div>
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Sign in
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label
                  htmlFor="phoneEmailOrUid"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Email or Phone
                </Label>
                <Input
                  className={`h-9 border-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.phoneEmailOrUid ? "border-destructive" : ""}`}
                  placeholder="Enter your email or phone"
                  id="phoneEmailOrUid"
                  {...register("phoneEmailOrUid")}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    className={`h-9 border-border pr-10 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.password ? "border-destructive" : ""}`}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    {...register("password")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => router.push("/forget-password")}
                    className="text-xs font-semibold text-primary hover:underline transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </div>

            {serverMessage && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <div className="flex gap-2">
                  <AlertCircle
                    className="text-red-500 flex-shrink-0"
                    size={18}
                  />
                  <ul className="text-xs font-semibold text-red-600 space-y-1">
                    {serverMessage.map(({ message }) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <EcButton
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] border-none"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Log In"
              )}
            </EcButton>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
