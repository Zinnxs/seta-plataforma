/**
 * Script de Backup Automatizado do Portal SETA
 * Conecta ao Supabase, extrai todas as tabelas e gera um dump completo (JSON e SQL).
 * 
 * Uso:
 *   node scripts/backup-supabase.js
 * 
 * Variáveis de ambiente opcionais (ou lê do .env / .env.local):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Função simples para carregar variáveis de arquivo .env sem dependências extras
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length > 0) {
      env[key.trim()] = rest.join('=').trim().replace(/^['"]+|['"]+$/g, '');
    }
  }
  return env;
}

const envLocal = loadEnvFile(path.join(rootDir, '.env.local'));
const envDefault = loadEnvFile(path.join(rootDir, '.env'));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || envLocal.VITE_SUPABASE_URL || envDefault.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || envLocal.VITE_SUPABASE_ANON_KEY || envDefault.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Erro: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram encontradas no ambiente ou no arquivo .env.');
  console.log('💡 Defina no seu .env ou execute:');
  console.log('   $env:VITE_SUPABASE_URL="https://seu-projeto.supabase.co"');
  console.log('   $env:VITE_SUPABASE_ANON_KEY="sua-chave-anon"');
  console.log('   node scripts/backup-supabase.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLES = [
  'seta_users',
  'seta_disciplines',
  'seta_grades',
  'seta_assignments',
  'seta_lessons',
  'seta_announcements',
  'seta_pre_registrations',
  'seta_enrollment_docs_config',
  'seta_student_documents'
];

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  console.log(`📦 [${new Date().toLocaleString('pt-BR')}] Iniciando Backup do Portal SETA...`);
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);

  const backupData = {
    metadata: {
      institution: 'Seminário Teológico Aliança (SETA)',
      portal: 'Portal SETA',
      course: 'Bacharel em Teologia',
      exportedAt: new Date().toISOString(),
      timestamp,
      supabaseUrl: SUPABASE_URL
    },
    tables: {}
  };

  let sqlStatements = `-- =========================================================================\n`;
  sqlStatements += `-- BACKUP DO BANCO DE DADOS - PORTAL SETA\n`;
  sqlStatements += `-- Data da exportação: ${new Date().toLocaleString('pt-BR')}\n`;
  sqlStatements += `-- =========================================================================\n\n`;

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`⚠️ Aviso na tabela "${table}": ${error.message}`);
        backupData.tables[table] = [];
        continue;
      }
      backupData.tables[table] = data || [];
      console.log(`  ✓ ${table}: ${data ? data.length : 0} registros`);

      if (data && data.length > 0) {
        sqlStatements += `-- Registros da tabela ${table} (${data.length} linhas)\n`;
        for (const row of data) {
          const columns = Object.keys(row).join(', ');
          const values = Object.values(row).map(val => {
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
            if (typeof val === 'number' || typeof val === 'boolean') return val;
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
          sqlStatements += `INSERT INTO ${table} (${columns}) VALUES (${values}) ON CONFLICT (id) DO UPDATE SET ${Object.keys(row).filter(c => c !== 'id').map(c => `${c} = EXCLUDED.${c}`).join(', ')};\n`;
        }
        sqlStatements += `\n`;
      }
    } catch (err) {
      console.error(`❌ Falha ao exportar tabela ${table}:`, err.message);
    }
  }

  // Cria pasta de backups local
  const backupDir = path.join(rootDir, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const jsonFileName = `backup_seta_${timestamp}.json`;
  const sqlFileName = `backup_seta_${timestamp}.sql`;

  const jsonFilePath = path.join(backupDir, jsonFileName);
  const sqlFilePath = path.join(backupDir, sqlFileName);

  fs.writeFileSync(jsonFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
  fs.writeFileSync(sqlFilePath, sqlStatements, 'utf-8');

  console.log(`\n🎉 Backup gerado com sucesso localmente!`);
  console.log(`   📄 JSON: backups/${jsonFileName} (${(fs.statSync(jsonFilePath).size / 1024).toFixed(1)} KB)`);
  console.log(`   📄 SQL:  backups/${sqlFileName} (${(fs.statSync(sqlFilePath).size / 1024).toFixed(1)} KB)`);

  return { jsonFilePath, sqlFilePath, timestamp };
}

runBackup().catch(err => {
  console.error('❌ Erro fatal no backup:', err);
  process.exit(1);
});
