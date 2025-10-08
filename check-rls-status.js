#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Test RLS status on different environments
const environments = [
  {
    name: 'Local',
    url: 'http://127.0.0.1:54321',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  },
  {
    name: 'Production',
    url: 'https://qxsardezvxsquvejvsso.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c2FyZGV6dnhzcXV2ZWp2c3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDc2OTMsImV4cCI6MjA3MTAyMzY5M30.ZQhcxebPR4kvAAwCIJr7WlugVwoZivTDN9ID3p_aC04'
  }
];

const tables = ['users', 'user_boards', 'board_pins', 'forum_posts', 'contest_submissions'];

async function checkRLSStatus() {
  console.log('🔒 CHECKING RLS STATUS ACROSS ENVIRONMENTS\n');
  
  for (const env of environments) {
    console.log(`=== ${env.name} Environment ===`);
    const supabase = createClient(env.url, env.key);
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.message.includes('RLS') || error.message.includes('policy')) {
            console.log(`✅ ${table}: RLS ENABLED (${error.message.split('.')[0]})`);
          } else {
            console.log(`❓ ${table}: ${error.message}`);
          }
        } else {
          console.log(`⚠️  ${table}: RLS DISABLED (query succeeded without auth)`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Connection error - ${err.message}`);
      }
    }
    console.log('');
  }
}

checkRLSStatus();