import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Globe2, Briefcase, GraduationCap, Mic } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Empowering Youth for the Future
            </div>
            
            <h1 className="leading-tight mb-6">
              Unlock Your Potential with <span className="gradient-text">RiseUp</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
              The all-in-one platform connecting talented youth with world-class upskilling programs and dream job opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="rounded-full px-8 h-14 text-lg shadow-xl shadow-primary/20">
                  Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/jobs">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg border-2">
                  Browse Jobs
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Verified Jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Expert Mentors</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Free Learning</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Abstract visual representation instead of stock image */}
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="space-y-4 mt-8">
                <div className="p-6 bg-white dark:bg-card rounded-2xl shadow-xl border border-border/50 card-hover">
                  <Briefcase className="w-10 h-10 text-accent mb-4" />
                  <h3 className="font-bold text-lg">Job Matching</h3>
                  <p className="text-muted-foreground text-sm mt-2">Smart algorithms to find roles that fit your skills perfectly.</p>
                </div>
                <div className="p-6 bg-white dark:bg-card rounded-2xl shadow-xl border border-border/50 card-hover">
                  <Globe2 className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-bold text-lg">Global Reach</h3>
                  <p className="text-muted-foreground text-sm mt-2">Connect with employers and NGOs from around the world.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-6 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 translate-y-4">
                  <GraduationCap className="w-10 h-10 mb-4" />
                  <h3 className="font-bold text-lg">Skill Paths</h3>
                  <p className="text-primary-foreground/80 text-sm mt-2">Curated learning journeys to master in-demand skills.</p>
                </div>
                <div className="p-6 bg-white dark:bg-card rounded-2xl shadow-xl border border-border/50 card-hover translate-y-4">
                  <Mic className="w-10 h-10 text-green-500 mb-4" />
                  <h3 className="font-bold text-lg">AI Interviews</h3>
                  <p className="text-muted-foreground text-sm mt-2">Practice with our AI interviewer and get real-time feedback.</p>
                </div>
              </div>
            </div>
            
            {/* Decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
