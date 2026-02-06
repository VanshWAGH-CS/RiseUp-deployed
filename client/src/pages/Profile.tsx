import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Globe, GraduationCap, Briefcase, Code, Link as LinkIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Profile() {
    const [, params] = useRoute("/profile/:username");
    const username = params?.username;

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ["/api/profiles/", username],
        queryFn: async () => {
            const res = await fetch(`/api/profiles/${username}`);
            if (!res.ok) throw new Error("Profile not found");
            return res.json();
        },
        enabled: !!username,
    });

    const downloadResume = async () => {
        const element = document.getElementById("profile-content");
        if (!element) return;

        // Create a temporary clone for PDF generation with white background
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${profile.name}_Resume.pdf`);
    };

    if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;
    if (error || !profile) return <div className="p-8 text-center text-destructive">Profile not found</div>;

    const resume = profile.resume;

    return (
        <div className="max-w-5xl mx-auto space-y-8" id="profile-content">
            {/* Header Card */}
            <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
                <CardContent className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                        <Avatar className="w-32 h-32 border-4 border-white/20 shadow-xl">
                            <AvatarFallback className="bg-white/10 text-4xl">{profile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-4 flex-1">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-display font-bold">{profile.name}</h1>
                                <p className="text-xl text-primary-foreground/80 mt-2 font-medium">
                                    {resume?.experience?.[0]?.role || "Student"}
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                                <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full"><Mail className="w-4 h-4" /> {profile.email}</span>
                                {resume?.personalInfo?.location && <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full"><MapPin className="w-4 h-4" /> {resume.personalInfo.location}</span>}
                                {resume?.personalInfo?.profileLink && (
                                    <a href={resume.personalInfo.profileLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">
                                        <Globe className="w-4 h-4" /> Portfolio
                                    </a>
                                )}
                            </div>
                            <div className="pt-4 flex justify-center md:justify-start gap-3">
                                <Button onClick={downloadResume} variant="secondary" className="gap-2 bg-white text-primary hover:bg-white/90">
                                    <Download className="w-4 h-4" /> Download Resume
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Skills */}
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/50">
                            <CardTitle className="flex items-center gap-2 text-primary"><Code className="w-5 h-5" /> Skills</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap gap-2">
                                {resume?.skills?.map((skill: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="px-3 py-1 text-sm font-medium">{skill}</Badge>
                                ))}
                                {(!resume?.skills || resume.skills.length === 0) && profile.skills?.map((skill: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="px-3 py-1 text-sm font-medium">{skill}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact & Links */}
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/50">
                            <CardTitle className="flex items-center gap-2 text-primary"><LinkIcon className="w-5 h-5" /> Connect</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 text-sm text-muted-foreground">
                            <p className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> {profile.email}</p>
                            {resume?.personalInfo?.phone && <p className="flex items-center gap-3"><Globe className="w-4 h-4 text-primary" /> {resume.personalInfo.phone}</p>}
                            <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-primary" /> {profile.location || "Remote"}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* About */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">About Me</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {resume?.personalInfo?.summary || profile.bio || "No summary provided."}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Education */}
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50">
                            <CardTitle className="flex items-center gap-2 text-primary font-bold">
                                <GraduationCap className="w-6 h-6" /> Education
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {resume?.education?.map((edu: any, i: number) => (
                                    <div key={i} className="p-6 hover:bg-muted/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-bold">{edu.school}</h4>
                                            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                                                {edu.startYear} - {edu.endYear}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground font-medium">{edu.degree} in {edu.field}</p>
                                    </div>
                                ))}
                                {(!resume?.education || resume.education.length === 0) && (
                                    <p className="p-6 text-muted-foreground text-center">No education details listed.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Experience */}
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50">
                            <CardTitle className="flex items-center gap-2 text-primary font-bold">
                                <Briefcase className="w-6 h-6" /> Experience
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {resume?.experience?.map((exp: any, i: number) => (
                                    <div key={i} className="p-6 hover:bg-muted/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-bold">{exp.role}</h4>
                                            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                                                {exp.startYear} - {exp.endYear || "Present"}
                                            </span>
                                        </div>
                                        <p className="text-primary font-bold text-sm mb-3">{exp.company}</p>
                                        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                                    </div>
                                ))}
                                {(!resume?.experience || resume.experience.length === 0) && (
                                    <p className="p-6 text-muted-foreground text-center">No experience listed.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Projects */}
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50">
                            <CardTitle className="flex items-center gap-2 text-primary font-bold">
                                <Code className="w-6 h-6" /> Key Projects
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {resume?.projects?.map((proj: any, i: number) => (
                                <div key={i} className="p-5 border border-border/50 rounded-2xl hover:border-primary/50 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{proj.title}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{proj.description}</p>
                                    {proj.link && (
                                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                                            <Globe className="w-3 h-3" /> View Project
                                        </a>
                                    )}
                                </div>
                            ))}
                            {(!resume?.projects || resume.projects.length === 0) && (
                                <p className="col-span-full text-muted-foreground text-center py-4">No projects listed.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
