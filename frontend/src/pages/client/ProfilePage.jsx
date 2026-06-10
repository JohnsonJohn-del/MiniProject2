import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import { supabase } from "../../services/supabase";
import TextInput from "../../components/ui/TextInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import PageHeader from "../../components/ui/PageHeader";
import { User, Building, MapPin, Sparkles, Check, Save } from "lucide-react";
import { motion } from "framer-motion";

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

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: "",
    business_name: "",
    business_type: "",
    phone_number: "",
    tax_id: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    online_platforms: [],
    packaging_cost: "15.00"
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load existing profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/profile");
        if (data && data.profile) {
          const p = data.profile;
          let packaging_cost = "15.00";
          let clean_platforms = [];
          if (Array.isArray(p.online_platforms)) {
            p.online_platforms.forEach(plat => {
              if (plat && typeof plat === "string" && plat.startsWith("__pkg_cost:")) {
                packaging_cost = plat.split(":")[1] || "15.00";
              } else if (plat) {
                clean_platforms.push(plat);
              }
            });
          }
          setForm({
            name: user?.name || "",
            business_name: p.business_name || "",
            business_type: p.business_type || "",
            phone_number: p.phone_number || "",
            tax_id: p.tax_id || "",
            website: p.website || "",
            address: p.address || "",
            city: p.city || "",
            state: p.state || "",
            country: p.country || "India",
            postal_code: p.postal_code || "",
            online_platforms: clean_platforms,
            packaging_cost
          });
        }
      } catch (err) {
        console.error("Failed to load profile details", err);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Append default packaging cost inside online_platforms array
      const serializedPlatforms = [...form.online_platforms];
      const pkgCostNum = parseFloat(form.packaging_cost);
      if (!isNaN(pkgCostNum)) {
        serializedPlatforms.push(`__pkg_cost:${pkgCostNum.toFixed(2)}`);
      }

      // 1. Update Profile in database
      await api.put("/profile", {
        business_name: form.business_name,
        business_type: form.business_type,
        phone_number: form.phone_number,
        tax_id: form.tax_id,
        website: form.website,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        postal_code: form.postal_code,
        online_platforms: serializedPlatforms
      });

      // 2. Update user name metadata in Supabase Auth if it changed
      if (form.name !== user?.name) {
        await supabase.auth.updateUser({
          data: { name: form.name }
        });
      }

      // 3. Sync Auth context profile state
      if (refreshProfile) {
        await refreshProfile();
      }

      setMessage("Profile settings updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Configure your cafe profile, address details, and active delivery platform channels."
      />

      {message && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
          <Check size={16} /> {message}
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700">
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
        {/* Left Card: Account & Business Details */}
        <div className="glass-card-premium p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="text-brand-500" size={18} />
            <h2 className="text-base font-bold text-slate-900">Workspace & Business Details</h2>
          </div>

          <div className="space-y-4">
            <TextInput
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <TextInput
              label="Restaurant / Business Name"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              required
            />

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Business Type</label>
              <select
                name="business_type"
                value={form.business_type}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              >
                <option value="" disabled>Select business model...</option>
                {BUSINESS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Phone Number"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
              />
              <TextInput
                label="GST / Tax ID"
                name="tax_id"
                value={form.tax_id}
                onChange={handleChange}
              />
            </div>

            <TextInput
              label="Website URL"
              name="website"
              value={form.website}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Right Card: Location & Platform Presence */}
        <div className="space-y-6">
          <div className="glass-card-premium p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="text-brand-500" size={18} />
              <h2 className="text-base font-bold text-slate-900">Location Details</h2>
            </div>

            <div className="space-y-4">
              <TextInput
                label="Street Address"
                name="address"
                value={form.address}
                onChange={handleChange}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
                <TextInput
                  label="State / Province"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                />
                <TextInput
                  label="Zip / Postal Code"
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Delivery Platforms Presence */}
          <div className="glass-card-premium p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="text-brand-500" size={18} />
              <h2 className="text-base font-bold text-slate-900">Online Platforms Presence</h2>
            </div>
            <p className="text-xs text-slate-500">
              Select all platforms where your dishes are listed. Adding or removing platforms here will update your Operational Costing simulators automatically.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {PLATFORMS.map(platform => {
                const active = form.online_platforms.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handlePlatformToggle(platform)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-brand-100 text-brand-700 ring-1 ring-brand-500"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200"
                    }`}
                  >
                    {platform}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <PrimaryButton type="submit" disabled={loading} className="w-full sm:w-auto flex items-center gap-2 justify-center">
              <Save size={16} />
              {loading ? "Updating Settings..." : "Save Profile Settings"}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </div>
  );
}
