import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-slate-400">
      <h2 className="text-6xl font-bold text-slate-600">404</h2>
      <p className="text-lg">Page not found.</p>
      <Link
        to="/"
        className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
