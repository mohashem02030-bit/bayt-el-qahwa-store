/*
# Create push_subscriptions table

1. New Tables
- `push_subscriptions`
  - `id` (uuid, primary key)
  - `endpoint` (text, unique): the browser's push address for one visitor's device
  - `p256dh` (text, not null): public encryption key from the browser
  - `auth` (text, not null): authentication secret from the browser
  - `created_at` (timestamptz): when the visitor opted in

2. Security
- Enable RLS on `push_subscriptions`.
- Visitors (no sign-in) can only INSERT a subscription. They cannot read, change, or delete anyone's subscription, so push addresses stay private.
- Grant is limited to INSERT for `anon` and `authenticated`.

3. Notes
- Sending notifications will be done by a server-side function with the service role, which bypasses these restrictions.
*/

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT push_subscriptions_endpoint_length CHECK (char_length(endpoint) BETWEEN 1 AND 2048),
  CONSTRAINT push_subscriptions_keys_length CHECK (char_length(p256dh) BETWEEN 1 AND 256 AND char_length(auth) BETWEEN 1 AND 256)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON push_subscriptions TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_push_subscriptions" ON push_subscriptions;
CREATE POLICY "anon_insert_push_subscriptions" ON push_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
