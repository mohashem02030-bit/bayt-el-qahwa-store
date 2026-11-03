/*
# Store data in the database: menu changes, orders, and cashier accounts

Moves the three things that were saved only in each browser into the shared database, so every device sees the same data.

1. New Tables
- `product_overrides`: admin edits to the menu. One row per product id, holding the edited fields as JSON, plus whether it is archived or out of stock.
- `orders`: every order, including orders placed by customers on the site and at the cashier. Holds the status, the order details as JSON, and creation and update times in milliseconds.
- `cashier_users`: cashier accounts with a display name, username, password, and an active flag.

2. Security
- `product_overrides` and `orders`: the site has no sign-in, so the anonymous role can read, add, change, and delete rows. This matches the existing no-login design.
- `cashier_users`: the anonymous role can read the id, username, name, active flag, and creation time, but NOT the password. It can write the password only, so passwords are never sent back to the browser.
- `verify_cashier(username, password)`: the only way to check a cashier login. It returns the cashier's display name when the credentials match an active account, and nothing otherwise.

3. Notes
- A default cashier account (username `cashier`) is added if it does not exist yet, so the cashier page stays usable after the move.
- Every statement is safe to run again.
*/

CREATE TABLE IF NOT EXISTS product_overrides (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE product_overrides ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON product_overrides TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_product_overrides" ON product_overrides;
CREATE POLICY "anon_select_product_overrides" ON product_overrides FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_product_overrides" ON product_overrides;
CREATE POLICY "anon_insert_product_overrides" ON product_overrides FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_product_overrides" ON product_overrides;
CREATE POLICY "anon_update_product_overrides" ON product_overrides FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_product_overrides" ON product_overrides;
CREATE POLICY "anon_delete_product_overrides" ON product_overrides FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'prep', 'ready', 'completed')),
  data jsonb NOT NULL,
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS cashier_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at bigint NOT NULL
);

ALTER TABLE cashier_users ENABLE ROW LEVEL SECURITY;

GRANT SELECT (id, username, name, active, created_at) ON cashier_users TO anon, authenticated;
GRANT INSERT (username, password, name, active, created_at) ON cashier_users TO anon, authenticated;
GRANT UPDATE (username, password, name, active) ON cashier_users TO anon, authenticated;
GRANT DELETE ON cashier_users TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_cashier_users" ON cashier_users;
CREATE POLICY "anon_select_cashier_users" ON cashier_users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cashier_users" ON cashier_users;
CREATE POLICY "anon_insert_cashier_users" ON cashier_users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cashier_users" ON cashier_users;
CREATE POLICY "anon_update_cashier_users" ON cashier_users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cashier_users" ON cashier_users;
CREATE POLICY "anon_delete_cashier_users" ON cashier_users FOR DELETE
  TO anon, authenticated USING (true);

INSERT INTO cashier_users (username, password, name, active, created_at)
VALUES ('cashier', 'cashier123', 'كاشير ١', true, (extract(epoch from now()) * 1000)::bigint)
ON CONFLICT (username) DO NOTHING;

CREATE OR REPLACE FUNCTION verify_cashier(p_username text, p_password text)
RETURNS TABLE (name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.name
  FROM cashier_users c
  WHERE c.active
    AND lower(trim(c.username)) = lower(trim(p_username))
    AND c.password = p_password
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION verify_cashier(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION verify_cashier(text, text) TO anon, authenticated;
