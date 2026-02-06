import { useAuth } from "@/hooks/use-auth";
import { StatsCard } from "@/components/StatsCard";
import { Briefcase, GraduationCap, Mic, User, ArrowLeft, Plus, FileText } from "lucide-react";
import { useJobs } from "@/hooks/use-jobs";
import { useInterviews } from "@/hooks/use-interviews";
import { useApplications } from "@/hooks/use-applications";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: jobs } = useJobs();
  const { data: interviews } = useInterviews();
  const { data: applications } = useApplications();

  if (!user) return null;

  const isStudent = user.role === "student";

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section with Background */}
      <div className="relative overflow-hidden rounded-[2rem] bg-[#0f172a] p-8 md:p-12 lg:p-16 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-40">
          <img
            src={isStudent
              ? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
              : "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
            }
            alt="Dashboard Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 tracking-tight">
              Welcome back, <span className="text-primary-foreground">{user.name.split(' ')[0]}!</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-medium">
              {isStudent
                ? "Your career journey is looking bright. Track your applications and skills in one place."
                : "Manage your talent pipeline and find the perfect match for your organization."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {isStudent ? (
                <>
                  <Link href="/jobs">
                    <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">Explore Jobs</Button>
                  </Link>
                  <Link href="/resume-builder">
                    <Button size="lg" variant="outline" className="rounded-full px-8 border-white/20 hover:bg-white/10 text-white">Update Resume</Button>
                  </Link>
                </>
              ) : (
                <Link href="/jobs/create">
                  <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">Post a New Job</Button>
                </Link>
              )}
            </div>
          </div>

          <div className="hidden lg:block bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <User className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Profile Strength</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
            </div>
            <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {isStudent ? (
          <>
            <StatsCard title="Jobs Applied" value={applications?.length || 0} icon={<Briefcase className="text-primary w-6 h-6" />} description="Tracking your progress" className="hover:scale-105 transition-transform cursor-pointer" />
            <StatsCard title="Courses Done" value={3} icon={<GraduationCap className="text-blue-500 w-6 h-6" />} trend="+2" trendUp={true} description="Recent completions" />
            <StatsCard title="Mock Scores" value={interviews?.[0]?.score || "78"} icon={<Mic className="text-purple-500 w-6 h-6" />} trend="+12" trendUp={true} description="AI Assessment" />
            <StatsCard title="Profile Views" value={142} icon={<User className="text-emerald-500 w-6 h-6" />} trend="+15%" trendUp={true} description="In the last 7 days" />
          </>
        ) : (
          <>
            <StatsCard title="Active Jobs" value={jobs?.length || 0} icon={<Briefcase className="text-primary w-6 h-6" />} description="Currently hiring" />
            <StatsCard title="Total Applicants" value={applications?.length || 0} icon={<User className="text-blue-500 w-6 h-6" />} trend={applications && applications.length > 0 ? `+${applications.length}` : undefined} trendUp={applications && applications.length > 0} description="Candidates" />
            <StatsCard title="Interviews" value={applications?.filter((app: any) => app.status === "interviewing")?.length || 5} icon={<Mic className="text-purple-500 w-6 h-6" />} description="Scheduled this week" />
            <StatsCard title="Hires Made" value={applications?.filter((app: any) => app.status === "hired")?.length || 2} icon={<Briefcase className="text-emerald-500 w-6 h-6" />} description="Total placements" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-card rounded-[2rem] p-8 border border-border shadow-md hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold font-display">Recent {isStudent ? "Jobs" : "Applications"}</h3>
            <Link href={isStudent ? "/jobs" : "/applicants"} className="text-sm font-bold text-primary hover:underline flex items-center gap-1 group">
              View All <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {isStudent ? (
              jobs?.slice(0, 4).map(job => (
                <div key={job.id} className="group flex items-center justify-between p-5 rounded-2xl bg-muted/40 hover:bg-muted transition-all border border-transparent hover:border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center text-primary font-bold shadow-sm">
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold group-hover:text-primary transition-colors">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                    </div>
                  </div>
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="ghost" className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">Apply</Button>
                  </Link>
                </div>
              ))
            ) : (
              applications?.slice(0, 4).map(app => (
                <div key={app.id} className="group flex items-center justify-between p-5 rounded-2xl bg-muted/40 hover:bg-muted transition-all border border-transparent hover:border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                      {app.applicant?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold group-hover:text-primary transition-colors">{app.applicant?.name}</h4>
                      <p className="text-sm text-muted-foreground leading-none">{app.job?.title}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1">APPLIED {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Pending'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-full px-3">{app.status}</Badge>
                </div>
              ))
            )}
            {((isStudent && (!jobs || jobs.length === 0)) || (!isStudent && (!applications || applications.length === 0))) && (
              <div className="text-center py-16 opacity-50">
                <Briefcase className="w-12 h-12 mx-auto mb-4" />
                <p className="font-medium">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-card rounded-[2rem] p-8 border border-border shadow-md">
            <h3 className="text-2xl font-bold font-display mb-8">Quick Actions</h3>
            <div className="space-y-4">
              {isStudent ? (
                <>
                  <Link href="/interviews">
                    <div className="p-5 border border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group shadow-sm">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <Mic className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold">Practice Interview</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">Improve your communication skills with our AI mock interviewer.</p>
                    </div>
                  </Link>
                  <Link href="/resume-builder">
                    <div className="p-5 border border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group shadow-sm">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold">Build Resume</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">Create a professional PDF resume and public profile in minutes.</p>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/jobs/create">
                    <div className="p-5 border border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group shadow-sm">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Plus className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold">Post a New Job</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">Reach out to thousands of qualified candidates from NGOs and communities.</p>
                    </div>
                  </Link>
                  <Link href="/applicants">
                    <div className="p-5 border border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group shadow-sm">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold">Managed Applicants</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">Track candidate statuses and review their professional profiles.</p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
