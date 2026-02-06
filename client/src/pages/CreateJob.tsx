import { useState } from "react";
import { useCreateJob } from "@/hooks/use-jobs";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function CreateJob() {
  const { user } = useAuth();
  const createJob = useCreateJob();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    type: "" as "full-time" | "part-time" | "contract" | "internship" | "apprenticeship" | "",
    skills: "",
    salaryRange: "",
  });

  // Redirect if not employer/ngo
  if (user && user.role === "student") {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-4">Only employers and NGOs can post jobs.</p>
        <Link href="/jobs">
          <Button>Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type) {
      toast({ title: "Error", description: "Please select a job type", variant: "destructive" });
      return;
    }

    const skillsArray = formData.skills
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    createJob.mutate(
      {
        title: formData.title,
        description: formData.description,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        skills: skillsArray.length > 0 ? skillsArray : null,
        salaryRange: formData.salaryRange || null,
      },
      {
        onSuccess: () => {
          setLocation("/jobs");
        },
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/jobs" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
      </Link>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-display font-bold mb-2">Post a Job</h1>
        <p className="text-muted-foreground mb-8">Fill out the form below to post a new job listing.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Software Engineer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                placeholder="Company name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and requirements..."
              className="min-h-[150px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., New York, NY"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as typeof formData.type })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="apprenticeship">Apprenticeship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="skills">Required Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., JavaScript, React, Node.js"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Separate skills with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryRange">Salary Range</Label>
              <Input
                id="salaryRange"
                placeholder="e.g., $50,000 - $70,000"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              size="lg"
              className="flex-1 rounded-xl"
              disabled={createJob.isPending}
            >
              {createJob.isPending ? "Posting..." : "Post Job"}
            </Button>
            <Link href="/jobs">
              <Button type="button" variant="outline" size="lg" className="rounded-xl">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

