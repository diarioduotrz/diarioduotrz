
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dugtkiwqxuxgvcgxthzp.supabase.co'
const supabaseKey = 'sb_publishable_kHjpPE0tqxoRTBVxXmRwJQ_GpgFn2I2'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  const tables = ['ranking', 'rules', 'awards', 'config', 'horarios', 'resultados', 'grupos']
  console.log('Checking for tables in project dugtkiwqxuxgvcgxthzp...')

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`✅ Table '${table}': Connected (Empty or single row expected)`)
        } else if (error.code === 'PGRST204' || error.code === 'PGRST205') {
          console.log(`❌ Table '${table}': Does not exist`)
        } else {
          console.log(`⚠️ Table '${table}': Error ${error.code} - ${error.message}`)
        }
      } else {
        console.log(`✅ Table '${table}': Exists and accessible!`)
      }
    } catch (err) {
      console.log(`❌ Table '${table}': Exception ${err.message}`)
    }
  }
}

checkTables()
