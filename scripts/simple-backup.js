import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
const loadEnv = () => {
  try {
    const envContent = fs.readFileSync('.env.production', 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key] = value;
      }
    });
  } catch (err) {
    console.log('Using default env');
  }
};
loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backupData() {
  console.log('💾 Starting simple backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', timestamp);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const tables = ['website_content', 'forum_posts', 'user_boards', 'board_posts'];
  
  for (const table of tables) {
    try {
      console.log(`📋 Backing up ${table}...`);
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        console.warn(`⚠️ Could not backup ${table}:`, error.message);
        continue;
      }
      
      fs.writeFileSync(
        path.join(backupDir, `${table}.json`),
        JSON.stringify(data, null, 2)
      );
      
      console.log(`✅ ${table}: ${data?.length || 0} records`);
    } catch (err) {
      console.warn(`⚠️ Error backing up ${table}:`, err.message);
    }
  }
  
  console.log(`✅ Backup completed: ${backupDir}`);
}

backupData().catch(console.error);