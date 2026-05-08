import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-slate-600">The page you are looking for does not exist.</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
          Back to home
        </Link>
      </div>
    </div>
  );
}
