"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
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
import { siteConfig } from "@/config/site";
import { loginAction } from "@/features/auth/actions";

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    const result = await loginAction(values);
    if (result.error) {
      toast.error(result.error);
    } else if (result.destination) {
      toast.success("Successfully logged in");
      router.push(result.destination);
    }
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl">{siteConfig.shortName} Login</CardTitle>
          <CardDescription>
            Use your Student ID or Employee ID. Accounts are created by admin —
            there is no public signup.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student / Employee ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. STU2024001"
                      autoComplete="username"
                      {...field}
                    />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full rounded-xl"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot Password?
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need access? Contact your administrator.{" "}
          <Link href="/" className="text-primary hover:underline">
            Back to website
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
