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
  course TEXT,
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garante que a coluna password exista caso a tabela já tenha sido criada anteriormente
ALTER TABLE seta_users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'seta123';

-- 2. Tabela de Disciplinas e Critérios de Soma de Pontos
CREATE TABLE IF NOT EXISTS seta_disciplines (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  professor_id TEXT NOT NULL REFERENCES seta_users(id) ON DELETE CASCADE,
  course TEXT NOT NULL,
  workload INT NOT NULL DEFAULT 60,
  schedule TEXT,
  passing_grade NUMERIC NOT NULL DEFAULT 7.0,
  max_absences INT NOT NULL DEFAULT 15,
  recovery_rule TEXT NOT NULL DEFAULT 'substitui_menor',
  grades_closed BOOLEAN NOT NULL DEFAULT false,
  evaluations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Notas e Faltas (Pontuação Somada)
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
-- HABILITAR POLÍTICAS DE ACESSO (RLS - Permissões Públicas para o Protótipo)
-- Permite leitura e gravação anônima usando a chave Anon pública do Supabase
-- =========================================================================

ALTER TABLE seta_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE seta_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público aos usuários do SETA" ON seta_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público às disciplinas do SETA" ON seta_disciplines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público às notas do SETA" ON seta_grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público aos trabalhos do SETA" ON seta_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público às aulas do SETA" ON seta_lessons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público aos avisos do SETA" ON seta_announcements FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- CARGA INICIAL DE DADOS (SEED DO SETA COM SOMA DE PONTOS)
-- =========================================================================

-- Inserir Administrador e Professores
INSERT INTO seta_users (id, name, email, role, title, course, year) VALUES
  ('adm-1', 'Antônio Carlos de Almeida', 'direcao@seta.edu.br', 'admin', 'Rev.', NULL, NULL),
  ('prof-1', 'Samuel Alencar', 'professor@seta.edu.br', 'professor', 'Prof. Dr.', NULL, NULL),
  ('prof-2', 'Davi Oliveira', 'davi.oliveira@seta.edu.br', 'professor', 'Prof. Me.', NULL, NULL),
  ('prof-3', 'Ester Vasconcelos', 'ester.vasconcelos@seta.edu.br', 'professor', 'Profª. Dra.', NULL, NULL),
  ('prof-4', 'Marcos Ferreira', 'marcos.ferreira@seta.edu.br', 'professor', 'Pr.', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Inserir Alunos
INSERT INTO seta_users (id, name, email, role, enrollment, course, year) VALUES
  ('stu-1', 'Lucas Mendes da Silva', 'aluno@seta.edu.br', 'aluno', '2024-0104', 'Bacharel em Teologia', '2º ano'),
  ('stu-2', 'Amanda Ribeiro Farias', 'amanda.ribeiro@seta.edu.br', 'aluno', '2024-0112', 'Bacharel em Teologia', '2º ano'),
  ('stu-3', 'Gabriel Santos Albuquerque', 'gabriel.santos@seta.edu.br', 'aluno', '2024-0089', 'Bacharel em Teologia', '2º ano'),
  ('stu-4', 'Mateus Cavalcanti Barreto', 'mateus.barreto@seta.edu.br', 'aluno', '2024-0155', 'Bacharel em Teologia', '2º ano'),
  ('stu-5', 'Priscila Neves Batista', 'priscila.neves@seta.edu.br', 'aluno', '2024-0177', 'Bacharel em Teologia', '2º ano'),
  ('stu-6', 'João Batista de Castro', 'joao.castro@seta.edu.br', 'aluno', '2024-0203', 'Bacharel em Teologia', '2º ano')
ON CONFLICT (id) DO NOTHING;

-- Inserir Disciplinas do SETA (Pontuação Somada Total de 10,0 pts)
INSERT INTO seta_disciplines (id, code, name, professor_id, course, workload, schedule, passing_grade, max_absences, recovery_rule, grades_closed, evaluations) VALUES
  ('disc-1', 'TEO-101', 'Teologia Sistemática I', 'prof-1', 'Bacharel em Teologia', 60, 'Segundas, 19h30', 7.0, 15, 'substitui_menor', false,
   '[{"id":"d1-p1","name":"Prova 1","type":"prova","maxPoints":3.0},{"id":"d1-t1","name":"Trabalho exegético (Rm 8)","type":"trabalho","maxPoints":3.0},{"id":"d1-p2","name":"Prova final","type":"prova","maxPoints":4.0}]'::jsonb),
  ('disc-5', 'TEO-110', 'Apologética Cristã', 'prof-1', 'Bacharel em Teologia', 45, 'Quartas, 19h30', 7.0, 11, 'soma_complementar', false,
   '[{"id":"d5-s1","name":"Seminário em grupo","type":"seminario","maxPoints":4.0},{"id":"d5-p1","name":"Prova dissertativa","type":"prova","maxPoints":5.0},{"id":"d5-pa","name":"Participação em sala","type":"participacao","maxPoints":1.0}]'::jsonb),
  ('disc-2', 'BIB-202', 'Hermenêutica e Exegese do Novo Testamento', 'prof-2', 'Bacharel em Teologia', 60, 'Terças, 19h30', 7.0, 15, 'substitui_menor', false,
   '[{"id":"d2-t1","name":"Exegese de perícope","type":"trabalho","maxPoints":4.0},{"id":"d2-s1","name":"Seminário bíblico","type":"seminario","maxPoints":3.0},{"id":"d2-pa","name":"Participação e presença","type":"presenca","maxPoints":3.0}]'::jsonb),
  ('disc-3', 'HIS-105', 'História da Igreja e Reforma Protestante', 'prof-3', 'Bacharel em Teologia', 45, 'Quintas, 19h30', 7.0, 11, 'prova_substitutiva', false,
   '[{"id":"d3-p1","name":"Prova teórica","type":"prova","maxPoints":5.0},{"id":"d3-f1","name":"Fichamento histórico","type":"fichamento","maxPoints":2.5},{"id":"d3-r1","name":"Resenha — As Institutas","type":"resenha","maxPoints":2.5}]'::jsonb),
  ('disc-4', 'PAS-301', 'Teologia Pastoral e Aconselhamento', 'prof-4', 'Bacharel em Teologia', 45, 'Sextas, 19h30', 7.0, 11, 'substitui_menor', true,
   '[{"id":"d4-c1","name":"Estudo de caso clínico/pastoral","type":"estudo_caso","maxPoints":5.0},{"id":"d4-t1","name":"Relatório de estágio ministerial","type":"trabalho","maxPoints":4.0},{"id":"d4-pr","name":"Pontualidade e presença","type":"presenca","maxPoints":1.0}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Inserir Notas das Turmas (Pontuações Somadas)
INSERT INTO seta_grades (discipline_id, student_id, scores, recovery, absences) VALUES
  ('disc-1', 'stu-1', '{"d1-p1": 2.6, "d1-t1": 2.4, "d1-p2": 3.2}'::jsonb, NULL, 2),
  ('disc-1', 'stu-2', '{"d1-p1": 1.8, "d1-t1": 1.8, "d1-p2": 2.0}'::jsonb, 3.5, 4),
  ('disc-1', 'stu-3', '{"d1-p1": 2.9, "d1-t1": 2.8, "d1-p2": 3.8}'::jsonb, NULL, 0),
  ('disc-1', 'stu-4', '{"d1-p1": 1.2, "d1-t1": 1.5, "d1-p2": 1.6}'::jsonb, NULL, 6),
  ('disc-1', 'stu-5', '{"d1-p1": 2.2, "d1-t1": 2.3, "d1-p2": 3.1}'::jsonb, NULL, 1),
  ('disc-1', 'stu-6', '{"d1-p1": 2.5, "d1-t1": 2.7, "d1-p2": 3.4}'::jsonb, NULL, 3)
ON CONFLICT (discipline_id, student_id) DO NOTHING;

-- Inserir Trabalhos
INSERT INTO seta_assignments (id, discipline_id, evaluation_id, title, description, due_date, submissions) VALUES
  ('ass-1', 'disc-1', 'd1-t1', 'Trabalho exegético: Romanos 8:28-39',
   'Ensaio exegético-teológico de 4 a 6 páginas sobre o contexto paulino, análise dos termos gregos e aplicação pastoral. Vale até 3,0 pontos na soma final.',
   '2026-10-28',
   '[{"studentId":"stu-1","fileName":"Exegese_Rm8_LucasMendes.pdf","fileSize":"2,4 MB","submittedAt":"2026-10-26T14:32","grade":2.4,"feedback":"Boa fundamentação no texto grego e diálogo com Calvino e Agostinho."},{"studentId":"stu-2","fileName":"Exegese_Rm8_Amanda.docx","fileSize":"1,1 MB","submittedAt":"2026-10-27T19:15","grade":1.8,"feedback":"Bom resumo temático, mas faltou a análise textual do v. 29."},{"studentId":"stu-3","fileName":"Ensaio_Soteriologia_Gabriel.pdf","fileSize":"3,2 MB","submittedAt":"2026-10-25T10:05","grade":2.8,"feedback":"Trabalho primoroso: exegese rica, referências sólidas e redação impecável."}]'::jsonb),
  ('ass-2', 'disc-5', 'd5-s1', 'Roteiro do seminário: o argumento cosmológico',
   'Entregar o roteiro escrito do seminário (3 a 5 páginas). Vale até 4,0 pontos na soma da disciplina.',
   '2026-11-18', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Inserir Aulas e Apostilas
INSERT INTO seta_lessons (id, discipline_id, module, title, date, duration, kind, url, summary, materials) VALUES
  ('les-1', 'disc-1', 'Módulo 1 · Teologia Própria', 'Atributos incomunicáveis de Deus', '2026-10-05', '1h35', 'gravada', '',
   'Asseidade, imutabilidade, eternidade e onipresença de Deus na teologia reformada clássica.',
   '[{"name":"Apostila — Módulo 1.pdf","size":"4,8 MB"},{"name":"Slides — Aula 1.pdf","size":"3,1 MB"}]'::jsonb),
  ('les-4', 'disc-1', 'Módulo 2 · Soteriologia', 'Debate ao vivo: Romanos 8 e a segurança da salvação', '2026-11-09', '19h30', 'ao_vivo', 'https://meet.google.com/',
   'Encontro síncrono para discussão dos ensaios e preparação para a prova final.', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Inserir Avisos
INSERT INTO seta_announcements (id, date, author, title, content, important) VALUES
  ('ann-1', '2026-11-01', 'Secretaria Acadêmica', 'Prazo para lançamento dos pontos e recuperação',
   'Lembramos aos docentes que a pontuação somada mínima para aprovação direta é 7,0 pontos. Alunos que somarem menos de 7,0 devem ser convocados para recuperação até 15/11.', true)
ON CONFLICT (id) DO NOTHING;
