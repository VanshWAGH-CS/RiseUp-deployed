import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteProps } from "wouter";

export function ProtectedRoute({ component: Component, ...rest }: RouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route
      {...rest}
      component={(props) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/login" />;
        }

        // Component check to satisfy TS if component prop is missing (unlikely with this usage)
        if (!Component) return null;

        return <Component {...props} />;
      }}
    />
  );
}
