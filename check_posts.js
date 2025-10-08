import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'local_key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPosts() {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Posts in database:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('Posts:', data.map(p => ({ id: p.id, title: p.title, author: p.author_name })));
    }
  } catch (err) {
    console.error('Connection error:', err);
  }
}

checkPosts();