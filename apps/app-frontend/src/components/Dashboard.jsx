import { supabase } from "../lib/supabaseClient";

export default function Dashboard({ user }) {
  const logout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user.email} 👋
      </h1>

      <p className="text-fg/70 mb-6">
        You are now authenticated inside the Swarm Shield Core System.
      </p>

      <button
        onClick={logout}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
      >
        Logout
      </button>
    </div>
  );
}
