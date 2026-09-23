ALTER TABLE visitors ADD COLUMN last_seen_at INTEGER;
UPDATE visitors SET last_seen_at = first_seen_at WHERE last_seen_at IS NULL;
CREATE INDEX IF NOT EXISTS visitors_last_seen_idx ON visitors(last_seen_at);
