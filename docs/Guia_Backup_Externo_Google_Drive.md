# 💾 Guia de Backup Externo Automatizado para o Google Drive
## Arquitetura de Continuidade de Negócio e Disaster Recovery — Portal SETA
**Responsável Técnico:** Equipe de TI  
**Instituição:** Seminário Teológico Aliança (SETA)  
**Destino no Google Drive:** Pasta `Portal SETA` → `02_Banco_de_Dados_Supabase` (ID: `1EzSi1xvv-UyhHTsrn3N4JqXzpNJ1LoIr`)

---

## 🎯 1. Visão Geral (Estratégia 3-2-1 de TI)

Como você é de TI e ficará responsável pela integridade do sistema, implementamos a regra padrão de segurança **3-2-1**:
* **3 Cópias dos dados:** 1 no banco ativo (Supabase), 1 em arquivo local (`backups/`) e 1 no Google Drive.
* **2 Mídias diferentes:** Banco relacional PostgreSQL + Armazenamento de arquivos JSON/SQL.
* **1 Cópia externa e independente (Offsite):** Armazenada no Google Drive corporativo da instituição, fora do ambiente do Supabase.

---

## ⚡ 2. Método 1: Backup Local em 1 Comando (PowerShell / Node.js)

Criamos scripts nativos já integrados ao repositório para você rodar no terminal quando quiser gerar uma cópia de segurança imediata:

### Opção A: Pelo NPM
```bash
npm run backup:drive
```
ou apenas para extrair localmente:
```bash
npm run backup
```

### Opção B: Direto pelo PowerShell
```powershell
.\scripts\backup-to-drive.ps1
```

### O que o script faz por debaixo dos panos:
1. Conecta ao Supabase usando as credenciais do seu `.env` ou `.env.local`.
2. Faz o dump de todas as tabelas:
   * `seta_users` (Alunos, professores e direção com senhas e matrículas)
   * `seta_disciplines` (Diários de matérias, status, critérios de notas)
   * `seta_grades` (Boletins, notas somadas, recuperações e faltas)
   * `seta_assignments` (Trabalhos cadastrados e histórico de entregas)
   * `seta_lessons` (Aulas gravadas e links de materiais)
   * `seta_announcements` (Mural de comunicados oficiais)
   * `seta_pre_registrations` (Respostas do formulário de novos alunos)
3. Gera dois arquivos na pasta `backups/`:
   * `backup_seta_YYYY-MM-DD_HH-mm-ss.json` (Estrutura legível para auditoria e migração fácil)
   * `backup_seta_YYYY-MM-DD_HH-mm-ss.sql` (Script SQL com instruções `INSERT INTO ... ON CONFLICT DO UPDATE` pronto para restaurar)
4. Faz o upload automático desses arquivos direto para a pasta **`02_Banco_de_Dados_Supabase`** no Google Drive da instituição.

---

## ☁️ 3. Método 2: Automação 100% em Nuvem com GitHub Actions (Sem PC Ligado)

Já deixamos configurado no repositório o fluxo do **GitHub Actions** em:  
📄 `.github/workflows/backup-supabase-drive.yml`

### Como funciona:
* **Agendamento Automático:** Roda **todos os dias às 00:00** (Horário de Brasília) nos servidores do GitHub.
* **Disparo Manual:** Você pode entrar no GitHub do projeto, clicar na aba **Actions** → **Backup Supabase para o Google Drive** → **Run workflow**.
* **Retenção no GitHub:** Guarda o arquivo de backup nos *Artifacts* do próprio GitHub por **30 dias**.

### Como ativar os Secrets no GitHub (Único passo necessário):
1. Acesse o seu repositório no GitHub: `https://github.com/Zinnxs/seta-plataforma`.
2. Vá em **Settings** → **Secrets and variables** → **Actions**.
3. Adicione os seguintes *Repository Secrets*:
   * `VITE_SUPABASE_URL`: URL do seu projeto (ex: `https://yqgqomvz...supabase.co`)
   * `VITE_SUPABASE_ANON_KEY`: Sua chave anônima ou `SUPABASE_SERVICE_ROLE_KEY` (chave de serviço)

---

## 🛠️ 4. Método 3: Dump Nativo com `pg_dump` (Linha de Comando de DBA)

Se você preferir usar as ferramentas nativas do PostgreSQL (`pg_dump` e `pg_restore`), o Supabase fornece uma string direta de conexão PostgreSQL.

### 1. Pegar a string de conexão no Supabase:
No painel do Supabase, vá em **Project Settings** → **Database** → **Connection string** (selecione a aba **URI**).  
Ela terá o formato:
```text
postgresql://postgres.[REF_DO_PROJETO]:[SUA_SENHA_DO_BANCO]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres
```

### 2. Comando para gerar o dump compactado:
```bash
pg_dump "postgresql://postgres.[REF]:[SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres" -F c -b -v -f "backup_seta_$(date +%F).dump"
```

### 3. Como restaurar em caso de desastre:
Para restaurar esse dump em qualquer outro banco PostgreSQL (ou no próprio Supabase):
```bash
pg_restore -v -d "postgresql://postgres.[NOVO_BANCO]:[SENHA]@[HOST]:[PORTA]/postgres" "backup_seta_2026-11-10.dump"
```

---

## 🚀 5. Método 4: Sincronização Contínua com Rclone (Padrão Ouro de TI)

O **Rclone** é a ferramenta de terminal mais respeitada no mundo de TI para sincronizar arquivos locais ou servidores com o Google Drive.

### Configuração em 2 minutos:
1. Baixe o Rclone (`winget install Rclone.Rclone` no Windows ou `apt install rclone` no Linux).
2. Execute:
   ```bash
   rclone config
   ```
3. Escolha: `n` (New remote) → Nome: `gdrive` → Tipo: `drive` (Google Drive).
4. O navegador abrirá para você autorizar o Google Drive do SETA (`leonardojoseoliv@gmail.com`).
5. **Comando de backup com 1 linha:**
   ```bash
   rclone copy ./backups gdrive:"Portal SETA/02_Banco_de_Dados_Supabase" -v
   ```

Você pode colocar essa linha no seu Agendador de Tarefas do Windows (Task Scheduler) ou em uma `crontab` do Linux.

---

## 🔄 6. Procedimento de Disaster Recovery (Como Restaurar o Sistema)

Se algum dia alguém apagar uma tabela acidentalmente ou você quiser migrar para um servidor próprio:

1. Acesse o Google Drive na pasta **`02_Banco_de_Dados_Supabase`**.
2. Baixe o arquivo `backup_seta_YYYY-MM-DD.sql` mais recente.
3. Se estiver usando o **Supabase**:
   * Abra o painel do Supabase → vá em **SQL Editor**.
   * Abra o arquivo `.sql` baixado, cole o conteúdo e clique em **Run**.
   * Todos os dados, usuários, notas e matrículas serão restaurados exatamente como estavam.
4. Se estiver migrando para um **PostgreSQL próprio (VPS/Docker)**:
   * Execute primeiro o esquema: `psql -U postgres -d seta < supabase_schema.sql`
   * Em seguida, execute a carga: `psql -U postgres -d seta < backup_seta_YYYY-MM-DD.sql`
   * O sistema estará 100% no ar em menos de 2 minutos.
