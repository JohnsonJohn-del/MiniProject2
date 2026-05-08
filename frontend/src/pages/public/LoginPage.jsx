import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../../components/ui/TextInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAsDemo } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleDemoLogin = async (role) => {
    setError("");
    setDemoLoading(role);
    try {
      await loginAsDemo(role);
      navigate(role === "admin" ? "/admin" : "/app");
    } catch (err) {
      setError(err.response?.data?.message || "Demo login failed");
    } finally {
      setDemoLoading("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await login(form);
      navigate(user.role === "admin" ? "/admin" : "/app");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 pb-16 pt-8">
      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to continue managing profitability insights.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <TextInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
          <TextInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          <PrimaryButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </PrimaryButton>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          New here? <Link to="/register" className="font-semibold text-slate-900">Create account</Link>
        </p>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Demo access</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("client")}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              disabled={demoLoading === "client"}
            >
              {demoLoading === "client" ? "Opening..." : "Continue as Demo Client"}
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("admin")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
              disabled={demoLoading === "admin"}
            >
              {demoLoading === "admin" ? "Opening..." : "Continue as Demo Admin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
