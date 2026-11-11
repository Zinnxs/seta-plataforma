import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  RotateCcw, 
  UserCheck, 
  Scale, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin, 
  Building2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Modal, Button, Tabs } from '../ui';

export function LegalModal({ open, onClose, initialTab = 'privacidade' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sincroniza a aba inicial sempre que o modal abre com um tópico específico
  React.useEffect(() => {
    if (open && initialTab) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Termos Legais e Conformidade Institucional"
      description="Políticas oficiais de proteção de dados, termos de uso e conformidade legal do Seminário Teológico Aliança."
      size="lg"
    >
      <div className="space-y-5">
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'privacidade', label: 'Privacidade & LGPD', icon: ShieldCheck },
            { id: 'termos', label: 'Termos de Serviço', icon: FileText },
            { id: 'reembolso', label: 'Reembolso & Matrícula', icon: RotateCcw },
            { id: 'dpo', label: 'Canal LGPD (Art. 18)', icon: Scale },
          ]}
        />

        {/* 1. POLÍTICA DE PRIVACIDADE (LGPD - LEI 13.709/2018) */}
        {activeTab === 'privacidade' && (
          <div className="space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed pr-1">
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Compromisso com a Lei Geral de Proteção de Dados (LGPD)
                </h4>
                <p className="mt-0.5 text-stone-600 dark:text-stone-400">
                  O <strong>Seminário Teológico Aliança (SETA)</strong>, inscrito no CNPJ sob o nº <strong>07.396.459/0001-03</strong>, com sede na Av. Antônio de Almeida, 2238 - Retiro, Volta Redonda - RJ, assegura a total privacidade e segurança dos dados pessoais de seus alunos, docentes e colaboradores.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px] border-b pb-1 border-stone-200 dark:border-stone-800">
                1. Quais dados são coletados e qual a base legal?
              </h5>
              <p>
                Em observância ao <strong>Artigo 7º, Inciso V da LGPD</strong> (execução de contrato educacional) e Inciso II (cumprimento de obrigação legal ou regulatória), coletamos estritamente os dados necessários para a atividade acadêmica:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Dados Cadastrais:</strong> Nome completo, e-mail institucional/pessoal, número de matrícula e senha criptografada.</li>
                <li><strong>Documentos de Matrícula:</strong> Cópia do documento de identidade (RG/CNH), CPF, comprovante de residência, histórico escolar/certificado de conclusão, carta de recomendação pastoral e foto 3x4.</li>
                <li><strong>Registros Acadêmicos:</strong> Notas, frequência em aulas, trabalhos teológicos enviados e histórico curricular do Bacharel em Teologia.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px] border-b pb-1 border-stone-200 dark:border-stone-800">
                2. Princípio da Minimização e Não Compartilhamento
              </h5>
              <p>
                <strong>Não comercializamos</strong>, não vendemos e não compartilhamos seus dados pessoais com terceiros para fins de marketing ou publicidade. Os dados são armazenados em infraestrutura de nuvem segura e criptografada (banco PostgreSQL gerenciado com Row-Level Security), acessíveis exclusivamente pela Direção Geral e pelo próprio titular.
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px] border-b pb-1 border-stone-200 dark:border-stone-800">
                3. Tempo de Guarda e Descarte
              </h5>
              <p>
                Os registros acadêmicos oficiais (boletins e certificados) são mantidos pelo período exigido pelas normas regulatórias educacionais para fins de comprovação histórica curricular. Documentos transitórios de matrícula podem ser atualizados a qualquer momento a pedido do titular.
              </p>
            </div>
          </div>
        )}

        {/* 2. TERMOS DE USO E CONDUTA ACADÊMICA */}
        {activeTab === 'termos' && (
          <div className="space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed pr-1">
            <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Termos de Uso do Ambiente Virtual de Aprendizagem
                </h4>
                <p className="mt-0.5 text-stone-600 dark:text-stone-400">
                  Ao acessar o Portal SETA, alunos e professores concordam com as normas regimentais do Seminário Teológico Aliança.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
                1. Guarda de Credenciais
              </h5>
              <p>
                A conta de acesso ao Portal SETA é de uso estritamente pessoal e intransferível. O aluno é o único responsável pela guarda da sua senha. É expressamente proibido ceder o acesso para terceiros não matriculados.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
                2. Integridade Acadêmica e Vedação ao Plágio
              </h5>
              <p>
                Trabalhos acadêmicos, pesquisas teológicas e exames devem refletir o esforço autêntico do aluno. O plágio acadêmico ou uso indevido de materiais sem citação constitui falta disciplinar grave sujeita a anulação da nota e medidas regimentais pela Direção.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
                3. Propriedade Intelectual das Videoaulas e Apostilas
              </h5>
              <p>
                Todo o conteúdo disponibilizado na plataforma (apostilas em PDF, videoaulas gravadas, matrizes curriculares e slides) é protegido pela Lei de Direitos Autorais (Lei nº 9.610/1998), sendo de titularidade exclusiva do Seminário Teológico Aliança e de seus respectivos professores. É proibida a reprodução, comercialização ou distribuição pública não autorizada.
              </p>
            </div>
          </div>
        )}

        {/* 3. POLÍTICA DE CANCELAMENTO, DESISTÊNCIA E REEMBOLSO */}
        {activeTab === 'reembolso' && (
          <div className="space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed pr-1">
            <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-3">
              <RotateCcw className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Política de Matrícula, Desistência e Reembolso
                </h4>
                <p className="mt-0.5 text-stone-600 dark:text-stone-400">
                  Regras transparentes em conformidade com o Código de Defesa do Consumidor (CDC) e o Regimento Interno do SETA.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
                1. Direito de Arrependimento (Art. 49 do CDC)
              </h5>
              <p>
                O aluno ingressante que realizar sua matrícula no curso de Bacharel em Teologia de forma remota/online tem o prazo legal de até <strong>7 (sete) dias corridos</strong> a contar da confirmação da matrícula para manifestar desistência imotivada, com direito à restituição de 100% dos valores eventualmente pagos pela matrícula.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
                2. Cancelamento após o Início do Período Letivo
              </h5>
              <p>
                Após o início formal das aulas do semestre letivo, o cancelamento ou desistência do curso deve ser formalizado junto à Secretaria Acadêmica. Não haverá ressarcimento de mensalidades correspondentes a períodos em que o aluno usufruiu das aulas e materiais disponibilizados no portal.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
                3. Trancamento de Matrícula
              </h5>
              <p>
                O trancamento de matrícula poderá ser solicitado pelo aluno devidamente regular com suas obrigações acadêmicas, garantindo o aproveitamento das disciplinas concluídas no retorno aos estudos.
              </p>
            </div>
          </div>
        )}

        {/* 4. CANAL DE ATENDIMENTO DE DIREITOS DO TITULAR (ART. 18 LGPD) */}
        {activeTab === 'dpo' && (
          <div className="space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed pr-1">
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40">
              <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
                Exerça seus Direitos como Titular de Dados
              </h4>
              <p className="mt-1 text-stone-600 dark:text-stone-400">
                O Artigo 18 da LGPD garante a você os direitos de: confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos ou desatualizados, e portabilidade dos seus registros.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/30 p-4 space-y-3 bg-white dark:bg-stone-900">
              <h5 className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                Canais Oficiais do Encarregado de Proteção de Dados (DPO):
              </h5>
              <div className="space-y-2 text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span><strong>Controlador:</strong> Seminário Teológico Aliança (CNPJ 07.396.459/0001-03)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Av. Antônio de Almeida, 2238 - Retiro, Volta Redonda - RJ, 27277-330</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Secretaria / WhatsApp: (24) 99906-5611 | (24) 99837-2729</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>E-mail do DPO: <a href="mailto:privacidade@seta.edu.br" className="text-brand-600 dark:text-amber-400 font-semibold underline">privacidade@seta.edu.br</a></span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300/40 text-emerald-800 dark:text-emerald-300 text-[11px]">
              ✓ Para solicitar a retificação ou exclusão de documentos, entre em contato pelos canais acima ou procure a Secretaria Acadêmica presencialmente.
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
