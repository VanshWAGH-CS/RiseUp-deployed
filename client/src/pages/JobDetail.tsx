import { useRoute } from "wouter";
import { useJob, useApplyJob } from "@/hooks/use-jobs";
import { useApplications } from "@/hooks/use-applications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, DollarSign, ArrowLeft, CheckCircle2, Briefcase, User, GraduationCap, Code } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const id = Number(params?.id);
  const { data: job, isLoading } = useJob(id);
  const { user } = useAuth();
  const { data: applications } = useApplications();
  const applyMutation = useApplyJob();
  const [coverLetter, setCoverLetter] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading job details...</div>;
  if (!job) return <div className="p-8 text-center text-destructive font-bold">Job not found</div>;

  const hasApplied = applications?.some((app: any) => app.jobId === job.id);
  const isEmployer = user?.role === "employer";

  const handleApply = () => {
    applyMutation.mutate(
      { jobId: job.id, data: { coverLetter } },
      { onSuccess: () => setIsOpen(false) }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <Link href="/jobs" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-4 group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Job Board
      </Link>

      <div className="bg-card border border-border/50 rounded-[2rem] overflow-hidden shadow-2xl">
        {/* Header Section */}
        <div className="bg-[#0f172a] p-8 md:p-12 text-white relative">
          <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80" alt="Job Header" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-primary text-primary-foreground border-none px-3 py-1 text-xs font-bold uppercase tracking-widest">{job.type}</Badge>
                {hasApplied && <Badge className="bg-emerald-500 text-white border-none px-3 py-1 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Applied</Badge>}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight">{job.title}</h1>

              <div className="flex flex-wrap gap-6 text-slate-300 font-medium h-4 md:h-6 items-center">
                <span className="flex items-center gap-2 border-r border-white/20 pr-6"><Building className="w-5 h-5 text-primary" /> {job.company}</span>
                <span className="flex items-center gap-2 border-r border-white/20 pr-6"><MapPin className="w-5 h-5 text-primary" /> {job.location}</span>
                {job.salaryRange && <span className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> {job.salaryRange}</span>}
              </div>
            </div>

            {!isEmployer && (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold shadow-2xl shadow-primary/20 hover:scale-105 transition-transform" disabled={hasApplied}>
                    {hasApplied ? "Application Submitted" : "Apply for this Role"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Apply for {job.title}</DialogTitle>
                    <DialogDescription className="text-base">
                      You are applying to <strong>{job.company}</strong>. Provide a brief cover letter to introduce yourself.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Cover Letter</label>
                      <Textarea
                        placeholder="Tell them why you're a great fit..."
                        className="min-h-[200px] rounded-2xl border-border/50 focus:ring-primary/20"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-4">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-full font-bold">Cancel</Button>
                    <Button onClick={handleApply} disabled={applyMutation.isPending} className="rounded-full px-8 font-bold">
                      {applyMutation.isPending ? "Sending..." : "Submit Application"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-primary rounded-full"></div>
                Job Description
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line bg-muted/20 p-8 rounded-3xl border border-border/30 italic">
                {job.description}
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-primary rounded-full"></div>
                What You'll Need
              </h3>
              <div className="flex flex-wrap gap-3">
                {job.skills?.map(skill => (
                  <Badge key={skill} variant="secondary" className="px-5 py-2 text-sm font-bold rounded-full bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-muted/30 p-8 rounded-[2rem] border border-border/50 space-y-6 sticky top-8">
              <h4 className="text-xl font-bold">Quick Overview</h4>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Applicants</p>
                    <p className="font-bold">{(job as any).applicationCount || 0} candidates</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience</p>
                    <p className="font-bold">Entry Level / Professional</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stack</p>
                    <p className="font-bold">Multi-disciplinary</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Join <strong>{job.company}</strong> in their mission to empower communities and drive growth. Apply today!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
