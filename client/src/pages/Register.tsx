import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2, ArrowRight, Github, UserPlus, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const { registerMutation, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user, setLocation]);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      email: "",
      role: "student",
    },
  });

  function onSubmit(data: z.infer<typeof registerSchema>) {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left side: Branding & Info */}
      <div className="hidden md:flex flex-col justify-between w-[40%] p-12 relative overflow-hidden bg-primary/5">
        <div className="absolute inset-0 z-0">
          <img
            src="/auth-bg.png"
            alt="RiseUp Auth Background"
            className="w-full h-full object-cover opacity-20 scale-x-[-1]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 mix-blend-overlay" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl">R</div>
            <span className="text-2xl font-display font-bold tracking-tight">RiseUp Hub</span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-5xl font-display font-bold mb-6 leading-tight text-foreground">
              Begin your <span className="gradient-text">Success</span> story today.
            </h1>

            <div className="space-y-6 mt-12">
              {[
                "Access exclusive job opportunities",
                "Professional resume builder tools",
                "Community of industry mentors",
                "Track your career progress"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 p-6 glass-panel rounded-2xl">
          <p className="italic text-muted-foreground mb-4">
            "RiseUp helped me land my dream job within 2 months of joining. The platform is truly game-changing for job seekers."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
              <img src="https://i.pravatar.cc/40?u=9" alt="testimonial" />
            </div>
            <div>
              <p className="font-bold text-sm">Sarah Jenkins</p>
              <p className="text-xs text-muted-foreground">Product Designer at TechFlow</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-[500px] space-y-8 py-8">
          <div className="text-center md:hidden mb-8">
            <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl mb-4">R</div>
            <h1 className="text-3xl font-display font-bold text-foreground">RiseUp Hub</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">Create an account</h2>
            <p className="text-muted-foreground text-lg">
              Start your journey with RiseUp ecosystem
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="h-12 bg-muted/30 border-none focus-visible:ring-primary/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} className="h-12 bg-muted/30 border-none focus-visible:ring-primary/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} className="h-12 bg-muted/30 border-none focus-visible:ring-primary/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Account Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-muted/30 border-none focus:ring-primary/30">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student / Job Seeker</SelectItem>
                        <SelectItem value="employer">Employer / Company</SelectItem>
                        <SelectItem value="ngo">NGO / Organization</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="h-12 bg-muted/30 border-none focus-visible:ring-primary/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="h-12 bg-muted/30 border-none focus-visible:ring-primary/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" id="terms" className="rounded border-muted-foreground/30 accent-primary" required />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the <button type="button" className="text-primary hover:underline">Terms of Service</button> and <button type="button" className="text-primary hover:underline">Privacy Policy</button>
                </label>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all shadow-md group" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <UserPlus className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
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
              <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" className="h-11 border-muted hover:bg-muted/50 transition-colors" type="button">
              <Github className="mr-2 h-4 w-4" />
              Sign up with Github
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground pt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
