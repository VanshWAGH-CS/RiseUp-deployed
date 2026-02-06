import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2, ArrowRight, Github } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const { loginMutation, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user, setLocation]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof loginSchema>) {
    loginMutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left side: Branding & Image */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-primary/5">
        <div className="absolute inset-0 z-0">
          <img
            src="/auth-bg.png"
            alt="RiseUp Auth Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 mix-blend-overlay" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl">R</div>
            <span className="text-2xl font-display font-bold tracking-tight">RiseUp Hub</span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
              Empowering <span className="gradient-text">Individuals</span> through career growth.
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Join our community of professionals and take the next step in your career journey. Access job opportunities, build your resume, and connect with mentors.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-sm text-muted-foreground font-medium">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/40?u=${i}`} alt="user" />
              </div>
            ))}
          </div>
          <p>Join 2,000+ members already rising up.</p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="text-center md:hidden mb-8">
            <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl mb-4">R</div>
            <h1 className="text-3xl font-display font-bold">RiseUp Hub</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} className="h-12 bg-muted/30 border-none focus-visible:ring-primary/30 text-base" />
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
                    <FormLabel className="text-sm font-semibold">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="h-12 bg-muted/30 border-none focus-visible:ring-primary/30 text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="rounded border-muted-foreground/30 accent-primary" />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">Remember for 30 days</label>
                </div>
                <button type="button" className="text-sm text-primary font-semibold hover:underline">Forgot password?</button>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all shadow-md group" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" className="h-11 border-muted hover:bg-muted/50 transition-colors" type="button">
              <Github className="mr-2 h-4 w-4" />
              Github
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground pt-4">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
