import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, CreditCard, Wallet, Smartphone, Loader2 } from "lucide-react";
import api from "../../services/api";

const MOCK_CARD = "4242 4242 4242 4242";

export default function MockPaymentModal({ isOpen, onClose, plan, amount, onSuccess }) {
  const [method, setMethod] = useState("card");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !plan) return null;

  const handleSimulate = async (isSuccess) => {
    setStatus("loading");
    setErrorMsg("");

    try {
      // 1. Initialize mock checkout
      const { data: checkout } = await api.post("/payments/mock-checkout", { plan: plan.key });

      // Simulate a realistic delay
      await new Promise(r => setTimeout(r, 1500));

      if (isSuccess) {
        // 2. Complete payment
        await api.post("/payments/mock-success", {
          transactionId: checkout.transactionId,
          plan: plan.key,
          paymentMethod: method
        });
        setStatus("success");
        setTimeout(() => {
          onSuccess(plan.key);
          onClose();
          setStatus("idle");
        }, 2000);
      } else {
        // 3. Fail payment
        await api.post("/payments/mock-failure", {
          transactionId: checkout.transactionId,
          plan: plan.key,
          paymentMethod: method
        });
        setStatus("error");
        setErrorMsg("Payment declined by issuer.");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Payment gateway error.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
          >
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upgrade to {plan.name}</h3>
                <p className="text-sm text-slate-500">Secure Payment Sandbox</p>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-black text-indigo-600">${amount}</span>
                <span className="text-xs uppercase tracking-wide text-slate-400">Total</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {status === "idle" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Payment Methods */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "card", icon: CreditCard, label: "Card" },
                      { id: "upi", icon: Smartphone, label: "UPI" },
                      { id: "wallet", icon: Wallet, label: "Wallet" }
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition-colors ${
                          method === m.id ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                        }`}
                      >
                        <m.icon size={20} />
                        <span className="text-xs font-semibold">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Mock Card Form */}
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Card Number</label>
                      <input disabled type="text" value={MOCK_CARD} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Expiry</label>
                        <input disabled type="text" value="12/28" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">CVC</label>
                        <input disabled type="text" value="***" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <button onClick={() => handleSimulate(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700">
                      <Check size={18} /> Simulate Success
                    </button>
                    <button onClick={() => handleSimulate(false)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700">
                      <X size={18} /> Simulate Failure
                    </button>
                    <button onClick={onClose} className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-800">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Status Views */}
              {status === "loading" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={48} className="animate-spin text-indigo-500" />
                  <p className="mt-4 font-medium text-slate-600">Processing payment...</p>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check size={40} />
                  </div>
                  <h4 className="mt-6 text-xl font-bold text-slate-900">Payment Successful</h4>
                  <p className="mt-2 text-center text-sm text-slate-500">Your tier has been upgraded to {plan.name}. Unlocking features...</p>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <X size={40} />
                  </div>
                  <h4 className="mt-6 text-xl font-bold text-slate-900">Payment Failed</h4>
                  <p className="mt-2 text-center text-sm text-rose-600">{errorMsg}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
