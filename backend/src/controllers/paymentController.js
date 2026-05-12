import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { AppError } from "../utils/appError.js";

// Prices in USD
const PLAN_PRICES = {
  free: 0,
  pro: 49.00,
  premium: 99.00
};

export async function mockCheckout(req, res) {
  const { plan } = req.body;
  const userId = req.user.id;

  if (!plan || !PLAN_PRICES[plan]) {
    throw new AppError("Invalid plan selected", 400);
  }

  // Create a mock transaction ID
  const transactionId = `txn_mock_${Math.random().toString(36).substring(2, 15)}`;

  // In a real integration, this would create a Stripe/Razorpay session and return the URL
  res.status(200).json({
    success: true,
    transactionId,
    amount: PLAN_PRICES[plan],
    plan,
    message: "Proceed to mock payment modal"
  });
}

export async function mockSuccess(req, res) {
  const { transactionId, plan, paymentMethod = "card" } = req.body;
  const userId = req.user.id;

  if (!transactionId || !plan) {
    throw new AppError("Missing transaction ID or plan", 400);
  }

  // 1. Record the payment in payment_history
  const { error: historyErr } = await supabaseAdmin.from("payment_history").insert({
    user_id: userId,
    transaction_id: transactionId,
    amount: PLAN_PRICES[plan],
    currency: "USD",
    plan,
    status: "success",
    payment_method: paymentMethod
  });

  if (historyErr) console.error("Payment history error:", historyErr);

  // 2. Upsert the subscription
  const currentEnd = new Date();
  currentEnd.setMonth(currentEnd.getMonth() + 1); // 1 month subscription

  const { error: subErr } = await supabaseAdmin.from("subscriptions").upsert({
    user_id: userId,
    plan,
    status: "active",
    current_period_end: currentEnd.toISOString()
  }, { onConflict: "user_id" });

  if (subErr) {
    throw new AppError("Failed to update subscription", 500);
  }

  // The sync_user_subscription_plan_trigger will automatically update the users table.
  // For safety, let's also update users directly in case trigger isn't applied yet
  await supabaseAdmin.from("users").update({ subscription_plan: plan }).eq("id", userId);

  res.status(200).json({
    success: true,
    message: `Successfully upgraded to ${plan.toUpperCase()}`,
    plan
  });
}

export async function mockFailure(req, res) {
  const { transactionId, plan, paymentMethod = "card" } = req.body;
  const userId = req.user.id;

  // Record the failed payment
  const { error: historyErr } = await supabaseAdmin.from("payment_history").insert({
    user_id: userId,
    transaction_id: transactionId || `txn_fail_${Date.now()}`,
    amount: PLAN_PRICES[plan] || 0,
    currency: "USD",
    plan: plan || "unknown",
    status: "failed",
    payment_method: paymentMethod
  });

  res.status(200).json({
    success: false,
    message: "Payment failed. Subscription was not updated."
  });
}
