import type { StudoraData } from "./types";

/** Builds an ISO datetime relative to today, so the demo always looks current. */
function rel(days: number, hour = 9, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

let n = 0;
const id = (p: string) => `${p}_${(++n).toString(36)}`;

const topics = (list: [string, boolean][]) =>
  list.map(([title, studied]) => ({ id: id("tp"), title, studied }));

export const SEED_VERSION = 3;

export function createSeed(): StudoraData {
  n = 0;
  return {
    version: SEED_VERSION,
    profile: {
      name: "Marina Albuquerque",
      email: "marina.albuquerque@ufpr.br",
      course: "Engenharia de Computação",
      university: "Universidade Federal do Paraná",
      period: "5º período",
      studentId: "GRR20231847",
      weeklyGoalHours: 14,
      weekStartsOn: 1,
      notifications: {
        deadlines: true,
        exams: true,
        studyReminders: true,
        weeklyReport: false,
        email: true,
      },
    },
    subjects: [
      {
        id: "calc3",
        name: "Cálculo III",
        code: "CM043",
        professor: "Prof. Ricardo Menezes",
        semester: "2026.2",
        color: "cobalt",
        schedule: "Seg e Qua · 07:30",
        room: "PA-204",
        workload: 90,
        topics: topics([
          ["Funções de várias variáveis", true],
          ["Derivadas parciais", true],
          ["Integrais duplas", true],
          ["Integrais triplas", false],
          ["Teorema de Green", false],
          ["Teorema de Stokes", false],
        ]),
      },
      {
        id: "ed",
        name: "Estruturas de Dados II",
        code: "CI1057",
        professor: "Profa. Helena Duarte",
        semester: "2026.2",
        color: "teal",
        schedule: "Ter e Qui · 10:30",
        room: "Lab. 3 · DInf",
        workload: 60,
        topics: topics([
          ["Árvores AVL", true],
          ["Árvores rubro-negras", true],
          ["Tabelas hash", true],
          ["Heaps e filas de prioridade", false],
          ["Grafos: representação", false],
        ]),
      },
      {
        id: "so",
        name: "Sistemas Operacionais",
        code: "CI1215",
        professor: "Prof. André Caldeira",
        semester: "2026.2",
        color: "coral",
        schedule: "Seg e Qua · 13:30",
        room: "DInf-102",
        workload: 60,
        topics: topics([
          ["Processos e threads", true],
          ["Escalonamento", true],
          ["Sincronização", false],
          ["Deadlocks", false],
          ["Gerência de memória", false],
        ]),
      },
      {
        id: "bd",
        name: "Banco de Dados",
        code: "CI1218",
        professor: "Profa. Juliana Prado",
        semester: "2026.2",
        color: "amber",
        schedule: "Ter · 15:30",
        room: "DInf-105",
        workload: 60,
        topics: topics([
          ["Modelo entidade-relacionamento", true],
          ["Álgebra relacional", true],
          ["SQL avançado", true],
          ["Normalização", false],
          ["Transações", false],
        ]),
      },
      {
        id: "pe",
        name: "Probabilidade e Estatística",
        code: "CE003",
        professor: "Prof. Fábio Nogueira",
        semester: "2026.2",
        color: "plum",
        schedule: "Sex · 09:30",
        room: "PC-011",
        workload: 60,
        topics: topics([
          ["Variáveis aleatórias", true],
          ["Distribuições discretas", true],
          ["Distribuição normal", false],
          ["Intervalos de confiança", false],
        ]),
      },
      {
        id: "es",
        name: "Engenharia de Software",
        code: "CI1163",
        professor: "Profa. Camila Torres",
        semester: "2026.2",
        color: "sage",
        schedule: "Qui · 13:30",
        room: "DInf-201",
        workload: 60,
        topics: topics([
          ["Processos ágeis", true],
          ["Requisitos", true],
          ["Modelagem UML", false],
          ["Testes de software", false],
        ]),
      },
    ],
    tasks: [
      { id: id("t"), title: "Lista 4 — Integrais triplas", subjectId: "calc3", due: rel(1, 23, 59), priority: "alta", status: "andamento", notes: "Exercícios 1 a 18 do capítulo 15." },
      { id: id("t"), title: "Implementar árvore AVL com remoção", subjectId: "ed", due: rel(2, 18, 0), priority: "alta", status: "pendente", notes: "Entrega pelo Moodle, em C. Incluir casos de teste." },
      { id: id("t"), title: "Relatório: escalonador round-robin", subjectId: "so", due: rel(4, 23, 59), priority: "media", status: "pendente" },
      { id: id("t"), title: "Modelagem ER do sistema da biblioteca", subjectId: "bd", due: rel(5, 15, 30), priority: "media", status: "andamento" },
      { id: id("t"), title: "Exercícios de distribuição binomial", subjectId: "pe", due: rel(6, 9, 30), priority: "baixa", status: "pendente" },
      { id: id("t"), title: "Documento de requisitos — Sprint 2", subjectId: "es", due: rel(8, 13, 30), priority: "media", status: "pendente", notes: "Trabalho em grupo com Lucas e Bianca." },
      { id: id("t"), title: "Seminário: algoritmos de substituição de páginas", subjectId: "so", due: rel(11, 13, 30), priority: "baixa", status: "pendente" },
      { id: id("t"), title: "Consultas SQL — lista prática", subjectId: "bd", due: rel(-1, 23, 59), priority: "alta", status: "pendente" },
      { id: id("t"), title: "Lista 3 — Integrais duplas", subjectId: "calc3", due: rel(-6, 23, 59), priority: "media", status: "concluido" },
      { id: id("t"), title: "Tabela hash com endereçamento aberto", subjectId: "ed", due: rel(-9, 18, 0), priority: "alta", status: "concluido" },
      { id: id("t"), title: "Questionário sobre threads", subjectId: "so", due: rel(-4, 23, 59), priority: "baixa", status: "concluido" },
      { id: id("t"), title: "Histórias de usuário do projeto", subjectId: "es", due: rel(-3, 13, 30), priority: "media", status: "concluido" },
    ],
    exams: [
      { id: id("e"), title: "P2 — Integrais múltiplas", subjectId: "calc3", date: rel(3, 7, 30), weight: 35, topics: ["Integrais duplas", "Integrais triplas", "Mudança de variáveis"], preparation: 55, grade: null, location: "PA-204" },
      { id: id("e"), title: "Prova prática — Árvores", subjectId: "ed", date: rel(7, 10, 30), weight: 30, topics: ["AVL", "Rubro-negra", "Complexidade"], preparation: 70, grade: null, location: "Lab. 3" },
      { id: id("e"), title: "P2 — Sincronização e deadlocks", subjectId: "so", date: rel(12, 13, 30), weight: 40, topics: ["Semáforos", "Monitores", "Deadlocks"], preparation: 25, grade: null, location: "DInf-102" },
      { id: id("e"), title: "Avaliação — Normalização", subjectId: "bd", date: rel(16, 15, 30), weight: 30, topics: ["1FN a 3FN", "BCNF", "Dependências funcionais"], preparation: 10, grade: null, location: "DInf-105" },
      { id: id("e"), title: "P1 — Funções de várias variáveis", subjectId: "calc3", date: rel(-30, 7, 30), weight: 30, topics: ["Limites", "Derivadas parciais"], preparation: 100, grade: 7.8 },
      { id: id("e"), title: "P1 — Árvores balanceadas", subjectId: "ed", date: rel(-24, 10, 30), weight: 30, topics: ["AVL", "Rotações"], preparation: 100, grade: 9.1 },
      { id: id("e"), title: "P1 — Processos e escalonamento", subjectId: "so", date: rel(-21, 13, 30), weight: 30, topics: ["Processos", "Escalonamento"], preparation: 100, grade: 6.4 },
      { id: id("e"), title: "P1 — Álgebra relacional", subjectId: "bd", date: rel(-18, 15, 30), weight: 30, topics: ["Seleção e projeção", "Junções"], preparation: 100, grade: 8.5 },
      { id: id("e"), title: "P1 — Variáveis aleatórias", subjectId: "pe", date: rel(-14, 9, 30), weight: 40, topics: ["Esperança", "Variância"], preparation: 100, grade: 5.6 },
      { id: id("e"), title: "Entrega — Processos ágeis", subjectId: "es", date: rel(-10, 13, 30), weight: 20, topics: ["Scrum", "Kanban"], preparation: 100, grade: 9.4 },
    ],
    sessions: [
      { id: id("s"), subjectId: "calc3", topic: "Integrais triplas em coordenadas esféricas", start: rel(0, 19, 0), durationMin: 90, status: "planejada" },
      { id: id("s"), subjectId: "ed", topic: "Revisão de rotações AVL", start: rel(0, 14, 0), durationMin: 60, status: "concluida" },
      { id: id("s"), subjectId: "so", topic: "Semáforos e problema produtor-consumidor", start: rel(1, 20, 0), durationMin: 60, status: "planejada" },
      { id: id("s"), subjectId: "calc3", topic: "Resolver lista 4 — parte 2", start: rel(1, 9, 0), durationMin: 120, status: "planejada" },
      { id: id("s"), subjectId: "bd", topic: "Formas normais com exemplos", start: rel(2, 19, 30), durationMin: 45, status: "planejada" },
      { id: id("s"), subjectId: "pe", topic: "Distribuição normal e tabela Z", start: rel(3, 18, 0), durationMin: 60, status: "planejada" },
      { id: id("s"), subjectId: "ed", topic: "Heaps binários", start: rel(4, 16, 0), durationMin: 90, status: "planejada" },
      { id: id("s"), subjectId: "calc3", topic: "Mudança de variáveis", start: rel(-1, 19, 0), durationMin: 90, status: "concluida" },
      { id: id("s"), subjectId: "so", topic: "Escalonamento — exercícios", start: rel(-1, 15, 0), durationMin: 60, status: "concluida" },
      { id: id("s"), subjectId: "es", topic: "Diagramas de caso de uso", start: rel(-2, 20, 0), durationMin: 45, status: "perdida" },
      { id: id("s"), subjectId: "bd", topic: "Consultas com GROUP BY", start: rel(-2, 14, 0), durationMin: 75, status: "concluida" },
      { id: id("s"), subjectId: "pe", topic: "Binomial e Poisson", start: rel(-3, 18, 0), durationMin: 60, status: "concluida" },
      { id: id("s"), subjectId: "calc3", topic: "Integrais duplas — revisão", start: rel(-4, 19, 0), durationMin: 120, status: "concluida" },
      { id: id("s"), subjectId: "ed", topic: "Tabelas hash — colisões", start: rel(-5, 16, 0), durationMin: 90, status: "concluida" },
      { id: id("s"), subjectId: "so", topic: "Threads POSIX", start: rel(-6, 20, 0), durationMin: 60, status: "concluida" },
      { id: id("s"), subjectId: "bd", topic: "Álgebra relacional", start: rel(-8, 19, 0), durationMin: 90, status: "concluida" },
      { id: id("s"), subjectId: "calc3", topic: "Derivadas direcionais", start: rel(-9, 19, 0), durationMin: 60, status: "concluida" },
      { id: id("s"), subjectId: "es", topic: "Leitura: Manifesto Ágil", start: rel(-10, 21, 0), durationMin: 30, status: "concluida" },
    ],
    materials: [
      { id: id("m"), name: "Cap. 15 — Integrais múltiplas.pdf", type: "pdf", subjectId: "calc3", addedAt: rel(-2, 10), sizeKb: 4820 },
      { id: id("m"), name: "Resumo P2 — Cálculo III.docx", type: "doc", subjectId: "calc3", addedAt: rel(-1, 22), sizeKb: 312 },
      { id: id("m"), name: "Aula 12 — Árvores rubro-negras.pptx", type: "slides", subjectId: "ed", addedAt: rel(-5, 12), sizeKb: 2140 },
      { id: id("m"), name: "Enunciado — Trabalho AVL.pdf", type: "pdf", subjectId: "ed", addedAt: rel(-7, 9), sizeKb: 186 },
      { id: id("m"), name: "Visualizador de algoritmos", type: "link", subjectId: "ed", addedAt: rel(-12, 15), sizeKb: 0, url: "https://visualgo.net/pt" },
      { id: id("m"), name: "Tanenbaum — Cap. 2 Processos.pdf", type: "pdf", subjectId: "so", addedAt: rel(-15, 18), sizeKb: 7310 },
      { id: id("m"), name: "Aula 08 — Sincronização.pptx", type: "slides", subjectId: "so", addedAt: rel(-3, 14), sizeKb: 3020 },
      { id: id("m"), name: "Diagrama ER — biblioteca.png", type: "imagem", subjectId: "bd", addedAt: rel(-1, 16), sizeKb: 890 },
      { id: id("m"), name: "Lista de exercícios SQL.pdf", type: "pdf", subjectId: "bd", addedAt: rel(-6, 11), sizeKb: 240 },
      { id: id("m"), name: "Tabela da distribuição normal.pdf", type: "pdf", subjectId: "pe", addedAt: rel(-4, 8), sizeKb: 98 },
      { id: id("m"), name: "Dados — experimento de lançamentos.xlsx", type: "planilha", subjectId: "pe", addedAt: rel(-9, 19), sizeKb: 64 },
      { id: id("m"), name: "Template de requisitos.docx", type: "doc", subjectId: "es", addedAt: rel(-11, 13), sizeKb: 156 },
    ],
  };
}
