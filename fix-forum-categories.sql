-- Get current forum categories
-- Run this in your Supabase SQL Editor to see all categories

SELECT id, name, slug FROM forum_categories ORDER BY name;