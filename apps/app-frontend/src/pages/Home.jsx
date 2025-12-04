import Dashboard from "../components/Dashboard";

export default function Home({ user }) {
  return (
    <div className="min-h-screen bg-bg text-white">
      <Dashboard user={user} />
    </div>
  );
}
