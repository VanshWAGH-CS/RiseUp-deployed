import { useApplications } from "@/hooks/use-applications";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Building, MapPin, Calendar, ExternalLink, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AppliedJobs() {
    const { user } = useAuth();
    const { data: applications, isLoading } = useApplications();

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading your applications...</div>;

    if (!user) return null;

    return (
        <div className="space-y-10 pb-12">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2rem] bg-[#0f172a] p-8 md:p-12 lg:p-16 text-white shadow-2xl mb-12">
                <div className="absolute inset-0 opacity-40">
                    <img src="https://images.unsplash.com/photo-1507679799987-c73774586594?auto=format&fit=crop&w=1200&q=80" alt="Applied Jobs Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">Your Journey</h1>
                    <p className="text-xl text-slate-300 max-w-2xl font-medium">Track your applications, interview statuses, and career progress in real-time.</p>
                </div>
            </div>

            {!applications || applications.length === 0 ? (
                <Card className="rounded-3xl border-dashed border-2 py-20 bg-muted/20">
                    <CardContent className="text-center">
                        <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-2xl font-bold mb-2">No applications yet</h3>
                        <p className="text-muted-foreground mb-8">Start your journey today by applying to jobs that match your skills.</p>
                        <Link href="/jobs">
                            <Button size="lg" className="rounded-full px-8">Browse All Jobs</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {applications.map((app) => (
                        <Card key={app.id} className="rounded-3xl border-border/50 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col divide-y divide-border/50">
                                    <div className="flex-1 p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{app.job?.title}</h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-medium">
                                                    <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {app.job?.company}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-medium mt-1">
                                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {app.job?.location}</span>
                                                </div>
                                            </div>
                                            <Badge variant={
                                                app.status === "Accepted" ? "default" :
                                                    app.status === "Rejected" ? "destructive" :
                                                        app.status === "Under Review" ? "secondary" : "outline"
                                            } className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                {app.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-widest bg-muted/50 w-fit px-3 py-1 rounded-md">
                                            <Calendar className="w-3 h-3" />
                                            {app.createdAt ? format(new Date(app.createdAt), "PPP") : "N/A"}
                                        </div>
                                    </div>

                                    <div className="p-6 flex items-center justify-center bg-muted/30">
                                        <Link href={`/jobs/${app.jobId}`}>
                                            <Button variant="ghost" className="w-full gap-2 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                View Opportunity <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
