import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, Square, Play, BarChart2, CheckCircle2, ArrowRight } from "lucide-react";
import { useVoiceRecorder, useVoiceStream } from "@/replit_integrations/audio";
import { useInterviews, useCreateInterview, useGenerateFeedback } from "@/hooks/use-interviews";

export default function Interviews() {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<{ interviewId: number, conversationId: number } | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);

  const createInterview = useCreateInterview();
  const generateFeedback = useGenerateFeedback();

  const recorder = useVoiceRecorder();
  const stream = useVoiceStream({
    onUserTranscript: (text) => {
      setTranscript(prev => prev + "\nUser: " + text);
    },
    onTranscript: (_, full) => {
      // Real-time AI response updates if needed
    },
    onComplete: (fullText) => {
      setTranscript(prev => prev + "\nAI: " + fullText);
    }
  });

  const { data: history } = useInterviews();
  const [showHistory, setShowHistory] = useState(false);

  const startSession = () => {
    if (!user) return;
    createInterview.mutate({
      userId: user.id,
      jobTitle: "General Software Engineer",
    }, {
      onSuccess: (data: any) => {
        setActiveSession({
          interviewId: data.id,
          conversationId: data.conversationId
        });
        setTranscript("System: Interview session started. Please introduce yourself.");
      }
    });
  };

  const handleMicClick = async () => {
    if (!activeSession) return;

    if (recorder.state === "recording") {
      const blob = await recorder.stopRecording();
      setIsRecording(false);
      // Send to voice endpoint using the linked conversationId
      await stream.streamVoiceResponse(
        `/api/conversations/${activeSession.conversationId}/messages`,
        blob
      );
    } else {
      await recorder.startRecording();
      setIsRecording(true);
    }
  };

  const endSession = () => {
    if (activeSession) {
      generateFeedback.mutate(activeSession.interviewId);
      setActiveSession(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold">Mock Interviews</h1>
          <p className="text-muted-foreground">Practice and improve with AI-powered feedback.</p>
        </div>
        {!activeSession && (
          <Button variant="ghost" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? "Back to Start" : "View History"}
          </Button>
        )}
      </div>

      {!activeSession ? (
        showHistory ? (
          <div className="space-y-4">
            {history?.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground">
                No interview sessions found. Start your first session above!
              </Card>
            ) : (
              history?.map((session: any) => (
                <Card key={session.id} className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">{session.jobTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.createdAt || "").toLocaleDateString()} at {new Date(session.createdAt || "").toLocaleTimeString()}
                      </p>
                    </div>
                    {session.score !== null && (
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Score</p>
                          <p className="text-2xl font-display font-bold text-primary">{session.score}/100</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center font-bold text-sm">
                          {session.score}%
                        </div>
                      </div>
                    )}
                  </div>
                  {session.feedback && (
                    <div className="px-6 pb-6 pt-2 bg-muted/30 border-t">
                      <p className="text-sm font-medium mb-2 italic">"{(session.feedback as any).summary as string}"</p>
                      <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                        <div className="space-y-2">
                          <p className="font-bold text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Strengths
                          </p>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {(session.feedback as any).strengths?.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <p className="font-bold text-amber-600 flex items-center gap-1">
                            <ArrowRight className="w-4 h-4" /> Improvements
                          </p>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {(session.feedback as any).improvements?.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-xl transition-all border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground mb-4 shadow-lg shadow-primary/20">
                  <Mic className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Start Mock Interview</CardTitle>
                <CardDescription className="text-base text-muted-foreground/80">Begin a new session tailored to your profile. Get ready to speak!</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={startSession} className="w-full h-14 text-lg rounded-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                  Begin Session <Play className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-border/50">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl text-foreground">Review History</CardTitle>
                <CardDescription className="text-base">Check your progress and review feedback from previous sessions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => setShowHistory(true)} className="w-full h-14 text-lg rounded-xl border-accent/20 hover:bg-accent/5 hover:text-accent">
                  View Past Results
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      ) : (
        <Card className="shadow-2xl border-primary/50 overflow-hidden">
          <div className="p-6 bg-muted/30 border-b min-h-[400px] max-h-[600px] overflow-y-auto whitespace-pre-wrap font-mono text-sm">
            {transcript || "Waiting for session to start..."}
          </div>
          <div className="p-6 bg-card flex items-center justify-between gap-4">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className={`rounded-full w-16 h-16 flex items-center justify-center p-0 transition-all ${isRecording ? "animate-pulse" : "hover:scale-105"}`}
              onClick={handleMicClick}
            >
              {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-8 h-8" />}
            </Button>

            <div className="text-sm text-muted-foreground">
              {isRecording ? "Recording... Tap to stop" : "Tap microphone to speak"}
            </div>

            <Button variant="outline" onClick={endSession}>
              End Session
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
