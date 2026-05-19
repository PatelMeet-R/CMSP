import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/store/hook";
import { ROUTENAME } from "@/core/Constants/RouteName";
import { logout } from "@/store/features/auth.slice";

export default function ErrorFallbackView() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  // Get the error type from the router state, default to 500
  const status = location.state?.status || 500;
  
  const isForbidden = status === 403;

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTENAME.LOGIN);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-red-100 rounded-full dark:bg-red-900/20">
            <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {isForbidden ? "Access Denied" : "System Error"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isForbidden 
              ? "You do not have the required permissions to view this resource. This incident has been logged."
              : "We encountered an unexpected server error. Please try again later."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout & Re-Authenticate
          </Button>
        </div>
      </div>
    </div>
  );
}