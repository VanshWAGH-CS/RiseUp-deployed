import { useAuth } from "@/hooks/use-auth";
import { useApplications, useUpdateApplicationStatus } from "@/hooks/use-applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, User, Mail, Calendar, ExternalLink, FileText, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Applicants() {
  const { user } = useAuth();
  const { data: applications, isLoading } = useApplications();
  const updateStatusMutation = useUpdateApplicationStatus();
  const { toast } = useToast();

  if (!user || (user.role !== "employer" && user.role !== "ngo")) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground">Only employers and NGOs can view applicants.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading applications...</div>;
  }

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status }, {
      onSuccess: () => {
        toast({ title: "Status Updated", description: `Application status changed to ${status}` });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Under Review": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Applied": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#0f172a] p-8 md:p-12 lg:p-16 text-white shadow-2xl mb-10">
        <div className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">Applicant Management</h1>
          <p className="text-xl text-slate-300 max-w-2xl">Review candidates, manage application statuses, and build your dream team.</p>
        </div>
      </div>

      {!applications || applications.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 py-20 bg-muted/20">
          <CardContent className="text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No applications yet</h3>
            <p className="text-muted-foreground">Newly applied candidates will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map((app) => (
            <Card key={app.id} className="rounded-[1.5rem] border-border/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shadow-sm">
                        {app.applicant?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{app.applicant?.name || "Unknown Candidate"}</h3>
                        <p className="text-muted-foreground flex items-center gap-1 mt-1">
                          <Mail className="w-4 h-4" /> {app.applicant?.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                        <Building className="w-4 h-4" /> Opportunity
                      </h4>
                      <div>
                        <p className="font-bold text-lg">{app.job?.title}</p>
                        <p className="text-sm text-muted-foreground">{app.job?.location}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                        <Calendar className="w-4 h-4" /> Applied Date
                      </h4>
                      <p className="font-medium">{app.createdAt ? format(new Date(app.createdAt), "PPP") : "N/A"}</p>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="bg-muted/30 p-4 rounded-xl mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Statement of Interest</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{app.coverLetter}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4">
                    <Link href={`/profile/${app.applicant?.username}`}>
                      <Button variant="outline" className="rounded-full gap-2 border-primary/20 hover:bg-primary/5">
                        <User className="w-4 h-4" /> View Full Profile
                      </Button>
                    </Link>
                    <Link href={`/profile/${app.applicant?.username}`}>
                      <Button variant="outline" className="rounded-full gap-2 border-primary/20 hover:bg-primary/5">
                        <FileText className="w-4 h-4" /> Review Resume
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="bg-muted/30 lg:w-72 p-8 border-t lg:border-t-0 lg:border-l border-border/50 flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Change Status</p>
                    <Select defaultValue={app.status} onValueChange={(val) => handleStatusUpdate(app.id, val)}>
                      <SelectTrigger className="rounded-xl border-border/50 bg-white">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Accepted">Accepted</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-6 border-t border-border/50 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Direct Link</p>
                    <div className="flex items-center gap-2 text-primary font-bold text-xs truncate">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">riseup.io/u/{app.applicant?.username}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

