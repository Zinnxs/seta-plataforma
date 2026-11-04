# 📋 Formulário Externo de Cadastro de Alunos (Google Forms) — Portal SETA
**Seminário Teológico Aliança (SETA)**  
*Bacharel em Teologia · Turma 2027 / 2026*

Este documento contém o modelo oficial pronto para ser utilizado no **Google Forms** para a coleta de dados de novos alunos, a planilha de controle já criada no Google Drive da instituição e o procedimento padrão para a **Direção realizar o cadastro manual no Portal SETA**.

---

## 🔗 1. Planilha de Controle Criada no Google Drive

A planilha de respostas e controle da Direção já foi criada e está salva na pasta oficial **Portal SETA** no Google Drive:

* 📄 **Acesse a Planilha da Direção:**  
  [Planilha: Portal SETA — Formulário de Cadastro de Alunos (Controle da Direção)](https://docs.google.com/spreadsheets/d/1hxeGHZYctcLHbaxGgAN2wkE9QIYUwlnRehTRKNc6UQo/edit)

### Colunas Configuradas na Planilha:
1. `Carimbo de Data/Hora` (Registrado automaticamente pelo Forms)
2. `Nome Completo do Aluno` (Nome civil para o boletim e histórico)
3. `E-mail de Acesso (Login)` (E-mail institucional/pessoal que o aluno usará para entrar)
4. `Senha Escolhida pelo Aluno` (Senha definida pelo aluno para acesso)
5. `Telefone / WhatsApp` (Para comunicação da secretaria acadêmica)
6. `Turma / Ano` (ex: *Turma 2027*)
7. `Cidade / UF` (Origem do aluno)
8. `Status no Portal SETA` (*Pendente* / *Cadastrado no Portal*)
9. `Matrícula Gerada` (ex: `SET-2027-001`)
10. `Cadastrado por` (ex: *Direção Geral*)
11. `Observações`

---

## ⚡ 2. Criação Rápida no Google Forms

### Opção A: Criar Manualmente no [forms.new](https://forms.new) (Recomendado)

Acesse **[forms.new](https://forms.new)** no seu navegador e copie e cole os campos abaixo:

#### 📌 Cabeçalho do Formulário
* **Título do Formulário:**
  ```text
  Portal SETA — Cadastro Acadêmico de Alunos
  ```
* **Descrição do Formulário:**
  ```text
  Seminário Teológico Aliança (SETA)
  Curso: Bacharel em Teologia | "Conhecer · Servir · Glorificar"

  Prezado(a) aluno(a), seja bem-vindo(a) ao ambiente acadêmico do Seminário Teológico Aliança!

  Por favor, preencha as informações abaixo com atenção. Seus dados serão enviados diretamente à Direção Geral para a emissão da sua matrícula e liberação do seu acesso ao Portal SETA (boletim, aulas, materiais e notas).

  📞 Secretaria Acadêmica / WhatsApp: (24) 99906-5611 | (24) 99837-2729
  ```

---

#### 📝 Campos e Perguntas do Formulário

##### Pergunta 1: Nome Completo
* **Tipo:** Resposta curta
* **Obrigatória:** Sim [x]
* **Descrição/Dica:** *Digite seu nome completo exatamente como constará no boletim oficial.*

##### Pergunta 2: E-mail Principal (Login no Portal)
* **Tipo:** Resposta curta
* **Obrigatória:** Sim [x]
* **Validação de resposta:** Texto → E-mail
* **Descrição/Dica:** *Este será o seu e-mail de acesso ao Portal SETA.*

##### Pergunta 3: Senha de Acesso Desejada
* **Tipo:** Resposta curta
* **Obrigatória:** Sim [x]
* **Descrição/Dica:** *Crie uma senha para entrar no sistema (mínimo de 6 caracteres). Guarde esta senha.*

##### Pergunta 4: Confirmação da Senha
* **Tipo:** Resposta curta
* **Obrigatória:** Sim [x]
* **Descrição/Dica:** *Digite novamente a mesma senha para confirmação.*

##### Pergunta 5: Telefone com WhatsApp
* **Tipo:** Resposta curta
* **Obrigatória:** Sim [x]
* **Descrição/Dica:** *Exemplo: (24) 99999-9999 para receber avisos e suporte da secretaria.*

##### Pergunta 6: Turma / Ano Letivo
* **Tipo:** Múltipla escolha
* **Obrigatória:** Sim [x]
* **Opções:**
  * `Turma 2027 (Ingressante)`
  * `Turma 2026`
  * `Outra turma / Transferência`

##### Pergunta 7: Cidade e Estado (UF)
* **Tipo:** Resposta curta
* **Obrigatória:** Não [ ]
* **Descrição/Dica:** *Exemplo: Volta Redonda / RJ*

##### Pergunta 8: Igreja / Denominação
* **Tipo:** Resposta curta
* **Obrigatória:** Não [ ]
* **Descrição/Dica:** *Comunidade ou congregação de membresia.*

---

#### ⚙️ Configurações Recomendadas no Google Forms
1. Na aba **Configurações**:
   * **Respostas:**
     * *Coletar endereços de e-mail:* Pode deixar ativado ou desativado (já pedimos o e-mail no formulário).
     * *Permitir edição da resposta:* Ativado (caso o aluno queira corrigir o telefone ou e-mail).
   * **Apresentação:**
     * *Mensagem de confirmação:*
       ```text
       Sua solicitação de cadastro foi enviada com sucesso à Direção do Seminário Teológico Aliança! 
       
       A secretaria efetuará seu cadastro no Portal SETA e você poderá acessar com o e-mail e a senha informados. Dúvidas: (24) 99906-5611.
       ```
2. Na aba **Respostas**:
   * Clique no ícone verde do Google Planilhas (**Vincular ao Planilhas**).
   * Selecione **"Selecionar planilha existente"** e aponte para a planilha **"Portal SETA — Formulário de Cadastro de Alunos (Controle da Direção)"**.

---

### Opção B: Criação Automática via Google Apps Script (1 Clique)

Se preferir gerar o formulário de forma 100% automática em seu Google Drive:
1. Acesse **[script.new](https://script.new)**.
2. Apague o código padrão e cole o script abaixo:
3. Clique em **Executar**.

```javascript
function criarFormularioPortalSETA() {
  var form = FormApp.create('Portal SETA — Cadastro Acadêmico de Alunos');
  
  form.setDescription(
    'Seminário Teológico Aliança (SETA)\n' +
    'Curso: Bacharel em Teologia | "Conhecer · Servir · Glorificar"\n\n' +
    'Prezado(a) aluno(a), preencha as informações abaixo para que a Direção Acadêmica realize a ativação da sua matrícula oficial e libere seu acesso ao Portal SETA.\n\n' +
    'Secretaria Acadêmica / WhatsApp: (24) 99906-5611 | (24) 99837-2729'
  );
  
  form.setConfirmationMessage(
    'Sua solicitação de cadastro foi enviada com sucesso à Direção do Seminário Teológico Aliança!\n\n' +
    'A secretaria efetuará seu cadastro no Portal SETA e você poderá acessar o sistema com o e-mail e senha informados.'
  );

  // 1. Nome Completo
  form.addTextItem()
    .setTitle('Nome Completo')
    .setHelpText('Informe seu nome completo conforme constará no boletim oficial.')
    .setRequired(true);

  // 2. E-mail
  var emailItem = form.addTextItem()
    .setTitle('E-mail Principal (Login no Portal)')
    .setHelpText('E-mail que você utilizará para entrar no Portal SETA.')
    .setRequired(true);
  var emailValidation = FormApp.createTextValidation().requireTextIsEmail().build();
  emailItem.setValidation(emailValidation);

  // 3. Senha de Acesso
  form.addTextItem()
    .setTitle('Senha de Acesso Desejada')
    .setHelpText('Crie a senha que você usará para acessar o sistema. Guarde esta senha.')
    .setRequired(true);

  // 4. Confirmação de Senha
  form.addTextItem()
    .setTitle('Confirmação da Senha')
    .setHelpText('Digite a mesma senha novamente para confirmação.')
    .setRequired(true);

  // 5. Telefone / WhatsApp
  form.addTextItem()
    .setTitle('Telefone com WhatsApp')
    .setHelpText('Ex: (24) 99999-9999 para suporte da secretaria acadêmica.')
    .setRequired(true);

  // 6. Turma / Ano
  var turmaItem = form.addMultipleChoiceItem()
    .setTitle('Turma / Ano Letivo')
    .setChoiceValues([
      'Turma 2027 (Ingressante)',
      'Turma 2026',
      'Outra turma / Transferência'
    ])
    .setRequired(true);

  // 7. Cidade e Estado
  form.addTextItem()
    .setTitle('Cidade e Estado (UF)')
    .setHelpText('Ex: Volta Redonda / RJ')
    .setRequired(false);

  // 8. Igreja / Denominação
  form.addTextItem()
    .setTitle('Igreja / Congregação')
    .setHelpText('Igreja onde congrega atualmente.')
    .setRequired(false);

  Logger.log('Formulário criado com sucesso!');
  Logger.log('Link para Editar: ' + form.getEditUrl());
  Logger.log('Link para Enviar aos Alunos: ' + form.getPublishedUrl());
}
```

---

## 👤 3. Passo a Passo: Como a Direção Realiza o Cadastro Manual no Portal SETA

Após os alunos responderem o formulário:

1. **Abra a Planilha de Respostas:**
   * Verifique as novas linhas com o **Nome**, **E-mail**, **Senha** e **Turma** preenchidos pelo aluno.

2. **Acesse o Portal SETA:**
   * Entre no sistema com a conta da Direção:
     * **E-mail:** `admin@seta.com`
     * **Senha:** `setaadmin987`

3. **Vá para a Tela de Alunos:**
   * No menu lateral esquerdo, clique em **Alunos e Professores**.
   * Selecione a aba **Corpo Discente (Alunos)**.
   * Clique no botão **+ Novo Aluno** (ou no topo: *Novo Aluno*).

4. **Preencha os Dados Informados pelo Aluno:**
   * **Nome Completo:** Copie da planilha (ex: `João Silva de Oliveira`).
   * **E-mail:** Copie o e-mail informado (ex: `joao.silva@email.com`).
   * **Senha de Acesso:** Digite a senha que o aluno escolheu no formulário.
   * **Matrícula:** O sistema já sugere automaticamente (ex: `2027-1042` ou você pode digitar `SET-2027-001`).
   * **Curso:** `Bacharel em Teologia`.
   * **Ano/Período:** Selecione `1º ano` (ou a turma indicada).

5. **Salvar:**
   * Clique em **Salvar Aluno**.
   * Pronto! O aluno já está matriculado no sistema e já pode fazer login imediatamente com o e-mail e a senha dele.

6. **Atualizar a Planilha de Controle:**
   * Na coluna `Status no Portal SETA`, mude para `Cadastrado`.
   * Anote a matrícula gerada para controle do arquivo da secretaria.

---

## 📲 4. Mensagem Pronta para WhatsApp de Divulgação do Formulário aos Alunos

Copie e envie esta mensagem no grupo de WhatsApp dos alunos ou para os ingressantes:

```text
🕊️ *SEMINÁRIO TEOLÓGICO ALIANÇA — PORTAL SETA*
*"Conhecer · Servir · Glorificar"*

Prezados alunos do Bacharel em Teologia,

Estamos organizando o acesso de todos ao nosso novo ambiente acadêmico, o *Portal SETA*.

Para que a Direção Geral cadastre seu perfil oficial e libere seu acesso ao boletim, notas, aulas e trabalhos, pedimos que preencha o formulário abaixo:

👉 *Link do Formulário de Cadastro:*
[INSIRA AQUI O LINK DO GOOGLE FORMS]

📌 *Dados solicitados:*
• Nome completo
• E-mail pessoal/institucional
• Senha que você deseja usar para acessar o portal
• Telefone/WhatsApp
• Turma

Assim que preencher, a Direção fará a liberação da sua matrícula.

Dúvidas? Entre em contato com a Secretaria Acadêmica:
📞 (24) 99906-5611 | (24) 99837-2729
```

---

## 📲 5. Mensagem Pronta de Boas-Vindas após o Cadastro Manual

Quando a Direção cadastrar o aluno no sistema, pode enviar esta mensagem individual no WhatsApp:

```text
Olá, [Nome do Aluno]! Graça e paz.

Seu cadastro no *Portal SETA* foi realizado com sucesso pela Direção Acadêmica! 🎓

Já está liberado o seu acesso ao ambiente do Bacharel em Teologia:
🌐 *Link de Acesso:* https://seta-plataforma.vercel.app
📧 *Login (E-mail):* [email informado]
🔑 *Senha:* [a senha que você cadastrou no formulário]
📋 *Sua Matrícula:* [SET-2027-XXX]

Qualquer dúvida ou dificuldade no primeiro acesso, estamos à disposição.
Seminário Teológico Aliança (SETA)
```
