
import { createClient } from '@supabase/supabase-js'

const projects = [
  {
    name: 'Arena AI 98',
    id: 'dugtkiwqxuxgvcgxthzp',
    url: 'https://dugtkiwqxuxgvcgxthzp.supabase.co',
    key: 'sb_publishable_kHjpPE0tqxoRTBVxXmRwJQ_GpgFn2I2'
  },
  {
    name: 'Aston Net Connect 43',
    id: 'hikagodjerxzdcihpwot',
    url: 'https://hikagodjerxzdcihpwot.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpa2Fnb2RqZXJ4emRjaWhwd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTUzOTAsImV4cCI6MjA5MTU5MTM5MH0.K-_EHrfadcXD3b05uOSgUbQUkkAlcQ9WHMut9G9Aa58'
  },
  {
    name: 'Diário Duo TRZ',
    id: 'nxqyktvliiipgrjsjjeg',
    url: 'https://nxqyktvliiipgrjsjjeg.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54cXlrdHZsaWlpcGdyanNqamVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Mjg4ODcsImV4cCI6MjA3ODIwNDg4N30.wavwIj4h_yCMurJSix3KzKBAQVSknWExVd8f__Ft02c'
  },
  {
    name: 'Super Copa Admin',
    id: 'metlycznlaqaxrjlwqvl',
    url: 'https://metlycznlaqaxrjlwqvl.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldGx5Y3pubGFxYXhyamx3cXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODgzODgsImV4cCI6MjA4MTI2NDM4OH0.AG9sp7_pmnPakCWiI0Z7vXGkoD7pIwURKnLaVjYDtpU'
  }
]

const tablesToCheck = ['ranking', 'rules', 'awards', 'config', 'horarios', 'resultados', 'grupos']

async function scanProjects() {
  for (const project of projects) {
    console.log(`\n--- Scanning Project: ${project.name} (${project.id}) ---`)
    const supabase = createClient(project.url, project.key)
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (!error) {
          console.log(`✅ [${project.id}] Table '${table}': Exists and accessible!`)
        } else if (error.code === 'PGRST116') {
          console.log(`✅ [${project.id}] Table '${table}': Connected (Empty)`)
        } else if (error.code === '42501') {
           console.log(`🔒 [${project.id}] Table '${table}': Restricted (RLS active)`)
        } else if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message.includes('not find')) {
          // Do nothing or log silent
        } else {
          console.log(`⚠️ [${project.id}] Table '${table}': Error ${error.code} - ${error.message}`)
        }
      } catch (err) {
        // Silent exception
      }
    }
  }
}

scanProjects()
