import { useJobs } from "@/hooks/use-jobs";
import { useAuth } from "@/hooks/use-auth";
import { useApplications } from "@/hooks/use-applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Briefcase, DollarSign, Building, Plus, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function Jobs() {
  const [search, setSearch] = useState("");
  const { data: jobs, isLoading } = useJobs({ search });
  const { user } = useAuth();
  const { data: applications } = useApplications();
  const isEmployerOrNGO = user?.role === "employer" || user?.role === "ngo";

  const appliedJobIds = new Set(applications?.map((app: any) => app.jobId));

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#0f172a] p-8 md:p-12 lg:p-14 text-white shadow-2xl mb-12">
        <div className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">Job Board</h1>
            <p className="text-xl text-slate-300 max-w-2xl">Discover opportunities that align with your skills and passion.</p>
          </div>
          {isEmployerOrNGO && (
            <Link href="/jobs/create">
              <Button className="rounded-full px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Post a Job
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by job title, skill, or company..."
            className="pl-12 h-14 text-base rounded-2xl border-border/50 focus:ring-primary/20 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 px-8 rounded-2xl hidden sm:flex border-border/50">Filter</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs?.map((job) => (
            <div key={job.id} className="group bg-card border border-border/50 rounded-3xl p-8 transition-all hover:shadow-xl hover:border-primary/20 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between overflow-hidden relative">
              {appliedJobIds.has(job.id) && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground px-4 py-1 text-[10px] font-bold uppercase rounded-bl-xl flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" /> Applied
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between md:justify-start gap-4">
                  <h3 className="text-2xl font-bold font-display group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <Badge variant="secondary" className="capitalize px-3 py-1 bg-primary/10 text-primary border-none">
                    {job.type}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary/60" /> {job.company}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary/60" /> {job.location}
                  </div>
                  {job.salaryRange && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary/60" /> {job.salaryRange}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {job.skills?.slice(0, 5).map(skill => (
                    <span key={skill} className="px-3 py-1 bg-muted/50 rounded-full text-xs font-semibold text-muted-foreground border border-border/50">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Link href={`/jobs/${job.id}`}>
                  <Button className="w-full md:w-40 h-12 rounded-2xl shadow-lg shadow-primary/10" variant={appliedJobIds.has(job.id) ? "outline" : "default"}>
                    {appliedJobIds.has(job.id) ? "View Application" : "View Details"}
                  </Button>
                </Link>
              </div>
            </div>
          ))}

          {jobs?.length === 0 && (
            <div className="text-center py-24 bg-muted/10 rounded-[3rem] border-2 border-dashed border-border/50">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-2xl font-bold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">Adjust your search or check back later for new opportunities.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
