import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronRight, Building, MapPin, User, ChevronLeft } from "lucide-react";
import TextInput from "../../components/ui/TextInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useAuth } from "../../hooks/useAuth";

const BUSINESS_TYPES = [
  "Restaurant",
  "Cafe",
  "Cloud Kitchen",
  "Bakery",
  "Food Truck",
  "Catering Service",
  "Bar / Lounge",
];

const PLATFORMS = [
  "Swiggy",
  "Zomato",
  "Uber Eats",
  "Talabat",
  "Deliveroo",
  "FoodPanda",
  "Dunzo",
  "Other",
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    business_name: "", business_type: "", phone_number: "", tax_id: "", website: "",
    address: "", city: "", state: "", country: "India", postal_code: "",
    online_platforms: []
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlatformToggle = (platform) => {
    setForm(prev => {
      const exists = prev.online_platforms.includes(platform);
      return {
        ...prev,
        online_platforms: exists 
          ? prev.online_platforms.filter(p => p !== platform)
          : [...prev.online_platforms, platform]
      };
    });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }

    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16 pt-8">
      <div className="glass-card p-8">
        
        {/* Progress Tracker */}
        <div className="mb-8 flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 bg-slate-100 rounded-full">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          </div>
          {[
            { num: 1, label: "Account", icon: User },
            { num: 2, label: "Business", icon: Building },
            { num: 3, label: "Location", icon: MapPin }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                step >= s.num ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-200 bg-white text-slate-400"
              }`}>
                {step > s.num ? <Check size={20} /> : <s.icon size={20} />}
              </div>
              <span className={`text-xs font-medium ${step >= s.num ? "text-indigo-900" : "text-slate-400"}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 1 ? "Create your workspace" : step === 2 ? "Tell us about your business" : "Where are you located?"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {step === 1 ? "Launch your profitability intelligence dashboard in minutes." : 
             step === 2 ? "This helps us tailor AI recommendations to your model." : 
             "We use this to auto-detect currency and operational cost benchmarks."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <TextInput label="Full name" name="name" value={form.name} onChange={handleChange} required />
              <TextInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
              <TextInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <TextInput label="Restaurant / Business Name" name="business_name" value={form.business_name} onChange={handleChange} required />
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Business Type</label>
                <select 
                  name="business_type" 
                  value={form.business_type} 
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white/50 px-4 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="" disabled>Select a type...</option>
                  {BUSINESS_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Phone Number" name="phone_number" value={form.phone_number} onChange={handleChange} />
                <TextInput label="GST / Tax ID (Optional)" name="tax_id" value={form.tax_id} onChange={handleChange} />
              </div>
              <TextInput label="Website (Optional)" name="website" value={form.website} onChange={handleChange} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <TextInput label="Address" name="address" value={form.address} onChange={handleChange} required />
              
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="City" name="city" value={form.city} onChange={handleChange} required />
                <TextInput label="State / Province" name="state" value={form.state} onChange={handleChange} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Country" name="country" value={form.country} onChange={handleChange} required />
                <TextInput label="Zip / Postal Code" name="postal_code" value={form.postal_code} onChange={handleChange} required />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-slate-700">Online Platforms Presence</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(platform => {
                    const active = form.online_platforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => handlePlatformToggle(platform)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                          active 
                            ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-500" 
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200"
                        }`}
                      >
                        {platform}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {error && <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-600 animate-in fade-in">{error}</div>}
          
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <button 
                type="button" 
                onClick={prevStep}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <ChevronLeft size={18} /> Back
              </button>
            )}
            <PrimaryButton type="submit" className="flex-1" disabled={loading}>
              {loading ? "Processing..." : step === 3 ? "Complete Onboarding" : (
                <span className="flex items-center justify-center gap-1">Next Step <ChevronRight size={18} /></span>
              )}
            </PrimaryButton>
          </div>
        </form>

        {step === 1 && (
          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account? <Link to="/login" className="font-semibold text-slate-900 hover:text-indigo-600">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
