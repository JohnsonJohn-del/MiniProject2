import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../../components/ui/TextInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 pb-16 pt-8">
      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Create your workspace</h1>
        <p className="mt-2 text-sm text-slate-600">Launch your profitability intelligence dashboard in minutes.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <TextInput label="Full name" name="name" value={form.name} onChange={handleChange} required />
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
            {loading ? "Creating account..." : "Create Account"}
          </PrimaryButton>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-semibold text-slate-900">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
