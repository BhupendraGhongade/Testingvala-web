import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qxsardezvxsquvejvsso.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c2FyZGV6dnhzcXV2ZWp2c3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDc2OTMsImV4cCI6MjA3MTAyMzY5M30.ZQhcxebPR4kvAAwCIJr7WlugVwoZivTDN9ID3p_aC04';

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