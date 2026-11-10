# 📊 Estudo Comparativo de Custos e Infraestrutura
## Supabase (BaaS) vs. Servidor Próprio (VPS / Self-Hosted)
**Projeto:** Portal SETA — Seminário Teológico Aliança  
**Critério:** Máxima eficiência de custo-benefício, confiabilidade e sustentabilidade a longo prazo  
**Data da Análise:** Novembro / 2026  

---

## 🧭 1. Resumo Executivo (Conclusão Direta)

Se você não quer ler todo o relatório técnico agora, aqui está o resumo prático sem rodeios:

1. **Para o momento atual (até 100 a 150 alunos):**  
   * **Vencedor absoluto em custo-benefício:** **Supabase Plano Gratuito (R$ 0,00/mês)**.  
   * O banco de dados do Portal SETA (alunos, notas, presenças e chamadas) consome menos de **20 MB** de texto. O plano gratuito oferece **500 MB** de banco de dados e **1 GB** de arquivos de trabalhos. Não faz nenhum sentido gastar dinheiro com infraestrutura nessa fase inicial.

2. **Para a fase de crescimento (quando precisar de mais espaço ou garantia de 0 pausas):**  
   * **Se houver alguém com conhecimento técnico de Linux/Docker com tempo livre:**  
     Uma **VPS Própria (Hetzner ou Lightsail)** com **Coolify / Docker** sai por aproximadamente **R$ 30,00 a R$ 55,00 por mês**, economizando dinheiro direto.
   * **Se a equipe for focada na administração do seminário (sem TI dedicada):**  
     O **Supabase Pro ($25/mês ≈ R$ 140,00/mês)** se paga rapidamente, pois inclui backups diários automáticos, monitoramento 24/7, zero manutenção de sistema operacional e suporte direto.
   * **Servidor Físico Local na Igreja/Seminário:**  
     **Não recomendado**. O gasto com energia elétrica contínua (R$ 35 - 60/mês), nobreak, IP fixo e o risco de queda de internet residencial/comercial no fim de semana tornam o servidor físico mais caro e menos confiável que uma VPS na nuvem.

---

## 🔍 2. Raio-X do Supabase

O Supabase é uma plataforma de *Backend-as-a-Service* (BaaS) gerenciada que roda PostgreSQL oficial na infraestrutura da AWS.

### Plano Gratuito (Free Tier)
* **Custo:** **R$ 0,00 / mês**
* **O que está incluso:**
  * **Banco PostgreSQL Dedicado:** 500 MB (suficiente para mais de 100.000 registros de notas e alunos).
  * **Storage de Arquivos:** 1 GB (armazena cerca de 500 a 1.000 PDFs de trabalhos).
  * **Largura de Banda (Transferência):** 2 GB por mês.
  * **Autenticação:** Até 50.000 usuários ativos por mês.
  * **Até 2 projetos ativos simultâneos.**
* **Pontos de Atenção (Gargalos do Free):**
  * *Pausa por inatividade:* Se o projeto ficar **7 dias consecutivos sem nenhuma requisição**, o Supabase suspende o banco. Ele não apaga os dados; basta 1 clique no painel para reativar, mas isso pode gerar uma tela de erro se um aluno tentar entrar após as férias.
  * *Backups automáticos:* Não há restauração pontual no tempo (PITR) automática no Free; a Direção precisa exportar o `.sql` manualmente periodicamente (o que já ensinamos a fazer).

---

### Plano Pro
* **Custo:** **$25,00 / mês** (aproximadamente **R$ 135,00 a R$ 145,00 / mês**, dependendo do câmbio e IOF).
* **O que está incluso:**
  * **Sem pausamento de projeto:** Fica online 24 horas por dia, 365 dias por ano.
  * **Banco PostgreSQL:** 8 GB inclusos (expansível automaticamente a $0.125 por GB adicional).
  * **Storage de Arquivos:** 100 GB inclusos (milhares de apostilas, PDFs e fotos).
  * **Transferência (Egress):** 250 GB por mês.
  * **Backups Automáticos Diários:** Histórico retido por 7 dias com restauração em 1 clique.
  * **Crédito de Compute:** $10 inclusos para instâncias Micro ou Small dedicadas.
  * **Suporte técnico oficial por e-mail com SLA.**

---

## 🖥️ 3. Raio-X do Servidor Próprio (Self-Hosted)

Montar um servidor próprio significa alugar uma máquina virtual (VPS) na nuvem ou colocar uma máquina física na sede da instituição e instalar o ecossistema (PostgreSQL, Docker, Supabase Self-Hosted ou Coolify).

### Opção A: VPS na Nuvem (A forma correta de ter servidor próprio)
Para rodar o ecossistema completo do Supabase via Docker (que contém PostgreSQL, GoTrue/Auth, Kong API Gateway, PostgREST, Storage S3 e Painel Studio), os requisitos mínimos são:
* **Mínimo:** 2 vCPUs e 4 GB de Memória RAM (com 2 GB de RAM o Supabase Docker costuma sofrer com *Out-Of-Memory* e travar o banco).
* **Disco:** 40 GB a 80 GB SSD NVMe.

#### Valores Médios de Mercado para essa Configuração:

| Provedor | Especificação | Custo Mensal (USD / EUR) | Custo Mensal (BRL estimado) | Localização do Datacenter |
| :--- | :--- | :--- | :--- | :--- |
| **Hetzner Cloud (CX22)** | 2 vCPU, 4 GB RAM, 40 GB NVMe | € 3,79 a € 4,50 / mês | **~ R$ 24,00 a R$ 28,00** | Alemanha / Finlândia / EUA |
| **AWS Lightsail** | 2 vCPU, 2 GB RAM, 60 GB SSD | $ 10,00 / mês | **~ R$ 56,00** | São Paulo (Brasil) ou EUA |
| **DigitalOcean / Linode** | 1 vCPU, 2 GB RAM, 50 GB SSD | $ 12,00 / mês | **~ R$ 68,00** | EUA / Europa |
| **Contabo (Cloud VPS S)** | 4 vCPU, 6 GB RAM, 100 GB NVMe | $ 5,50 / mês | **~ R$ 32,00** | EUA / Europa |
| **Hostinger VPS (KVM 2)** | 2 vCPU, 8 GB RAM, 100 GB NVMe | ~ R$ 39,99 / mês | **~ R$ 40,00** | São Paulo / EUA |

> **Nota:** Para o Portal SETA, se a opção for servidor próprio em VPS, ferramentas modernas como **Coolify** (uma alternativa open-source auto-hospedada ao Vercel/Supabase) ou uma instalação limpa de **PostgreSQL 16 + PostgREST + MinIO** são muito mais leves do que subir todos os 12 containers do Supabase completo.

---

### Opção B: Servidor Físico Local (Computador ligado na Igreja/Seminário)
Muitas pessoas pensam: *"Temos um computador parado na secretaria, podemos usar ele de servidor e pagar R$ 0 de hospedagem!"*.  
Vejamos a conta real:

1. **Consumo de Energia Elétrica:**
   * Um computador convencional consumindo 60W ligado 24h por dia gasta cerca de **43,2 kWh/mês**.
   * Com a tarifa média brasileira de energia (R$ 0,85 a R$ 1,10 por kWh com bandeiras), o custo na conta de luz é de **R$ 37,00 a R$ 48,00 todo mês**.
2. **Nobreak com Bateria:**
   * Essencial para o banco de dados não corromper quando houver queda de energia. Um nobreak senoidal simples custa entre **R$ 600,00 e R$ 1.200,00**.
3. **Internet e Conectividade:**
   * Conexões residenciais e comerciais padrão não têm IP fixo e possuem oscilações frequentes de DNS e upload.
   * Se a internet do seminário cair no domingo à noite durante a entrega de trabalhos dos alunos, **ninguém consegue enviar nada nem acessar o boletim**.
4. **Segurança Física e Calor:**
   * Risco de desligamento acidental por limpeza, picos de tensão durante tempestades e superaquecimento se não houver ar-condicionado contínuo.

*Veredito da Máquina Física Local:* **Custo financeiro igual ou superior a uma VPS, com risco operacional infinitamente maior.**

---

## ⚖️ 4. Os "Custos Ocultos" do Servidor Próprio

O valor da VPS (ex: R$ 30/mês) parece muito mais barato que os R$ 140/mês do Supabase Pro. Porém, para ter uma decisão justa, é preciso considerar o que está incluído em cada um:

| Tarefa de Infraestrutura | Supabase Gerenciado | Servidor Próprio (VPS) |
| :--- | :--- | :--- |
| **Atualizações de Segurança do SO (Linux)** | Feito automaticamente pelo provedor sem downtime | Manual: você precisa rodar `apt update && apt upgrade` |
| **Certificados SSL (HTTPS)** | 100% automático e renovado sozinho | Requer configurar Let's Encrypt / Certbot / Nginx |
| **Rotina de Backup Diário** | Nativo com restauração em 1 clique | Manual: criar scripts bash que salvam o `.dump` em outro local |
| **Armazenamento Seguro do Backup** | Incluso em storage redundante da AWS S3 | Custo adicional de um bucket S3/Backblaze B2 (mínimo $1 a $5/mês) |
| **Proteção contra Invasão / Firewall** | WAF corporativo AWS e Cloudflare embutidos | Manual: configurar UFW, fail2ban e portas de acesso |
| **Se o banco travar no fim de semana** | O orquestrador reinicia o container automaticamente | Alguém precisa entrar por SSH via terminal para consertar |
| **Tempo humano estimado de manutenção** | **0 a 15 minutos / mês** | **2 a 5 horas / mês** |

---

## 📈 5. Simulação Financeira para o Portal SETA (3 Cenários Reais)

### Cenário 1: Atual (Até 100 alunos — Turmas 2026 e 2027)
* **Demanda:** Acessos diários moderados, envio de 5 a 10 trabalhos em PDF por semestre por aluno, boletim e comunicados.
* **Opção Recomendada:** **Supabase Plano Gratuito**.
  * Custo de Banco: **R$ 0,00**
  * Custo de Hospedagem do Site (Vercel): **R$ 0,00**
  * **Custo Total Mensal: R$ 0,00**
* *Como evitar a pausa de 7 dias no Free:* Basta o próprio uso normal de professores e alunos ou configurar um agendamento simples (cron job gratuito como cron-job.org ou UptimeRobot) que faz 1 ping por semana na URL.

---

### Cenário 2: Seminário em Expansão (100 a 500 alunos)
* **Demanda:** Matérias arquivadas acumuladas, histórico de notas de anos anteriores, centenas de uploads de trabalhos, necessidade de garantia contratual de 99.9% de uptime.
* **Comparação direta:**
  * **Com Supabase Pro:** **~ R$ 140,00 / mês**.  
    *Vantagem:* Zero trabalho técnico para a secretaria. Tranquilidade total.
  * **Com VPS Própria (Hetzner 4GB ou Hostinger KVM 2 com Coolify):** **~ R$ 35,00 a R$ 45,00 / mês**.  
    *Vantagem:* Economia de aproximadamente **R$ 100,00 por mês (R$ 1.200,00 por ano)**.  
    *Requisito:* Uma pessoa com conhecimento básico de Docker para configurar uma vez e verificar os backups mensalmente.

---

### Cenário 3: Grande Instituição (Mais de 500 alunos + Cursos EAD em Vídeo)
* **Demanda:** Terabytes de vídeoaulas gravadas, centenas de acessos simultâneos em horários de pico de prova.
* **Comparação:**
  * No Supabase, o custo de armazenamento de vídeos pesados ficaria caro (vídeos não devem ficar no banco de dados).
  * O correto seria colocar vídeos no **YouTube (Não listado)** ou **Cloudflare Stream / Bunny.net** (que custa centavos por GB), mantendo apenas o banco de dados no Supabase Pro ou na VPS.

---

## 🏆 6. Tabela Comparativa de Decisão

| Critério de Avaliação | Supabase Free | Supabase Pro | Servidor Próprio (VPS) |
| :--- | :---: | :---: | :---: |
| **Custo Mensal Direto** | **R$ 0,00** ⭐ | ~ R$ 140,00 | ~ R$ 30,00 a R$ 50,00 |
| **Complexidade de Instalação** | Nenhuma (Pronto) | Nenhuma (Pronto) | Média / Alta (Linux/Docker) |
| **Esforço de Manutenção** | Zero | Zero | 2 a 5h mensais |
| **Risco de Pausa por Inatividade** | Existe (após 7 dias) | Zero | Zero |
| **Backups Automáticos** | Manual (via export) | Nativo (Diário 7d) | Requer Script Próprio |
| **Desempenho para 100 Alunos** | Excelente | Excelente | Excelente |
| **Melhor para quem não é programador** | Sim | Sim ⭐ | Não |
| **Economia a Longo Prazo (>200 alunos)** | Limitado | Moderado | Máxima ⭐ |

---

## 🎯 7. O Plano de Ação Recomendado (Passo a Passo Inteligente)

Para não gastar dinheiro à toa e garantir que o Portal SETA funcione com qualidade profissional:

### Fase 1: Comece com o Supabase Gratuito (Hoje)
* **Gasto:** **R$ 0,00**.
* O projeto já está 100% configurado para o Supabase com o arquivo `supabase_schema.sql`.
* Atende perfeitamente todas as turmas atuais de Teologia, lançamento de notas, envio de trabalhos e controle de presenças.
* Crie uma rotina quinzenal simples: a Direção entra no painel do Supabase, vai em **Database** → **Backup** e clica em baixar a cópia de segurança para o Google Drive.

### Fase 2: O momento do "Gatilho de Decisão"
Você só precisará pensar em pagar quando acontecer uma de duas coisas:
1. O banco atingir **400 MB** de uso (o que levará muito tempo, pois dados de texto são levíssimos).
2. O seminário entrar em recesso de férias e a pausa de 7 dias começar a incomodar.

### Fase 3: A Escolha Definitiva (Quando a Fase 2 chegar)
* **Escolha o Supabase Pro ($25/mês):** Se o seminário preferir colocar esse valor no orçamento mensal institucional para ter garantia de suporte, sem precisar que ninguém se preocupe com manutenção de servidor.
* **Escolha uma VPS Própria (Hetzner / Hostinger com Coolify):** Se você ou alguém da equipe gostar de gerenciar servidores e preferir economizar os R$ 1.200/ano, rodando o banco próprio e tendo controle total sobre a máquina.
