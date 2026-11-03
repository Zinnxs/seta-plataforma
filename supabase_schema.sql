-- =========================================================================
-- ESQUEMA DO BANCO DE DADOS SUPABASE (POSTGRESQL) - SEMINÁRIO TEOLÓGICO ALIANÇA (SETA)
-- Copie e cole este script completo no "SQL Editor" do seu painel Supabase
-- e clique em "RUN".
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

-- 2. Tabela de Disciplinas e Critérios de Soma de Pontos (Bacharel em Teologia)
CREATE TABLE IF NOT EXISTS seta_disciplines (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  professor_id TEXT NOT NULL REFERENCES seta_users(id) ON DELETE CASCADE,
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
  discipline_id TEXT NOT NULL REFERENCES seta_disciplines(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES seta_users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  recovery NUMERIC,
  absences INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (discipline_id, student_id)
);

-- 4. Tabela de Trabalhos e Atividades Acadêmicas
CREATE TABLE IF NOT EXISTS seta_assignments (
  id TEXT PRIMARY KEY,
  discipline_id TEXT NOT NULL REFERENCES seta_disciplines(id) ON DELETE CASCADE,
  evaluation_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  submissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Aulas, Videoaulas e Apostilas
CREATE TABLE IF NOT EXISTS seta_lessons (
  id TEXT PRIMARY KEY,
  discipline_id TEXT NOT NULL REFERENCES seta_disciplines(id) ON DELETE CASCADE,
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
-- HABILITAR POLÍTICAS DE ACESSO (RLS - Permissões Públicas para a Aplicação)
-- =========================================================================

ALTER TABLE seta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso aos usuários do SETA" ON seta_users;
CREATE POLICY "Acesso aos usuários do SETA" ON seta_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso às disciplinas do SETA" ON seta_disciplines;
CREATE POLICY "Acesso às disciplinas do SETA" ON seta_disciplines FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso às notas do SETA" ON seta_grades;
CREATE POLICY "Acesso às notas do SETA" ON seta_grades FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso aos trabalhos do SETA" ON seta_assignments;
CREATE POLICY "Acesso aos trabalhos do SETA" ON seta_assignments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso às aulas do SETA" ON seta_lessons;
CREATE POLICY "Acesso às aulas do SETA" ON seta_lessons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso aos avisos do SETA" ON seta_announcements;
CREATE POLICY "Acesso aos avisos do SETA" ON seta_announcements FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- CARGA INICIAL: APENAS O USUÁRIO DA DIREÇÃO (SEM DADOS FICTÍCIOS)
-- =========================================================================

-- Inserir / Atualizar o perfil oficial da Direção
INSERT INTO seta_users (id, name, email, password, role, title, course, year) VALUES
  ('adm-1', 'Direção Geral do SETA', 'admin@seta.com', 'setaadmin987', 'admin', 'Direção', 'Bacharel em Teologia', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  password = EXCLUDED.password;

-- Aviso inicial do mural
INSERT INTO seta_announcements (id, date, author, title, content, important) VALUES
  ('ann-init', to_char(now(), 'YYYY-MM-DD'), 'Direção Geral', 'Ambiente Acadêmico SETA Oficial',
   'Plataforma oficial ativa. Cadastre os professores, os alunos e as matérias do Bacharel em Teologia no painel da Direção.', true)
ON CONFLICT (id) DO NOTHING;
