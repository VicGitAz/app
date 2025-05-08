import React from "react";
import WorkspaceLayout from "../workspace/WorkspaceLayout";
import { useAuth } from "../../../supabase/auth";
import { Navigate } from "react-router-dom";
import { LoadingScreen } from "../ui/loading-spinner";

export default function Workspace() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Loading workspace..." />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <WorkspaceLayout />;
}
