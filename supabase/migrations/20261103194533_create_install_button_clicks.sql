/*
# Track clicks on the app download button

1. New Tables
- `install_button_clicks`: one row per click on the download button in the install popup.
  - `id` (bigint identity, primary key)
  - `platform` (text): one of android, ios, desktop, other
  - `created_at` (timestamptz, defaults to now)

2. New Functions
- `install_click_stats()`: returns aggregated click counts per platform (total and last 7 days).
  Only aggregates are returned, never individual rows.

3. Security
- RLS enabled on `install_button_clicks`.
- Visitors (anon role) can only INSERT rows. They cannot read the table.
- The stats function runs with definer rights so the admin dashboard can read totals without
  direct table access. EXECUTE is granted to anon and authenticated because the admin
  dashboard uses the anon key.
*/

CREATE TABLE IF NOT EXISTS install_button_clicks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  platform text NOT NULL CHECK (platform IN ('android', 'ios', 'desktop', 'other')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS install_button_clicks_created_at_idx ON install_button_clicks (created_at);

ALTER TABLE install_button_clicks ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON install_button_clicks TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_install_clicks" ON install_button_clicks;
CREATE POLICY "anon_insert_install_clicks" ON install_button_clicks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION install_click_stats()
RETURNS TABLE (platform text, clicks bigint, last_7_days bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.platform,
    count(*) AS clicks,
    count(*) FILTER (WHERE c.created_at > now() - interval '7 days') AS last_7_days
  FROM install_button_clicks c
  GROUP BY c.platform;
$$;

REVOKE EXECUTE ON FUNCTION install_click_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION install_click_stats() TO anon, authenticated;
