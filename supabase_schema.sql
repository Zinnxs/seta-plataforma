-- =========================================================================
-- ESQUEMA DO BANCO DE DADOS SUPABASE (POSTGRESQL) - SEMINÁRIO TEOLÓGICO ALIANÇA (SETA)
-- Copie e cole este script completo no "SQL Editor" do seu painel Supabase
-- e clique no botão verde "RUN" (Executar).
-- =========================================================================

-- 1. Tabela de Usuários (Alunos, Professores e Administradores)
CREATE TABLE IF NOT EXISTS seta_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL DEFAULT 'seta123',
  role TEXT NOT NULL CHECK (role IN ('aluno', 'professor', 'admin')),
  title TEXT,
  enrollment TEXT,
  course TEXT DEFAULT 'Bacharel em Teologia',
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garante colunas necessárias
ALTER TABLE seta_users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'seta123';
ALTER TABLE seta_users ADD COLUMN IF NOT EXISTS course TEXT DEFAULT 'Bacharel em Teologia';

-- 2. Tabela de Disciplinas e Critérios de Soma de Pontos
CREATE TABLE IF NOT EXISTS seta_disciplines (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  professor_id TEXT NOT NULL,
  course TEXT NOT NULL DEFAULT 'Bacharel em Teologia',
  workload INT NOT NULL DEFAULT 60,
  schedule TEXT,
  passing_grade NUMERIC NOT NULL DEFAULT 7.0,
  max_absences INT NOT NULL DEFAULT 15,
  recovery_rule TEXT NOT NULL DEFAULT 'substitui_menor',
  grades_closed BOOLEAN NOT NULL DEFAULT false,
  evaluations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Notas e Faltas (Pontuação Somada com corte mínimo de 7,0 pts)
CREATE TABLE IF NOT EXISTS seta_grades (
  discipline_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  recovery NUMERIC,
  absences INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (discipline_id, student_id)
);

-- 4. Tabela de Trabalhos e Atividades Acadêmicas
CREATE TABLE IF NOT EXISTS seta_assignments (
  id TEXT PRIMARY KEY,
  discipline_id TEXT NOT NULL,
  evaluation_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  submission_type TEXT NOT NULL DEFAULT 'upload', -- 'upload' | 'email' | 'custom'
  destination_email TEXT,
  custom_instructions TEXT,
  submissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garante colunas na tabela de trabalhos caso já exista
ALTER TABLE seta_assignments ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'upload';
ALTER TABLE seta_assignments ADD COLUMN IF NOT EXISTS destination_email TEXT;
ALTER TABLE seta_assignments ADD COLUMN IF NOT EXISTS custom_instructions TEXT;

-- 5. Tabela de Aulas, Videoaulas e Apostilas
CREATE TABLE IF NOT EXISTS seta_lessons (
  id TEXT PRIMARY KEY,
  discipline_id TEXT NOT NULL,
  module TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  duration TEXT,
  kind TEXT NOT NULL DEFAULT 'gravada',
  url TEXT,
  summary TEXT,
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Mural de Avisos da Direção
CREATE TABLE IF NOT EXISTS seta_announcements (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  important BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- PERMISSÕES E POLÍTICAS DE ACESSO LIVRE (RLS PARA ANON E AUTHENTICATED)
-- =========================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

ALTER TABLE seta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access seta_users" ON seta_users;
CREATE POLICY "Public access seta_users" ON seta_users FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access seta_disciplines" ON seta_disciplines;
CREATE POLICY "Public access seta_disciplines" ON seta_disciplines FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access seta_grades" ON seta_grades;
CREATE POLICY "Public access seta_grades" ON seta_grades FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access seta_assignments" ON seta_assignments;
CREATE POLICY "Public access seta_assignments" ON seta_assignments FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access seta_lessons" ON seta_lessons;
CREATE POLICY "Public access seta_lessons" ON seta_lessons FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access seta_announcements" ON seta_announcements;
CREATE POLICY "Public access seta_announcements" ON seta_announcements FOR ALL TO public USING (true) WITH CHECK (true);

-- =========================================================================
-- BUCKET DE ARMAZENAMENTO DE ARQUIVOS (SUPABASE STORAGE)
-- =========================================================================

-- Criação do Bucket 'seta-trabalhos' público para anexos reais dos alunos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'seta-trabalhos', 
  'seta-trabalhos', 
  true, 
  15728640, -- Limite de 15MB por arquivo
  ARRAY[
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/octet-stream', 
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 15728640;

-- Políticas de acesso para upload e leitura de trabalhos no Storage
DROP POLICY IF EXISTS "Public upload seta-trabalhos" ON storage.objects;
CREATE POLICY "Public upload seta-trabalhos" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'seta-trabalhos');

DROP POLICY IF EXISTS "Public update seta-trabalhos" ON storage.objects;
CREATE POLICY "Public update seta-trabalhos" ON storage.objects
  FOR UPDATE TO public USING (bucket_id = 'seta-trabalhos') WITH CHECK (bucket_id = 'seta-trabalhos');

DROP POLICY IF EXISTS "Public read seta-trabalhos" ON storage.objects;
CREATE POLICY "Public read seta-trabalhos" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'seta-trabalhos');

-- =========================================================================
-- CARGA INICIAL: APENAS O USUÁRIO DA DIREÇÃO
-- =========================================================================

INSERT INTO seta_users (id, name, email, password, role, title, course, year) VALUES
  ('adm-1', 'Direção Geral do SETA', 'admin@seta.com', 'setaadmin987', 'admin', 'Direção', 'Bacharel em Teologia', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  password = EXCLUDED.password;

INSERT INTO seta_announcements (id, date, author, title, content, important) VALUES
  ('ann-init', to_char(now(), 'YYYY-MM-DD'), 'Direção Geral', 'Ambiente Acadêmico SETA Oficial',
   'Plataforma oficial ativa. Cadastre os professores, os alunos e as matérias do Bacharel em Teologia no painel da Direção.', true)
ON CONFLICT (id) DO NOTHING;
