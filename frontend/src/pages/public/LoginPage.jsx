import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, FlaskConical, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
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
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-md px-6 pb-16 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card-premium p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-gradient-to-br from-brand-500 to-blue-500 p-2.5 text-white shadow-sm">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to your workspace</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
          <TextInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600"
            >
              {error}
            </motion.p>
          ) : null}
          <PrimaryButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </PrimaryButton>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/register" className="font-semibold text-slate-900 underline-offset-2 hover:underline">
            Create account
          </Link>
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <Sparkles size={13} /> Demo access
          </div>
          <p className="mt-1 text-xs text-slate-500">Instantly explore the platform without registering.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("client")}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg disabled:opacity-60"
              disabled={demoLoading === "client"}
            >
              <FlaskConical size={14} />
              {demoLoading === "client" ? "Opening..." : "Demo Client"}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("admin")}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md disabled:opacity-60"
              disabled={demoLoading === "admin"}
            >
              <Shield size={14} />
              {demoLoading === "admin" ? "Opening..." : "Demo Admin"}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
