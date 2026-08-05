"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import * as React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import { loginAction } from "@/features/auth/actions";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    const result = await loginAction(values);
    if (result?.error) {
      toast.error(result.error);
    }
  }

  return (
    <Card className="border-white/10 shadow-2xl overflow-hidden relative bg-slate-900/80 backdrop-blur-md text-white max-h-[92svh] overflow-y-auto rounded-2xl flex flex-col">
      {/* Background Academic Pattern Watermark */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

      <CardHeader className="space-y-3 pb-3 pt-5 text-center relative z-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg p-1 border border-amber-500/20">
          <img src="/logo.png" alt="Malla Reddy University" className="h-full w-full object-contain" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight text-white">Malla Reddy University</CardTitle>
          <p className="text-[10px] font-bold text-[#F47C20] tracking-widest uppercase">Digital Campus Management System</p>
        </div>
      </CardHeader>

      <CardContent className="pb-5 pt-1 relative z-10 flex-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-gray-300 text-xs">Roll Number / Employee ID</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Enter your Roll Number or Employee ID"
                        autoComplete="username"
                        className="pl-10 bg-slate-800/80 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-[#F47C20]/50 focus:ring-1 focus:ring-[#F47C20]/50 h-9 text-xs transition-colors"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-gray-300 text-xs">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="pl-10 pr-10 bg-slate-800/80 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:border-[#F47C20]/50 focus:ring-1 focus:ring-[#F47C20]/50 h-9 text-xs transition-colors"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-white focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full rounded-xl bg-[#F47C20] hover:bg-[#d96614] text-white font-bold transition-all duration-200 mt-2 h-9 text-xs shadow-lg shadow-orange-500/10"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </Form>

        <div className="mt-3 text-center flex justify-between items-center text-[11px] px-1">
          <Link href="/forgot-password" className="font-medium text-gray-400 hover:text-[#F47C20] hover:underline">
            Forgot Password?
          </Link>
          <Link href="/" className="text-gray-400 hover:text-[#F47C20] font-medium hover:underline flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to Portal
          </Link>
        </div>

        <div className="mt-5 pt-4 border-t border-white/5 text-center space-y-2">
          <p className="text-[10px] text-gray-400 leading-normal">
            Need help accessing your account? Contact the System Administrator.
          </p>
          <div className="flex justify-between items-center text-[9px] text-gray-500 px-1 pt-1 font-semibold">
            <span>Academix v1.0</span>
            <span>© 2026 Academix</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
