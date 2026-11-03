/**
 * Dados fictícios de demonstração do SETA (Seminário Teológico Aliança).
 * MODELO POR PONTOS ACUMULADOS (SOMA DE NOTAS):
 * Não é média! O professor distribui os 10,0 pontos da matéria entre provas,
 * trabalhos, seminários, participação, presença, etc.
 * O aluno é aprovado se a SOMA das notas atingir pelo menos 7,0 pontos.
 */

export const EVALUATION_TYPES = [
  { id: 'prova', label: 'Prova' },
  { id: 'trabalho', label: 'Trabalho' },
  { id: 'seminario', label: 'Seminário' },
  { id: 'fichamento', label: 'Fichamento' },
  { id: 'resenha', label: 'Resenha' },
  { id: 'participacao', label: 'Participação' },
  { id: 'presenca', label: 'Presença / Pontualidade' },
  { id: 'estudo_caso', label: 'Estudo de caso' },
  { id: 'outro', label: 'Outro' },
];

export const typeLabel = (id) => EVALUATION_TYPES.find((t) => t.id === id)?.label ?? 'Outro';

export const RECOVERY_RULES = [
  {
    id: 'substitui_menor',
    label: 'Substitui a menor nota na soma',
    description: 'A nota da recuperação substitui a menor pontuação obtida pelo aluno e o total somado é recalculado.',
  },
  {
    id: 'prova_substitutiva',
    label: 'Prova de recuperação (vale até 10,0)',
    description: 'A recuperação substitui a soma inteira; atingindo 7,0 ou mais, o aluno é considerado aprovado na recuperação.',
  },
  {
    id: 'soma_complementar',
    label: 'Soma complementar (limite até 7,0)',
    description: 'Os pontos da recuperação são somados ao total obtido, limitando o resultado final ao corte de aprovação (7,0).',
  },
];

export const ruleLabel = (id) => RECOVERY_RULES.find((r) => r.id === id)?.label ?? '—';

/** Logins provisórios (somente para o protótipo) */
export const DEMO_LOGINS = [
  { role: 'aluno', label: 'Aluno', email: 'aluno@seta.edu.br', password: 'aluno123', userId: 'stu-1' },
  { role: 'professor', label: 'Professor', email: 'professor@seta.edu.br', password: 'prof123', userId: 'prof-1' },
  { role: 'admin', label: 'Direção', email: 'direcao@seta.edu.br', password: 'direcao123', userId: 'adm-1' },
];

export const COURSES = ['Bacharel em Teologia', 'Médio em Teologia', 'Básico em Teologia Bíblica'];

function buildGrades(evaluations, rows) {
  const out = {};
  for (const [studentId, r] of Object.entries(rows)) {
    const scores = {};
    evaluations.forEach((e, i) => {
      if (r.s[i] !== null && r.s[i] !== undefined) scores[e.id] = r.s[i];
    });
    out[studentId] = { scores, recovery: r.rec ?? null, absences: r.abs ?? 0 };
  }
  return out;
}

export function createSeed() {
  const disciplines = [
    {
      id: 'disc-1',
      code: 'TEO-101',
      name: 'Teologia Sistemática I',
      professorId: 'prof-1',
      course: 'Bacharel em Teologia',
      workload: 60,
      schedule: 'Segundas, 19h30',
      passingGrade: 7.0, // Nota somada mínima = 7,0 pontos
      maxAbsences: 15,
      recoveryRule: 'substitui_menor',
      gradesClosed: false,
      // Pontos distribuídos somam 10,0 pontos
      evaluations: [
        { id: 'd1-p1', name: 'Prova 1', type: 'prova', maxPoints: 3.0 },
        { id: 'd1-t1', name: 'Trabalho exegético (Rm 8)', type: 'trabalho', maxPoints: 3.0 },
        { id: 'd1-p2', name: 'Prova final', type: 'prova', maxPoints: 4.0 },
      ],
    },
    {
      id: 'disc-5',
      code: 'TEO-110',
      name: 'Apologética Cristã',
      professorId: 'prof-1',
      course: 'Bacharel em Teologia',
      workload: 45,
      schedule: 'Quartas, 19h30',
      passingGrade: 7.0,
      maxAbsences: 11,
      recoveryRule: 'soma_complementar',
      gradesClosed: false,
      evaluations: [
        { id: 'd5-s1', name: 'Seminário em grupo', type: 'seminario', maxPoints: 4.0 },
        { id: 'd5-p1', name: 'Prova dissertativa', type: 'prova', maxPoints: 5.0 },
        { id: 'd5-pa', name: 'Participação em sala', type: 'participacao', maxPoints: 1.0 },
      ],
    },
    {
      id: 'disc-2',
      code: 'BIB-202',
      name: 'Hermenêutica e Exegese do Novo Testamento',
      professorId: 'prof-2',
      course: 'Bacharel em Teologia',
      workload: 60,
      schedule: 'Terças, 19h30',
      passingGrade: 7.0,
      maxAbsences: 15,
      recoveryRule: 'substitui_menor',
      gradesClosed: false,
      evaluations: [
        { id: 'd2-t1', name: 'Exegese de perícope', type: 'trabalho', maxPoints: 4.0 },
        { id: 'd2-s1', name: 'Seminário bíblico', type: 'seminario', maxPoints: 3.0 },
        { id: 'd2-pa', name: 'Participação e presença', type: 'presenca', maxPoints: 3.0 },
      ],
    },
    {
      id: 'disc-3',
      code: 'HIS-105',
      name: 'História da Igreja e Reforma Protestante',
      professorId: 'prof-3',
      course: 'Bacharel em Teologia',
      workload: 45,
      schedule: 'Quintas, 19h30',
      passingGrade: 7.0,
      maxAbsences: 11,
      recoveryRule: 'prova_substitutiva',
      gradesClosed: false,
      evaluations: [
        { id: 'd3-p1', name: 'Prova teórica', type: 'prova', maxPoints: 5.0 },
        { id: 'd3-f1', name: 'Fichamento histórico', type: 'fichamento', maxPoints: 2.5 },
        { id: 'd3-r1', name: 'Resenha — As Institutas', type: 'resenha', maxPoints: 2.5 },
      ],
    },
    {
      id: 'disc-4',
      code: 'PAS-301',
      name: 'Teologia Pastoral e Aconselhamento',
      professorId: 'prof-4',
      course: 'Bacharel em Teologia',
      workload: 45,
      schedule: 'Sextas, 19h30',
      passingGrade: 7.0,
      maxAbsences: 11,
      recoveryRule: 'substitui_menor',
      gradesClosed: true,
      evaluations: [
        { id: 'd4-c1', name: 'Estudo de caso clínico/pastoral', type: 'estudo_caso', maxPoints: 5.0 },
        { id: 'd4-t1', name: 'Relatório de estágio ministerial', type: 'trabalho', maxPoints: 4.0 },
        { id: 'd4-pr', name: 'Pontualidade e presença', type: 'presenca', maxPoints: 1.0 },
      ],
    },
  ];

  const ev = (id) => disciplines.find((d) => d.id === id).evaluations;

  // Pontuações somadas nos exemplos:
  // TEO-101: P1 (max 3.0), Trab (max 3.0), P2 (max 4.0) -> Soma = 10.0 pts possíveis
  const grades = {
    'disc-1': buildGrades(ev('disc-1'), {
      'stu-1': { s: [2.6, 2.4, 3.2], abs: 2 }, // Soma: 8.2 (Aprovado)
      'stu-2': { s: [1.8, 1.8, 2.0], rec: 3.5, abs: 4 }, // Soma: 5.6 (< 7) -> Recup: 3.5 (subst. 1.8) -> Nova soma: 7.3 (Aprovado na Recup)
      'stu-3': { s: [2.9, 2.8, 3.8], abs: 0 }, // Soma: 9.5 (Distinção)
      'stu-4': { s: [1.2, 1.5, 1.6], abs: 6 }, // Soma: 4.3 (< 7) -> Em Recuperação
      'stu-5': { s: [2.2, 2.3, 3.1], abs: 1 }, // Soma: 7.6 (Aprovado)
      'stu-6': { s: [2.5, 2.7, 3.4], abs: 3 }, // Soma: 8.6 (Aprovado)
    }),
    'disc-5': buildGrades(ev('disc-5'), {
      'stu-1': { s: [null, 3.8, 0.9], abs: 1 }, // Faltando seminário (parcial: 4.7)
      'stu-2': { s: [2.8, 3.2, 0.8], abs: 2 }, // Soma: 6.8 (< 7) -> Em Recuperação
      'stu-3': { s: [3.8, 4.8, 1.0], abs: 0 }, // Soma: 9.6 (Distinção)
      'stu-4': { s: [2.5, 2.8, 0.7], abs: 5 }, // Soma: 6.0 (< 7) -> Em Recuperação
      'stu-5': { s: [3.2, 4.0, 0.9], abs: 1 }, // Soma: 8.1 (Aprovado)
      'stu-6': { s: [3.0, 4.2, 1.0], abs: 2 }, // Soma: 8.2 (Aprovado)
    }),
    'disc-2': buildGrades(ev('disc-2'), {
      'stu-1': { s: [3.6, 2.6, 2.8], abs: 1 }, // Soma: 9.0 (Distinção)
      'stu-2': { s: [2.8, 2.2, 2.5], abs: 3 }, // Soma: 7.5 (Aprovado)
      'stu-3': { s: [3.9, 2.9, 3.0], abs: 0 }, // Soma: 9.8 (Distinção)
      'stu-4': { s: [2.2, 1.8, 2.0], abs: 7 }, // Soma: 6.0 (< 7) -> Em Recuperação
      'stu-5': { s: [3.2, 2.4, 2.7], abs: 2 }, // Soma: 8.3 (Aprovado)
      'stu-6': { s: [3.4, 2.5, 2.8], abs: 1 }, // Soma: 8.7 (Aprovado)
    }),
    'disc-3': buildGrades(ev('disc-3'), {
      'stu-1': { s: [4.0, 2.2, null], abs: 2 }, // Parcial 6.2 (falta resenha)
      'stu-2': { s: [3.5, 2.0, null], abs: 1 }, // Parcial 5.5
      'stu-3': { s: [4.8, 2.5, null], abs: 0 }, // Parcial 7.3
      'stu-4': { s: [2.8, 1.8, null], abs: 4 }, // Parcial 4.6
      'stu-5': { s: [3.8, 2.2, null], abs: 2 }, // Parcial 6.0
      'stu-6': { s: [4.0, 2.0, null], abs: 3 }, // Parcial 6.0
    }),
    'disc-4': buildGrades(ev('disc-4'), {
      'stu-1': { s: [4.0, 3.4, 1.0], abs: 2 }, // Soma: 8.4 (Aprovado)
      'stu-2': { s: [3.6, 3.0, 0.9], abs: 2 }, // Soma: 7.5 (Aprovado)
      'stu-3': { s: [4.8, 3.8, 1.0], abs: 0 }, // Soma: 9.6 (Distinção)
      'stu-4': { s: [3.2, 3.0, 0.8], abs: 5 }, // Soma: 7.0 (Aprovado no limite)
      'stu-5': { s: [4.2, 3.2, 1.0], abs: 1 }, // Soma: 8.4 (Aprovado)
      'stu-6': { s: [4.5, 3.6, 1.0], abs: 2 }, // Soma: 9.1 (Distinção)
    }),
  };

  return {
    institution: {
      name: 'Seminário Teológico Aliança',
      acronym: 'SETA',
      period: '2026.2',
    },
    admins: [{ id: 'adm-1', name: 'Antônio Carlos de Almeida', title: 'Rev.', role: 'Direção acadêmica', email: 'direcao@seta.edu.br' }],
    professors: [
      { id: 'prof-1', name: 'Samuel Alencar', title: 'Prof. Dr.', email: 'professor@seta.edu.br' },
      { id: 'prof-2', name: 'Davi Oliveira', title: 'Prof. Me.', email: 'davi.oliveira@seta.edu.br' },
      { id: 'prof-3', name: 'Ester Vasconcelos', title: 'Profª. Dra.', email: 'ester.vasconcelos@seta.edu.br' },
      { id: 'prof-4', name: 'Marcos Ferreira', title: 'Pr.', email: 'marcos.ferreira@seta.edu.br' },
    ],
    students: [
      { id: 'stu-1', name: 'Lucas Mendes da Silva', enrollment: '2024-0104', email: 'aluno@seta.edu.br', course: 'Bacharel em Teologia', year: '2º ano' },
      { id: 'stu-2', name: 'Amanda Ribeiro Farias', enrollment: '2024-0112', email: 'amanda.ribeiro@seta.edu.br', course: 'Bacharel em Teologia', year: '2º ano' },
      { id: 'stu-3', name: 'Gabriel Santos Albuquerque', enrollment: '2024-0089', email: 'gabriel.santos@seta.edu.br', course: 'Bacharel em Teologia', year: '2º ano' },
      { id: 'stu-4', name: 'Mateus Cavalcanti Barreto', enrollment: '2024-0155', email: 'mateus.barreto@seta.edu.br', course: 'Bacharel em Teologia', year: '2º ano' },
      { id: 'stu-5', name: 'Priscila Neves Batista', enrollment: '2024-0177', email: 'priscila.neves@seta.edu.br', course: 'Bacharel em Teologia', year: '2º ano' },
      { id: 'stu-6', name: 'João Batista de Castro', enrollment: '2024-0203', email: 'joao.castro@seta.edu.br', course: 'Bacharel em Teologia', year: '2º ano' },
    ],
    disciplines,
    grades,
    assignments: [
      {
        id: 'ass-1',
        disciplineId: 'disc-1',
        evaluationId: 'd1-t1',
        title: 'Trabalho exegético: Romanos 8:28-39',
        description:
          'Ensaio exegético-teológico de 4 a 6 páginas sobre o contexto paulino, análise dos termos gregos (prothesis, proginōskō, proorizō) e aplicação pastoral. Vale até 3,0 pontos na soma final.',
        dueDate: '2026-10-28',
        submissions: [
          { studentId: 'stu-1', fileName: 'Exegese_Rm8_LucasMendes.pdf', fileSize: '2,4 MB', submittedAt: '2026-10-26T14:32', grade: 2.4, feedback: 'Boa fundamentação no texto grego e diálogo com Calvino e Agostinho. Conquistou 2,4 de 3,0 pontos.' },
          { studentId: 'stu-2', fileName: 'Exegese_Rm8_Amanda.docx', fileSize: '1,1 MB', submittedAt: '2026-10-27T19:15', grade: 1.8, feedback: 'Bom resumo temático, mas faltou análise textual do v. 29. Conquistou 1,8 de 3,0 pontos.' },
          { studentId: 'stu-3', fileName: 'Ensaio_Soteriologia_Gabriel.pdf', fileSize: '3,2 MB', submittedAt: '2026-10-25T10:05', grade: 2.8, feedback: 'Trabalho primoroso: exegese rica, referências sólidas e redação impecável. Conquistou 2,8 de 3,0 pontos.' },
          { studentId: 'stu-4', fileName: 'Mateus_Rm8.pdf', fileSize: '950 KB', submittedAt: '2026-10-28T23:45', grade: 1.5, feedback: 'Texto breve (2 páginas) e sem os termos gregos exigidos no roteiro. Conquistou 1,5 de 3,0 pontos.' },
          { studentId: 'stu-5', fileName: 'Trabalho_Rm8_Priscila.pdf', fileSize: '1,8 MB', submittedAt: '2026-10-27T16:40', grade: 2.3, feedback: 'Bem estruturado, com argumentação clara sobre a aliança da graça. Conquistou 2,3 de 3,0 pontos.' },
          { studentId: 'stu-6', fileName: 'Rm8_JoaoCastro.pdf', fileSize: '2,0 MB', submittedAt: '2026-10-26T09:12', grade: 2.7, feedback: 'Excelente articulação entre exegese e prática ministerial. Conquistou 2,7 de 3,0 pontos.' },
        ],
      },
      {
        id: 'ass-5',
        disciplineId: 'disc-1',
        evaluationId: null,
        title: 'Fichamento: a Trindade nos Pais Apostólicos',
        description: 'Fichamento do capítulo 3 da bibliografia básica e das cartas de Inácio de Antioquia. Atividade formativa complementar, sem pontos diretos.',
        dueDate: '2026-11-30',
        submissions: [],
      },
      {
        id: 'ass-2',
        disciplineId: 'disc-5',
        evaluationId: 'd5-s1',
        title: 'Roteiro do seminário: o argumento cosmológico',
        description: 'Entregar o roteiro escrito do seminário (3 a 5 páginas) com as objeções principais e as respostas apologéticas do grupo. Vale até 4,0 pontos na soma da disciplina.',
        dueDate: '2026-11-18',
        submissions: [
          { studentId: 'stu-3', fileName: 'Seminario_Cosmologico_Gabriel.pdf', fileSize: '1,5 MB', submittedAt: '2026-11-01T11:20', grade: null, feedback: null },
          { studentId: 'stu-5', fileName: 'Roteiro_Seminario_Priscila.pdf', fileSize: '1,2 MB', submittedAt: '2026-11-02T20:03', grade: null, feedback: null },
        ],
      },
      {
        id: 'ass-3',
        disciplineId: 'disc-2',
        evaluationId: 'd2-t1',
        title: 'Exegese de Filipenses 2:5-11',
        description: 'Análise estrutural, lexical e teológica do hino cristológico de Filipenses 2. Vale até 4,0 pontos na soma final.',
        dueDate: '2026-10-20',
        submissions: [
          { studentId: 'stu-1', fileName: 'Exegese_Fp2_LucasMendes.pdf', fileSize: '2,1 MB', submittedAt: '2026-10-19T21:10', grade: 3.6, feedback: 'Muito bom tratamento da kenosis e das implicações éticas. Conquistou 3,6 de 4,0 pontos.' },
        ],
      },
      {
        id: 'ass-4',
        disciplineId: 'disc-3',
        evaluationId: 'd3-r1',
        title: 'Resenha crítica: As Institutas (Livro I)',
        description: 'Resenha de 3 páginas sobre o Livro I das Institutas da Religião Cristã, de João Calvino. Vale até 2,5 pontos na soma.',
        dueDate: '2026-11-25',
        submissions: [
          { studentId: 'stu-3', fileName: 'Resenha_Institutas_Gabriel.pdf', fileSize: '1,0 MB', submittedAt: '2026-11-02T08:44', grade: null, feedback: null },
        ],
      },
    ],
    lessons: [
      { id: 'les-1', disciplineId: 'disc-1', module: 'Módulo 1 · Teologia Própria', title: 'Atributos incomunicáveis de Deus', date: '2026-10-05', duration: '1h35', kind: 'gravada', url: '', summary: 'Asseidade, imutabilidade, eternidade e onipresença de Deus na teologia reformada clássica.', materials: [{ name: 'Apostila — Módulo 1.pdf', size: '4,8 MB' }, { name: 'Slides — Aula 1.pdf', size: '3,1 MB' }] },
      { id: 'les-2', disciplineId: 'disc-1', module: 'Módulo 1 · Teologia Própria', title: 'A doutrina da Trindade e os concílios', date: '2026-10-12', duration: '1h48', kind: 'gravada', url: '', summary: 'Uma essência em três pessoas: Niceia (325) e Constantinopla (381) diante do arianismo e do modalismo.', materials: [{ name: 'Texto de apoio — Niceia.pdf', size: '2,1 MB' }] },
      { id: 'les-3', disciplineId: 'disc-1', module: 'Módulo 2 · Soteriologia', title: 'A ordem da salvação (ordo salutis)', date: '2026-10-26', duration: '1h52', kind: 'gravada', url: '', summary: 'Eleição, chamado eficaz, regeneração, fé, justificação e santificação.', materials: [{ name: 'Diagrama — Ordo salutis.pdf', size: '3,4 MB' }] },
      { id: 'les-4', disciplineId: 'disc-1', module: 'Módulo 2 · Soteriologia', title: 'Debate ao vivo: Romanos 8 e a segurança da salvação', date: '2026-11-09', duration: '19h30', kind: 'ao_vivo', url: 'https://meet.google.com/', summary: 'Encontro síncrono para discussão dos ensaios e preparação para a prova final.', materials: [] },
      { id: 'les-5', disciplineId: 'disc-5', module: 'Módulo 1 · Fundamentos', title: 'O que é apologética? Panorama histórico', date: '2026-10-07', duration: '1h20', kind: 'gravada', url: '', summary: 'De Justino Mártir a C. S. Lewis: a defesa da fé ao longo da história.', materials: [{ name: 'Leitura — 1 Pedro 3.15.pdf', size: '640 KB' }] },
      { id: 'les-6', disciplineId: 'disc-5', module: 'Módulo 2 · Argumentos clássicos', title: 'Aula ao vivo: preparação dos seminários', date: '2026-11-11', duration: '19h30', kind: 'ao_vivo', url: 'https://meet.google.com/', summary: 'Orientação dos grupos para os seminários sobre os argumentos cosmológico, teleológico e moral.', materials: [] },
      { id: 'les-7', disciplineId: 'disc-2', module: 'Módulo 1 · Princípios', title: 'O método gramático-histórico', date: '2026-10-06', duration: '1h40', kind: 'gravada', url: '', summary: 'Contexto, gramática, gênero literário e a analogia da fé.', materials: [{ name: 'Guia de exegese.pdf', size: '1,9 MB' }] },
      { id: 'les-8', disciplineId: 'disc-3', module: 'Módulo 2 · Reforma', title: 'Lutero e as 95 teses', date: '2026-10-29', duration: '1h30', kind: 'gravada', url: '', summary: 'O contexto das indulgências e o início da Reforma Protestante em 1517.', materials: [] },
      { id: 'les-9', disciplineId: 'disc-4', module: 'Módulo 1 · Fundamentos', title: 'Aconselhamento bíblico: princípios', date: '2026-10-09', duration: '1h25', kind: 'gravada', url: '', summary: 'A suficiência das Escrituras no cuidado pastoral.', materials: [] },
    ],
    announcements: [
      { id: 'ann-1', date: '2026-11-01', author: 'Secretaria Acadêmica', title: 'Prazo para lançamento dos pontos e recuperação', content: 'Lembramos aos docentes que a pontuação somada mínima para aprovação direta é 7,0 pontos. Alunos que somarem menos de 7,0 devem ser convocados para a recuperação até 15/11.', important: true },
      { id: 'ann-2', date: '2026-10-28', author: 'Direção', title: 'Semana Teológica 2026: “Fé e fidelidade no século XXI”', content: 'Inscrições gratuitas para alunos matriculados. Certificado de 20 horas complementares.', important: false },
    ],
  };
}
