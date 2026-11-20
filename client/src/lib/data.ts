// ============================================================
// NADGOL ACADEMY — Mock Data Store
// ============================================================

export type UserRole = 'admin' | 'coach' | 'parent' | 'athlete';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  /** Escola ativa (multi-escola). Vazio no modo demonstração. */
  escolaId?: string;
  escolaNome?: string;
  /** Preenchido quando o usuário logado é o próprio atleta. */
  atletaId?: string;
  superAdmin?: boolean;
}

export interface Athlete {
  id: string;
  name: string;
  photo?: string;
  birthYear: number;
  birthDate: string;
  position: string;
  dominantFoot: 'Direito' | 'Esquerdo' | 'Ambos';
  height: number;
  weight: number;
  phone: string;
  unit: string;
  observations?: string;
  goal?: string;
  dream?: string;
  favoriteClub?: string;
  classId: string;
  status: 'active' | 'inactive';
  ranking?: number;
  goals?: number;
  assists?: number;
  attendance?: number;
  monthlyFee?: number;
  dueDay?: number;
}

export interface TrainingClass {
  id: string;
  name: string;
  day: string;
  time: string;
  coach: string;
  unit: string;
  category: string;
  athletes: string[];
  maxAthletes: number;
}

export interface AttendanceRecord {
  id: string;
  athleteId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  performance?: 'highlight' | 'great' | 'evolving' | 'needs_work';
  classId: string;
}

export interface PerformanceRecord {
  id: string;
  athleteId: string;
  date: string;
  weight: number;
  height: number;
  vo2?: number;
  speed?: number;
  endurance?: number;
}

export interface Competition {
  id: string;
  name: string;
  date: string;
  result?: string;
  athletes: string[];
}

export interface FinancialRecord {
  id: string;
  athleteId: string;
  month: string;
  year: number;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  observations?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'training' | 'game' | 'payment' | 'announcement' | 'evaluation' | 'event';
  date: string;
  read: boolean;
  targetRoles: UserRole[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
  roomId: string;
}

// ============================================================
// MOCK DATA
// ============================================================

export const USERS: User[] = [
  { id: 'u1', name: 'Carlos Mendes', role: 'admin', email: 'admin@nadgol.com' },
  { id: 'u2', name: 'Rafael Silva', role: 'coach', email: 'rafael@nadgol.com' },
  { id: 'u3', name: 'João Santos', role: 'parent', email: 'joao@email.com' },
  { id: 'u4', name: 'Lucas Oliveira', role: 'athlete', email: 'lucas@email.com' },
];

export const ATHLETES: Athlete[] = [
  { id: 'a1', name: 'Lucas Oliveira', birthYear: 2010, birthDate: '2010-03-15', position: 'Atacante', dominantFoot: 'Direito', height: 165, weight: 58, phone: '(11) 99999-0001', unit: 'Unidade Centro', goal: 'Jogar profissionalmente', dream: 'Champions League', favoriteClub: 'Real Madrid', classId: 'c1', status: 'active', ranking: 1, goals: 12, assists: 8, attendance: 95 },
  { id: 'a2', name: 'Pedro Alves', birthYear: 2011, birthDate: '2011-07-22', position: 'Meio-Campo', dominantFoot: 'Esquerdo', height: 158, weight: 52, phone: '(11) 99999-0002', unit: 'Unidade Centro', goal: 'Ser titular', dream: 'Seleção Brasileira', favoriteClub: 'Barcelona', classId: 'c1', status: 'active', ranking: 2, goals: 6, assists: 14, attendance: 88 },
  { id: 'a3', name: 'Gabriel Costa', birthYear: 2012, birthDate: '2012-01-08', position: 'Zagueiro', dominantFoot: 'Direito', height: 162, weight: 60, phone: '(11) 99999-0003', unit: 'Unidade Norte', goal: 'Melhorar defesa', dream: 'Serie A', favoriteClub: 'Juventus', classId: 'c2', status: 'active', ranking: 3, goals: 2, assists: 3, attendance: 92 },
  { id: 'a4', name: 'Matheus Lima', birthYear: 2010, birthDate: '2010-11-30', position: 'Goleiro', dominantFoot: 'Direito', height: 172, weight: 65, phone: '(11) 99999-0004', unit: 'Unidade Centro', goal: 'Ser o melhor goleiro', dream: 'Premier League', favoriteClub: 'Manchester City', classId: 'c1', status: 'active', ranking: 4, goals: 0, assists: 1, attendance: 97 },
  { id: 'a5', name: 'Felipe Rocha', birthYear: 2013, birthDate: '2013-05-18', position: 'Lateral', dominantFoot: 'Direito', height: 155, weight: 48, phone: '(11) 99999-0005', unit: 'Unidade Sul', goal: 'Evoluir tecnicamente', dream: 'Flamengo', favoriteClub: 'Flamengo', classId: 'c3', status: 'active', ranking: 5, goals: 3, assists: 7, attendance: 83 },
  { id: 'a6', name: 'Bruno Ferreira', birthYear: 2011, birthDate: '2011-09-12', position: 'Atacante', dominantFoot: 'Ambos', height: 160, weight: 55, phone: '(11) 99999-0006', unit: 'Unidade Norte', goal: 'Marcar muitos gols', dream: 'Copa do Mundo', favoriteClub: 'PSG', classId: 'c2', status: 'active', ranking: 6, goals: 9, assists: 5, attendance: 79 },
  { id: 'a7', name: 'Thiago Nascimento', birthYear: 2012, birthDate: '2012-08-25', position: 'Meio-Campo', dominantFoot: 'Direito', height: 157, weight: 51, phone: '(11) 99999-0007', unit: 'Unidade Centro', goal: 'Jogar na Europa', dream: 'Bayern Munich', favoriteClub: 'Bayern Munich', classId: 'c1', status: 'active', ranking: 7, goals: 4, assists: 11, attendance: 91 },
  { id: 'a8', name: 'Caio Martins', birthYear: 2014, birthDate: '2014-02-14', position: 'Atacante', dominantFoot: 'Esquerdo', height: 148, weight: 42, phone: '(11) 99999-0008', unit: 'Unidade Sul', goal: 'Ser destaque', dream: 'Palmeiras', favoriteClub: 'Palmeiras', classId: 'c3', status: 'active', ranking: 8, goals: 7, assists: 4, attendance: 86 },
  { id: 'a9', name: 'André Santos', birthYear: 2010, birthDate: '2010-06-03', position: 'Zagueiro', dominantFoot: 'Direito', height: 170, weight: 63, phone: '(11) 99999-0009', unit: 'Unidade Norte', goal: 'Capitão do time', dream: 'Seleção Sub-17', favoriteClub: 'São Paulo', classId: 'c2', status: 'active', ranking: 9, goals: 1, assists: 2, attendance: 94 },
  { id: 'a10', name: 'Vitor Pereira', birthYear: 2013, birthDate: '2013-12-07', position: 'Lateral', dominantFoot: 'Esquerdo', height: 152, weight: 46, phone: '(11) 99999-0010', unit: 'Unidade Centro', goal: 'Melhorar físico', dream: 'Corinthians', favoriteClub: 'Corinthians', classId: 'c1', status: 'active', ranking: 10, goals: 2, assists: 6, attendance: 78 },
  { id: 'a11', name: 'Rodrigo Souza', birthYear: 2011, birthDate: '2011-04-19', position: 'Meio-Campo', dominantFoot: 'Direito', height: 159, weight: 53, phone: '(11) 99999-0011', unit: 'Unidade Sul', goal: 'Jogar no exterior', dream: 'Atlético Madrid', favoriteClub: 'Atlético Madrid', classId: 'c3', status: 'active', ranking: 11, goals: 5, assists: 9, attendance: 89 },
  { id: 'a12', name: 'Diego Carvalho', birthYear: 2012, birthDate: '2012-10-31', position: 'Goleiro', dominantFoot: 'Direito', height: 168, weight: 61, phone: '(11) 99999-0012', unit: 'Unidade Norte', goal: 'Zero a zero', dream: 'Inter de Milão', favoriteClub: 'Inter de Milão', classId: 'c2', status: 'inactive', ranking: 12, goals: 0, assists: 0, attendance: 65 },
];

export const CLASSES: TrainingClass[] = [
  { id: 'c1', name: 'Sub-15 / Sub-14 — Segunda 08h', day: 'Segunda-feira', time: '08:00', coach: 'Rafael Silva', unit: 'Unidade Centro', category: 'Sub-15/Sub-14', athletes: ['a1', 'a2', 'a4', 'a7', 'a10'], maxAthletes: 20 },
  { id: 'c2', name: 'Sub-15 / Sub-13 — Terça 14h', day: 'Terça-feira', time: '14:00', coach: 'Marcos Andrade', unit: 'Unidade Norte', category: 'Sub-15/Sub-13', athletes: ['a3', 'a6', 'a9', 'a12'], maxAthletes: 20 },
  { id: 'c3', name: 'Sub-13 / Sub-12 — Quarta 16h', day: 'Quarta-feira', time: '16:00', coach: 'Rafael Silva', unit: 'Unidade Sul', category: 'Sub-13/Sub-12', athletes: ['a5', 'a8', 'a11'], maxAthletes: 18 },
  { id: 'c4', name: 'Performance Elite — Quinta 07h', day: 'Quinta-feira', time: '07:00', coach: 'Dr. Paulo Fitness', unit: 'Studio CT', category: 'Performance', athletes: ['a1', 'a4', 'a9'], maxAthletes: 10 },
];

export const ATTENDANCE: AttendanceRecord[] = [
  { id: 'att1', athleteId: 'a1', date: '2026-05-15', status: 'present', performance: 'highlight', classId: 'c1' },
  { id: 'att2', athleteId: 'a2', date: '2026-05-15', status: 'present', performance: 'great', classId: 'c1' },
  { id: 'att3', athleteId: 'a4', date: '2026-05-15', status: 'present', performance: 'evolving', classId: 'c1' },
  { id: 'att4', athleteId: 'a7', date: '2026-05-15', status: 'absent', classId: 'c1' },
  { id: 'att5', athleteId: 'a10', date: '2026-05-15', status: 'late', performance: 'needs_work', classId: 'c1' },
  { id: 'att6', athleteId: 'a3', date: '2026-05-14', status: 'present', performance: 'great', classId: 'c2' },
  { id: 'att7', athleteId: 'a6', date: '2026-05-14', status: 'present', performance: 'highlight', classId: 'c2' },
];

export const PERFORMANCE: PerformanceRecord[] = [
  { id: 'p1', athleteId: 'a1', date: '2026-05-01', weight: 58, height: 165, vo2: 52, speed: 28.5, endurance: 85 },
  { id: 'p2', athleteId: 'a1', date: '2026-04-01', weight: 57, height: 164, vo2: 50, speed: 27.8, endurance: 82 },
  { id: 'p3', athleteId: 'a1', date: '2026-03-01', weight: 56, height: 163, vo2: 48, speed: 27.2, endurance: 79 },
  { id: 'p4', athleteId: 'a2', date: '2026-05-01', weight: 52, height: 158, vo2: 48, speed: 26.1, endurance: 78 },
  { id: 'p5', athleteId: 'a4', date: '2026-05-01', weight: 65, height: 172, vo2: 55, speed: 25.0, endurance: 88 },
];

export const COMPETITIONS: Competition[] = [
  { id: 'comp1', name: 'Copa São Paulo Sub-15 2026', date: '2026-06-10', athletes: ['a1', 'a2', 'a4', 'a7'] },
  { id: 'comp2', name: 'Torneio Regional Sub-14', date: '2026-05-25', result: '2° Lugar', athletes: ['a2', 'a7', 'a10'] },
  { id: 'comp3', name: 'Campeonato Municipal Sub-13', date: '2026-04-15', result: 'Campeão 🏆', athletes: ['a3', 'a5', 'a8'] },
];

export const FINANCIAL: FinancialRecord[] = [
  { id: 'f1', athleteId: 'a1', month: 'Maio', year: 2026, amount: 350, status: 'paid', paidDate: '2026-05-05' },
  { id: 'f2', athleteId: 'a2', month: 'Maio', year: 2026, amount: 350, status: 'pending' },
  { id: 'f3', athleteId: 'a3', month: 'Maio', year: 2026, amount: 350, status: 'paid', paidDate: '2026-05-03' },
  { id: 'f4', athleteId: 'a4', month: 'Maio', year: 2026, amount: 350, status: 'overdue' },
  { id: 'f5', athleteId: 'a5', month: 'Maio', year: 2026, amount: 350, status: 'paid', paidDate: '2026-05-10' },
  { id: 'f6', athleteId: 'a6', month: 'Maio', year: 2026, amount: 350, status: 'overdue' },
  { id: 'f7', athleteId: 'a7', month: 'Maio', year: 2026, amount: 350, status: 'pending' },
  { id: 'f8', athleteId: 'a8', month: 'Maio', year: 2026, amount: 350, status: 'paid', paidDate: '2026-05-08' },
  { id: 'f9', athleteId: 'a9', month: 'Maio', year: 2026, amount: 350, status: 'paid', paidDate: '2026-05-02' },
  { id: 'f10', athleteId: 'a10', month: 'Maio', year: 2026, amount: 350, status: 'pending' },
  { id: 'f11', athleteId: 'a11', month: 'Maio', year: 2026, amount: 350, status: 'paid', paidDate: '2026-05-06' },
  { id: 'f12', athleteId: 'a12', month: 'Maio', year: 2026, amount: 350, status: 'overdue' },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Treino Amanhã', message: 'Treino Sub-15 confirmado para amanhã às 08h. Chegue com 15 min de antecedência.', type: 'training', date: '2026-05-16', read: false, targetRoles: ['athlete', 'parent'] },
  { id: 'n2', title: 'Copa São Paulo — Convocação', message: 'Os atletas selecionados para a Copa SP foram convocados. Verifique a lista.', type: 'game', date: '2026-05-15', read: false, targetRoles: ['athlete', 'parent', 'coach'] },
  { id: 'n3', title: 'Mensalidade Maio', message: 'Mensalidade de Maio vence em 3 dias. Evite atrasos.', type: 'payment', date: '2026-05-14', read: true, targetRoles: ['parent'] },
  { id: 'n4', title: 'Avaliação Física', message: 'Avaliação física mensal agendada para 20/05. Compareça em jejum.', type: 'evaluation', date: '2026-05-13', read: true, targetRoles: ['athlete', 'parent', 'coach'] },
  { id: 'n5', title: 'Evento: Dia do Atleta', message: 'Dia 25/05 teremos o Dia do Atleta Nadgol Academy. Presença obrigatória.', type: 'event', date: '2026-05-12', read: true, targetRoles: ['athlete', 'parent', 'coach', 'admin'] },
];

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', senderId: 'u2', senderName: 'Rafael Silva', senderRole: 'coach', message: 'Pessoal, treino de amanhã com foco em finalização. Tragam energia! 💪', timestamp: '2026-05-16T09:30:00', roomId: 'general' },
  { id: 'm2', senderId: 'u3', senderName: 'João Santos', senderRole: 'parent', message: 'Treinador, o Lucas pode sair 30 min mais cedo amanhã?', timestamp: '2026-05-16T09:45:00', roomId: 'general' },
  { id: 'm3', senderId: 'u2', senderName: 'Rafael Silva', senderRole: 'coach', message: 'Claro João, sem problema. Avisarei quando ele puder ir.', timestamp: '2026-05-16T09:50:00', roomId: 'general' },
  { id: 'm4', senderId: 'u4', senderName: 'Lucas Oliveira', senderRole: 'athlete', message: 'Treinador, posso treinar mais cedo para trabalhar o chute?', timestamp: '2026-05-16T10:00:00', roomId: 'general' },
  { id: 'm5', senderId: 'u2', senderName: 'Rafael Silva', senderRole: 'coach', message: 'Isso aí Lucas! Atitude de campeão! Chega às 07h30.', timestamp: '2026-05-16T10:05:00', roomId: 'general' },
];

// Helper functions
export function getCategory(birthYear: number): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  if (age <= 8) return 'Sub-9';
  if (age <= 9) return 'Sub-10';
  if (age <= 10) return 'Sub-11';
  if (age <= 11) return 'Sub-12';
  if (age <= 12) return 'Sub-13';
  if (age <= 13) return 'Sub-14';
  if (age <= 14) return 'Sub-15';
  if (age <= 15) return 'Sub-16';
  if (age <= 16) return 'Sub-17';
  if (age <= 17) return 'Sub-18';
  if (age <= 20) return 'Sub-20';
  return 'Sênior';
}

export function getAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function getBirthdaysThisMonth(): Athlete[] {
  const currentMonth = new Date().getMonth() + 1;
  return ATHLETES.filter(a => {
    const month = parseInt(a.birthDate.split('-')[1]);
    return month === currentMonth;
  });
}
