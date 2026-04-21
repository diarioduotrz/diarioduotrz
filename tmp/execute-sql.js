
import fs from 'fs';

const sql = fs.readFileSync('tmp/schema.sql', 'utf8');
const projectRef = 'dugtkiwqxuxgvcgxthzp';
const token = 'sbp_28c138446ade7c65799f5926ff20080461b4b360';

async function executeSql() {
  console.log('Sending SQL to Supabase Management API...');
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  const result = await response.json();
  if (response.ok) {
    console.log('✅ SQL executed successfully!');
    // The response might be an array or object depending on the query
    console.log('Execution result received.');
  } else {
    console.error('❌ Error executing SQL:', result);
  }
}

executeSql();
