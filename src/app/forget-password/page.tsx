"use client";
import EcButton from "@/components/EcButton/EcButton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useForgetPasswordMutation } from "@/redux/features/auth/authApi";
import { TErrorResponse } from "@/types/response";
import { ArrowLeft, Fingerprint, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import logo from "../../../public/logo.png";

const ForgetPasswordPage = () => {
  const [forgetPassword, { isLoading }] = useForgetPasswordMutation();
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      const res = await forgetPassword({ email: data.email.trim() }).unwrap();
      if (res.success) {
        toast({
          className: "bg-success text-success-foreground border-none",
          title: "OTP Sent!",
          description: res.message || "An OTP has been sent to your email.",
        });
        router.push(`/reset-password?email=${data.email.trim()}`);
      }
    } catch (error) {
      const err = (error as { data: TErrorResponse }).data;
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: err?.message || "Something went wrong.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl border border-slate-100 px-6 sm:px-8 py-8 sm:py-10">
        <div className="text-center mb-6 space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-black px-4 py-2 rounded-xl shadow-xs inline-flex items-center">
              <Image
                src={logo}
                alt="TechMela Logo"
                width={160}
                height={40}
                className="w-36 h-auto object-contain"
                priority
              />
            </div>
          </div>

          <div className="flex justify-center mb-2 text-primary">
            <Fingerprint size={48} />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Forgot Password?
          </h1>
          <p className="text-slate-500 text-sm">
            Enter your email address and we&apos;ll send you an OTP to reset
            your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="email"
            >
              Email Address
            </label>
            <Input
              className={`h-9 border-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.email ? "border-destructive" : ""}`}
              placeholder="Enter your registered email"
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
              required
            />
          </div>

          <div className="pt-2">
            <EcButton
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-lg transition-all shadow-md active:scale-[0.98] border-none"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Send OTP"
              )}
            </EcButton>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm font-semibold text-slate-500 hover:text-primary transition-all flex items-center justify-center gap-2 w-full"
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
