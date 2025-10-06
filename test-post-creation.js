// Test script to verify post creation works
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPostCreation() {
  console.log('🧪 Testing post creation...');
  
  try {
    // 1. Test connection
    const { data: categories, error: catError } = await supabase
      .from('forum_categories')
      .select('id, name')
      .limit(1);
    
    if (catError) {
      console.error('❌ Connection failed:', catError);
      return;
    }
    
    console.log('✅ Connection successful');
    console.log('📂 Available category:', categories[0]);
    
    // 2. Test post creation
    const testPost = {
      title: 'Test Post from Script',
      content: 'This is a test post created from the test script.',
      category_id: categories[0].id,
      author_name: 'Test Script',
      status: 'active'
    };
    
    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .insert([testPost])
      .select()
      .single();
    
    if (postError) {
      console.error('❌ Post creation failed:', postError);
      return;
    }
    
    console.log('✅ Post created successfully:', post.id);
    console.log('📝 Post details:', {
      id: post.id,
      title: post.title,
      category_id: post.category_id,
      author_name: post.author_name,
      created_at: post.created_at
    });
    
    // 3. Clean up - delete test post
    const { error: deleteError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', post.id);
    
    if (deleteError) {
      console.warn('⚠️ Failed to clean up test post:', deleteError);
    } else {
      console.log('🧹 Test post cleaned up');
    }
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPostCreation();