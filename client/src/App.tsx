import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/JobDetail";
import CreateJob from "@/pages/CreateJob";
import Applicants from "@/pages/Applicants";
import Learning from "@/pages/Learning";
import Interviews from "@/pages/Interviews";
import NotFound from "@/pages/not-found";

import AppliedJobs from "@/pages/AppliedJobs";
import ResumeBuilder from "@/pages/ResumeBuilder";
import Profile from "@/pages/Profile";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground lg:pl-64 transition-all duration-300">
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/profile/:username" component={Profile} />

          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <ProtectedRoute path="/jobs" component={Jobs} />
          <ProtectedRoute path="/jobs/create" component={CreateJob} />
          <ProtectedRoute path="/jobs/:id" component={JobDetail} />
          <ProtectedRoute path="/applied-jobs" component={AppliedJobs} />
          <ProtectedRoute path="/resume-builder" component={ResumeBuilder} />
          <ProtectedRoute path="/applicants" component={Applicants} />
          <ProtectedRoute path="/learning" component={Learning} />
          <ProtectedRoute path="/interviews" component={Interviews} />

          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

// Layout wrapper to handle conditional Sidebar rendering logic
function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Router />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Layout />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
