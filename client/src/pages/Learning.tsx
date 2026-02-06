import { useCourses, useRecommendedCourses } from "@/hooks/use-learning";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, PlayCircle } from "lucide-react";

export default function Learning() {
  const { data: courses } = useCourses();
  const { data: recommended } = useRecommendedCourses();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-display font-bold">Learning Hub</h1>
        <p className="text-muted-foreground mt-1">Upskill yourself with curated courses.</p>
      </div>

      {recommended && recommended.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-accent rounded-full"/> Recommended for You
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map(course => (
              <div key={course.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-40 bg-muted flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                  <Badge className="absolute top-4 left-4 bg-accent text-white">{course.category}</Badge>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-medium text-muted-foreground">{course.provider}</span>
                    <Button size="sm" variant="outline" className="rounded-full" asChild>
                      <a href={course.url || "#"} target="_blank" rel="noopener noreferrer">
                        Start <ExternalLink className="ml-2 w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-6">All Courses</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses?.map(course => (
            <div key={course.id} className="bg-card border border-border/50 rounded-xl p-5 hover:border-primary/50 transition-colors">
              <Badge variant="outline" className="mb-3">{course.category}</Badge>
              <h3 className="font-bold mb-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
              <Button size="sm" className="w-full" variant="secondary" asChild>
                <a href={course.url || "#"} target="_blank" rel="noopener noreferrer">View Course</a>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
