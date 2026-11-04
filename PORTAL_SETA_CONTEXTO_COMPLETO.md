# 🏛️ CONTEXTO MESTRE E HISTÓRICO COMPLETO — PORTAL SETA
> **Instrução para o Antigravity no PC de Casa:**  
> Ao iniciar uma nova conversa no PC de casa, envie:  
> *"Estou continuando o desenvolvimento do Portal SETA no meu PC de casa. Leia o arquivo PORTAL_SETA_CONTEXTO_COMPLETO.md na raiz e continue o suporte de onde paramos."*

---

## 📌 1. Visão Geral e Identidade do Projeto
* **Nome Oficial da Instituição:** Seminário Teológico Aliança (SETA)
* **Nome Oficial da Plataforma:** Portal SETA
* **Curso Principal:** Bacharel em Teologia
* **Lema Oficial:** *"Conhecer · Servir · Glorificar"*
* **Campanha Vigente:** Matrículas Abertas — Turma 2027 (com turmas 2026 ativas)
* **Contatos da Secretaria:** (24) 99906-5611 | (24) 99837-2729
* **Paleta de Cores Oficial:**
  * Fundo Noturno / Navy Profundo: `#070d1e` e `#0b132b`
  * Dourado Institucional / Ouro Nobre: `#d4af37`, `#b8860b`, `#f3e5ab`
  * Textos: Slate claro (`#f1f5f9` / `#ffffff`) e acentos dourados
* **Tipografia:** Serifada clássica (`Cinzel` / `Cinzel Decorative` / serif) para títulos e sans-serif limpa para textos.
* **Símbolo Oficial:** Cruz Céltica em anel dourado com a Pomba da Paz na base (extraído diretamente do cartaz oficial do SETA em `public/portal_seta_symbol.png` e `public/portal_seta_crest.jpg`, perfeitamente centralizado sem textos na logo).

---

## 🛠️ 2. Arquitetura Técnica e Repositório
* **Repositório GitHub:** `https://github.com/Zinnxs/seta-plataforma.git` (Branch: `main`)
* **Stack:** React 19, Vite, Tailwind CSS, Lucide React, Supabase JS Client (`@supabase/supabase-js`).
* **Hospedagem / Deploy:** Vercel (`seta-plataforma.vercel.app` ou similar).
* **Backup no Google Drive:** Pasta `Portal SETA` (ID: `1_Zj3cAC22pb96OoUvociviU-U-ibLZFv`) na conta `leonardojoseoliv@gmail.com`.

---

## 👥 3. Perfis de Usuário e Credenciais Padrão
1. **Direção Geral (Admin):**
   * **Login:** `admin@seta.com`
   * **Senha:** `setaadmin987`
   * **Permissões:** Acesso total — Gerenciamento de alunos e professores, diários de matérias, aprovação de recuperações, publicação e exclusão de avisos no Mural Oficial, configuração do banco de dados Supabase.
2. **Professor:**
   * **Login exemplo:** `carlos.teologia@seta.com`
   * **Senha padrão:** `seta123`
   * **Permissões:** Lançar notas/critérios, registrar aulas gravadas/ao vivo, cadastrar trabalhos com upload ou envio por e-mail, gerenciar presença.
3. **Aluno:**
   * **Login exemplo:** `marcos.aluno@seta.com`
   * **Senha padrão:** `seta123`
   * **Permissões:** Visualizar boletim em tempo real, enviar trabalhos para avaliação, assistir aulas e baixar apostilas, filtrar matérias concluídas/em andamento/futuras.

---

## 🗄️ 4. Banco de Dados e Sincronização Híbrida (Supabase + Local)
* **Arquivo SQL:** `supabase_schema.sql` na raiz do projeto (e na pasta `02_Banco_de_Dados_Supabase` do Google Drive).
* **Tabelas do Sistema:**
  * `seta_users`: Usuários (id, name, email, password, role, title, enrollment, course, year).
  * `seta_disciplines`: Matérias (id, code, name, professor_id, workload, passing_grade, recovery_rule, grades_closed, status).
  * `seta_grades`: Notas e faltas (discipline_id, student_id, scores JSONB, recovery, absences).
  * `seta_assignments`: Trabalhos (id, discipline_id, evaluation_id, title, description, due_date, submission_type, destination_email, submissions JSONB).
  * `seta_lessons`: Aulas e materiais (id, discipline_id, module, title, date, duration, kind, url, summary, materials JSONB).
  * `seta_announcements`: Mural de avisos da Direção (id, date, author, title, content, important).
  * `storage.buckets`: Bucket `seta-trabalhos` público (15MB por arquivo) para uploads de PDFs e documentos dos alunos.
* **Modo Híbrido:**
  * Se Supabase estiver conectado: sincroniza automaticamente em tempo real com PostgreSQL.
  * Se Supabase não estiver configurado: funciona perfeitamente em cache local do navegador (`localStorage`), sem quebrar nada.
  * A URL do Supabase possui sanitização automática para evitar erros de PostgREST `Invalid path specified in request URI.`.

---

## 🌟 5. Funcionalidades Recentes Implementadas
1. **Arquivo de Matérias (Separação por Status):**
   * As matérias agora possuem status: `em_andamento`, `concluida` e `futura`.
   * A Direção e os Professores podem arquivar matérias ou alterar seu status.
   * O Aluno pode alternar entre abas e marcar na hora do boletim quais matérias quer imprimir/exportar no boletim oficial, com recálculo dinâmico da média geral em tempo real.
2. **Cálculo de Pontos do Boletim Corrigido:**
   * Corrigido o bug onde aparecia `— / 10`. O boletim agora exibe os pontos acumulados e a nota final somada, respeitando os critérios de avaliação definidos pelo professor (Exames, Seminários, Provas, Trabalhos).
3. **Mural de Avisos Controlado pela Direção:**
   * Apenas a Direção pode criar, editar ou excluir comunicados oficiais no mural.
   * Mensagem oficial de lançamento do Portal SETA redigida e fixada no mural.
4. **Formulário Externo de Cadastro de Alunos (Google Forms):**
   * Decisão: Feito via **Google Forms externo** (não diretamente no site) para que os novos alunos respondam sem precisar de login.
   * Planilha de controle criada no Google Drive da instituição:  
     `https://docs.google.com/spreadsheets/d/1hxeGHZYctcLHbaxGgAN2wkE9QIYUwlnRehTRKNc6UQo/edit`
   * Campos do forms: Nome Completo, E-mail, Senha Desejada, Confirmação de Senha, WhatsApp, Turma 2027.
   * Guia completo e script automático salvo em `docs/Formulario_Cadastro_Alunos_Google_Forms.md`.
   * Fluxo: Aluno responde o Forms → Direção visualiza na planilha → Direção entra em `Alunos e Professores` no Portal SETA → clica em `+ Novo Aluno` → cadastra manualmente.
5. **Logo Oficial e Estilo Visual:**
   * Símbolo centralizado perfeito da cruz céltica com pomba (`/portal_seta_symbol.png` e `/portal_seta_crest.jpg`).

---

## 🚀 6. Como Rodar no Computador de Casa
1. Clonar repositório:
   ```bash
   git clone https://github.com/Zinnxs/seta-plataforma.git
   cd seta-plataforma
   ```
2. Instalar dependências:
   ```bash
   npm install
   ```
3. Iniciar servidor local:
   ```bash
   npm run dev
   ```
4. Build de produção para testes:
   ```bash
   npm run build
   ```
