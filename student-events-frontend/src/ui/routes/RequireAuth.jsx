import { useEffect } from "react";
import { useAuth } from "../../providers/AuthProvider";

export default function RequireAuth({ children }) {
  const { ready, authenticated, login } = useAuth();

  useEffect(() => { if (ready && !authenticated) login(); }, [ready, authenticated]);
  if (!ready) return <div className="container"><p>Loading…</p></div>;
  return authenticated ? children : null;
}
