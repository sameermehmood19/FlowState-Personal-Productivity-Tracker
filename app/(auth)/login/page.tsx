"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import bgImage from "../bg01.jpeg";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Login Background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md p-4 animate-scale-in">
        <div className="glass-panel auth-card rounded-[2rem] w-full relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-3.5xl font-bold text-white mb-2 tracking-wide">
                Log In
              </h1>

              <p className="text-white/80 text-sm">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#60a5fa] hover:text-blue-300 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-white/90 mb-1 pl-3"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="input glass-input w-full text-base font-normal tracking-wide focus:outline-none pl-3"
                />
                {errors.email && (
                  <p className="text-red-300 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-white/90 mb-1 pl-3"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password")}
                    className="input glass-input w-full text-base font-normal tracking-wide focus:outline-none pr-10 pl-3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-300 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4C82FB] hover:bg-[#356DF5] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            <div className="mt-8 relative flex items-center justify-center">
              <div className="border-t border-white/20 w-full absolute" />
              <span className="px-4 text-white/70 text-sm font-normal relative z-10" style={{ backgroundColor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', borderRadius: '9999px' }}>
                or log in with
              </span>
            </div>

            <div className="mt-6 flex justify-center gap-6">
              {/* Facebook Button */}
              <button
                type="button"
                className="w-11 h-11 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:bg-[#166FE5] transition-all transform hover:scale-105 shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              {/* Google Button */}
              <button
                type="button"
                className="w-11 h-11 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-all transform hover:scale-105 shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] text-white/30 tracking-wider">
                Demo: alex@flowstate.app / password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}