-- Align tier names with app code (free / pro / business / enterprise)
-- and persist Stripe identifiers needed for the customer portal.

-- 1. Update users.subscription_tier CHECK constraint to use the app's naming.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_tier_check;
UPDATE users SET subscription_tier = 'pro'      WHERE subscription_tier = 'creator';
UPDATE users SET subscription_tier = 'business' WHERE subscription_tier = 'agency';
ALTER TABLE users
  ADD CONSTRAINT users_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'pro', 'business', 'enterprise'));

-- 2. Same for the subscriptions table.
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
UPDATE subscriptions SET plan = 'pro'      WHERE plan = 'creator';
UPDATE subscriptions SET plan = 'business' WHERE plan = 'agency';
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('pro', 'business', 'enterprise'));

-- 3. Persist Stripe IDs on users for fast portal/checkout lookup.
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- 4. Helpful index for webhook lookups by Stripe IDs.
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
