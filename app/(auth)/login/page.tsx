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
      <div className="relative z-10 w-full max-w-md p-4">
        <div className="glass-panel rounded-[2rem] p-10 w-full animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white tracking-wide mb-2">
                Log In
              </h1>

              <p className="text-white/70 text-sm">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
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
                  className="block text-xs font-semibold text-white/80 mb-1 tracking-wider uppercase"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="alex@example.com"
                  {...register("email")}
                  className="input glass-input w-full"
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
                  className="block text-xs font-semibold text-white/80 mb-1 tracking-wider uppercase"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="input glass-input w-full pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
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
                className="w-full bg-[#5C85FF] hover:bg-[#4A72E8] text-white font-semibold py-3.5 rounded-lg shadow-[0_4px_14px_0_rgba(92,133,255,0.39)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
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

              <span className="px-3 text-white/60 text-xs font-medium relative z-10">
                or log in with
              </span>
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg"
              >
                F
              </button>

              <button
                type="button"
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors shadow-lg"
              >
                G
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] text-white/50">
                Demo: alex@flowstate.app / password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}