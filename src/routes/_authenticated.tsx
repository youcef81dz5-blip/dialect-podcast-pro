import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { AudioLines, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        جارٍ التحميل…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <AudioLines className="size-5 text-primary" />
            <span className="font-bold">صدى</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline" dir="ltr">
              {user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                void navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
