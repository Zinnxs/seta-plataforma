/**
 * Dados iniciais do SETA (Seminário Teológico Aliança).
 * MODELO POR PONTOS ACUMULADOS (SOMA DE NOTAS):
 * O aluno é aprovado se a SOMA das notas atingir pelo menos 7,0 pontos (de 10,0 distribuídos).
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

/** Curso único ofertado pelo seminário */
export const COURSES = ['Bacharel em Teologia'];

/** Lista padrão sugerida de documentos de matrícula */
export const DEFAULT_ENROLLMENT_DOCUMENTS = [
  {
    id: 'doc-rg-cnh',
    title: 'Documento de Identidade com Foto (RG ou CNH)',
    description: 'Frente e verso legível em formato PDF ou imagem nítida.',
    required: true,
  },
  {
    id: 'doc-cpf',
    title: 'Cadastro de Pessoa Física (CPF)',
    description: 'Necessário caso o número do CPF não conste no RG/CNH.',
    required: false,
  },
  {
    id: 'doc-residencia',
    title: 'Comprovante de Residência Recente',
    description: 'Conta de luz, água ou telefone emitida nos últimos 90 dias.',
    required: true,
  },
  {
    id: 'doc-historico',
    title: 'Histórico Escolar ou Certificado do Ensino Médio',
    description: 'Comprovante de conclusão do Ensino Médio ou curso superior.',
    required: true,
  },
  {
    id: 'doc-carta-pastoral',
    title: 'Carta de Recomendação Pastoral',
    description: 'Carta assinada pelo pastor da sua igreja local atestando sua membresia.',
    required: true,
  },
  {
    id: 'doc-foto-3x4',
    title: 'Foto 3x4 Recente',
    description: 'Foto recente com fundo neutro para a carteirinha e ficha acadêmica.',
    required: true,
  },
];

export function createSeed() {
  return {
    institution: {
      name: 'Seminário Teológico Aliança',
      portalName: 'Portal SETA',
      acronym: 'SETA',
      course: 'Bacharel em Teologia',
      period: '2026.2',
      cnpj: '07.396.459/0001-03',
      address: 'Av. Antônio de Almeida, 2238 - Retiro, Volta Redonda - RJ, 27277-330',
      phone: '(24) 99906-5611',
      phoneSecondary: '(24) 99837-2729',
      dpoEmail: 'privacidade@seta.edu.br',
    },
    admins: [
      {
        id: 'adm-1',
        name: 'Direção Geral',
        title: 'Direção',
        role: 'admin',
        email: 'admin@seta.com',
        password: 'setaadmin987',
      },
    ],
    professors: [],
    students: [],
    disciplines: [],
    grades: {},
    assignments: [],
    lessons: [],
    enrollmentDocsConfig: {
      id: 'global-config',
      requiredYears: ['2027'],
      documents: DEFAULT_ENROLLMENT_DOCUMENTS,
    },
    studentDocuments: {},
    announcements: [
      {
        id: 'ann-init',
        date: new Date().toISOString().slice(0, 10),
        author: 'Direção Geral',
        title: 'Lançamento Oficial do Portal SETA — Novo Ambiente Acadêmico',
        content: `É com grande alegria e espírito de gratidão a Deus que a Direção Geral do Seminário Teológico Aliança (SETA) anuncia o lançamento do Portal SETA, nosso novo ambiente acadêmico digital.\n\nDesenvolvido com padrão institucional para o curso de Bacharel em Teologia, o portal centraliza todas as atividades formativas da nossa instituição:\n\n• Boletim Acadêmico Oficial em tempo real com acompanhamento de pontuação acumulada;\n• Envio e correção de trabalhos e pesquisas teológicas diretamente pela plataforma;\n• Acesso às aulas gravadas, links para transmissões ao vivo e download de apostilas;\n• Mural de comunicados oficiais e auditoria transparente de critérios de avaliação.\n\nQue este instrumento sirva para o crescimento espiritual e teológico de nossos alunos e para a excelência do ministério docente, honrando o nosso lema: Conhecer, Servir e Glorificar.`,
        important: true,
      },
    ],
  };
}
