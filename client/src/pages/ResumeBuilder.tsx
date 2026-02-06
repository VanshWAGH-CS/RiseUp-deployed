import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, FileDown, User, GraduationCap, Briefcase, Code, ExternalLink, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ResumeBuilder() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: resume, isLoading } = useQuery({
        queryKey: ["/api/resumes/", user?.id],
        queryFn: async () => {
            const res = await fetch(`/api/resumes/${user?.id}`);
            if (!res.ok) {
                if (res.status === 404) return null;
                throw new Error("Failed to fetch resume");
            }
            return res.json();
        },
        enabled: !!user?.id,
    });

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/resumes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save resume");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Resume saved successfully!" });
            queryClient.invalidateQueries({ queryKey: ["/api/resumes/", user?.id] });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const [formData, setFormData] = useState<any>({
        personalInfo: { name: user?.name || "", email: user?.email || "", phone: "", location: "", summary: "", profileLink: "" },
        education: [],
        skills: [],
        projects: [],
        experience: [],
        certifications: []
    });

    useEffect(() => {
        if (resume) {
            setFormData(resume);
        }
    }, [resume]);

    const addItem = (section: string, template: any) => {
        setFormData((prev: any) => ({ ...prev, [section]: [...prev[section], template] }));
    };

    const removeItem = (section: string, index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: prev[section].filter((_: any, i: number) => i !== index)
        }));
    };

    const updateItem = (section: string, index: number, field: string, value: any) => {
        const updatedSection = [...formData[section]];
        updatedSection[index] = { ...updatedSection[index], [field]: value };
        setFormData((prev: any) => ({ ...prev, [section]: updatedSection }));
    };

    const handlePersonalInfoChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
    };

    const downloadPDF = async () => {
        const element = document.getElementById("resume-preview");
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${formData.personalInfo.name.replace(/ /g, "_")}_Resume.pdf`);
    };

    if (isLoading) return <div className="p-8 text-center">Loading resume builder...</div>;
    if (!user) return null;

    return (
        <div className="space-y-10 pb-12">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2rem] bg-[#0f172a] p-8 md:p-12 text-white shadow-2xl mb-12">
                <div className="absolute inset-0 opacity-40">
                    <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80" alt="Resume Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="max-w-xl">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">Professional Resume Builder</h1>
                        <p className="text-lg text-slate-300 font-medium italic">"Your resume is your first impression. Make it count."</p>
                    </div>
                    {formData?.personalInfo?.profileLink && (
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60 mb-2">Your Public Profile</p>
                            <div className="flex items-center gap-3 text-primary-foreground font-bold">
                                <ExternalLink className="w-4 h-4" />
                                <a href={`/profile/${user.username}`} target="_blank" className="hover:underline truncate max-w-[200px]">
                                    riseup.io/u/{user.username}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4">
                <Button onClick={() => saveMutation.mutate(formData)} className="gap-2 rounded-full px-6" disabled={saveMutation.isPending}>
                    <Save className="w-4 h-4" /> Save Draft
                </Button>
                <Button onClick={downloadPDF} variant="secondary" className="gap-2 rounded-full px-6">
                    <FileDown className="w-4 h-4" /> Download PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Editor Side */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Info */}
                    <Card className="rounded-[1.5rem] border-border/50 shadow-lg overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50">
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" /> Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Full Name</Label>
                                    <Input className="rounded-xl" value={formData.personalInfo.name} onChange={(e) => handlePersonalInfoChange("name", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Email</Label>
                                    <Input className="rounded-xl" value={formData.personalInfo.email} onChange={(e) => handlePersonalInfoChange("email", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Phone</Label>
                                    <Input className="rounded-xl" value={formData.personalInfo.phone} onChange={(e) => handlePersonalInfoChange("phone", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Location</Label>
                                    <Input className="rounded-xl" value={formData.personalInfo.location} onChange={(e) => handlePersonalInfoChange("location", e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Professional Summary</Label>
                                <Textarea className="rounded-xl min-h-[120px]" value={formData.personalInfo.summary} onChange={(e) => handlePersonalInfoChange("summary", e.target.value)} placeholder="Briefly describe your goals and expertise..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Portfolio Link / LinkedIn</Label>
                                <Input className="rounded-xl" value={formData.personalInfo.profileLink} onChange={(e) => handlePersonalInfoChange("profileLink", e.target.value)} placeholder="https://..." />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Education */}
                    <Card className="rounded-[1.5rem] border-border/50 shadow-lg overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> Education</CardTitle>
                            <Button size="sm" variant="outline" className="rounded-full h-8" onClick={() => addItem("education", { school: "", degree: "", field: "", startYear: "", endYear: "" })}>
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {formData.education.map((edu: any, index: number) => (
                                <div key={index} className="p-6 border border-border/50 rounded-2xl bg-muted/20 relative group">
                                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem("education", index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input className="rounded-xl" placeholder="School/University" value={edu.school} onChange={(e) => updateItem("education", index, "school", e.target.value)} />
                                        <Input className="rounded-xl" placeholder="Degree" value={edu.degree} onChange={(e) => updateItem("education", index, "degree", e.target.value)} />
                                        <Input className="rounded-xl" placeholder="Field of Study" value={edu.field} onChange={(e) => updateItem("education", index, "field", e.target.value)} />
                                        <div className="flex gap-4">
                                            <Input className="rounded-xl" placeholder="Start Year" value={edu.startYear} onChange={(e) => updateItem("education", index, "startYear", e.target.value)} />
                                            <Input className="rounded-xl" placeholder="End Year" value={edu.endYear} onChange={(e) => updateItem("education", index, "endYear", e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card className="rounded-[1.5rem] border-border/50 shadow-lg overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50">
                            <CardTitle className="flex items-center gap-2"><Code className="w-5 h-5 text-primary" /> Skills</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-4">
                                <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Skills (Comma separated)</Label>
                                <Input
                                    className="rounded-xl h-12"
                                    placeholder="React, Node.js, Python..."
                                    value={formData.skills.join(", ")}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, skills: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Experience */}
                    <Card className="rounded-[1.5rem] border-border/50 shadow-lg overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Experience</CardTitle>
                            <Button size="sm" variant="outline" className="rounded-full h-8" onClick={() => addItem("experience", { company: "", role: "", description: "", startYear: "", endYear: "" })}>
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {formData.experience.map((exp: any, index: number) => (
                                <div key={index} className="p-6 border border-border/50 rounded-2xl bg-muted/20 relative group space-y-4">
                                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem("experience", index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input className="rounded-xl" placeholder="Company" value={exp.company} onChange={(e) => updateItem("experience", index, "company", e.target.value)} />
                                        <Input className="rounded-xl" placeholder="Role" value={exp.role} onChange={(e) => updateItem("experience", index, "role", e.target.value)} />
                                        <div className="flex gap-4">
                                            <Input className="rounded-xl" placeholder="Start Year" value={exp.startYear} onChange={(e) => updateItem("experience", index, "startYear", e.target.value)} />
                                            <Input className="rounded-xl" placeholder="End Year" value={exp.endYear} onChange={(e) => updateItem("experience", index, "endYear", e.target.value)} />
                                        </div>
                                    </div>
                                    <Textarea className="rounded-xl min-h-[100px]" placeholder="Responsibilities & Achievements" value={exp.description} onChange={(e) => updateItem("experience", index, "description", e.target.value)} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Projects */}
                    <Card className="rounded-[1.5rem] border-border/50 shadow-lg overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Code className="w-5 h-5 text-primary" /> Projects</CardTitle>
                            <Button size="sm" variant="outline" className="rounded-full h-8" onClick={() => addItem("projects", { title: "", description: "", link: "" })}>
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {formData.projects.map((proj: any, index: number) => (
                                <div key={index} className="p-6 border border-border/50 rounded-2xl bg-muted/20 relative group space-y-4">
                                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem("projects", index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <Input className="rounded-xl" placeholder="Project Title" value={proj.title} onChange={(e) => updateItem("projects", index, "title", e.target.value)} />
                                    <Input className="rounded-xl" placeholder="Project Link (Optional)" value={proj.link} onChange={(e) => updateItem("projects", index, "link", e.target.value)} />
                                    <Textarea className="rounded-xl min-h-[80px]" placeholder="Project Description" value={proj.description} onChange={(e) => updateItem("projects", index, "description", e.target.value)} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Side */}
                <div className="sticky top-8 space-y-6">
                    <h3 className="text-xl font-bold px-2">Live Preview</h3>
                    <div className="bg-white text-black p-8 rounded-2xl shadow-2xl border border-border min-h-[600px]" id="resume-preview">
                        <div className="space-y-6">
                            <div className="text-center space-y-2 border-b-2 border-primary pb-6">
                                <h2 className="text-3xl font-bold uppercase tracking-tight">{formData.personalInfo.name || "YOUR NAME"}</h2>
                                <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold text-gray-600">
                                    {formData.personalInfo.email && <span>{formData.personalInfo.email}</span>}
                                    {formData.personalInfo.phone && <span>{formData.personalInfo.phone}</span>}
                                    {formData.personalInfo.location && <span>{formData.personalInfo.location}</span>}
                                </div>
                            </div>

                            {formData.personalInfo.summary && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold uppercase text-primary border-b border-gray-100">Summary</h3>
                                    <p className="text-xs leading-relaxed text-gray-700">{formData.personalInfo.summary}</p>
                                </div>
                            )}

                            {formData.skills.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold uppercase text-primary border-b border-gray-100">Skills</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {formData.skills.map((skill: string, i: number) => (
                                            <span key={i} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-700 border border-gray-200">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {formData.experience.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-primary border-b border-gray-100">Experience</h3>
                                    {formData.experience.map((exp: any, i: number) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between font-bold text-xs">
                                                <span>{exp.role}</span>
                                                <span className="text-gray-500">{exp.startYear} - {exp.endYear || "Present"}</span>
                                            </div>
                                            <div className="text-[10px] text-primary italic font-bold">{exp.company}</div>
                                            <p className="text-[10px] text-gray-700 whitespace-pre-line leading-relaxed">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {formData.education.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-primary border-b border-gray-100">Education</h3>
                                    {formData.education.map((edu: any, i: number) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between font-bold text-xs">
                                                <span>{edu.school}</span>
                                                <span className="text-gray-500">{edu.startYear} - {edu.endYear}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-700">{edu.degree} in {edu.field}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {formData.projects.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-primary border-b border-gray-100">Projects</h3>
                                    {formData.projects.map((proj: any, i: number) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between font-bold text-xs">
                                                <span>{proj.title}</span>
                                                {proj.link && <span className="text-[8px] text-primary truncate max-w-[150px]">{proj.link}</span>}
                                            </div>
                                            <p className="text-[10px] text-gray-700">{proj.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
