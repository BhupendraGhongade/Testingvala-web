-- Check current categories in database
SELECT id, name, slug, is_active, created_at FROM forum_categories ORDER BY name;

-- Count total categories
SELECT COUNT(*) as total_categories FROM forum_categories;

-- Check if table structure is correct
\d forum_categories;