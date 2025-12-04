import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Login from "./pages/Login";
import Home from "./pages/Home";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  if (!user) return <Login />;

  return <Home user={user} />;
}
