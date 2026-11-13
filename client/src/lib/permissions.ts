import type { UserRole } from "./data";

// O que cada perfil enxerga no menu e pode abrir pela URL.
// Isto é só experiência de uso: quem protege os dados é o RLS no banco.
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'classes', 'athletes', 'attendance', 'performance', 'nadscore', 'journey', 'scout', 'intelligence', 'mentality', 'radar', 'competitions', 'financial', 'evolution', 'ranking', 'notifications', 'chat', 'access', 'settings'],
  coach: ['dashboard', 'classes', 'athletes', 'attendance', 'performance', 'nadscore', 'journey', 'scout', 'intelligence', 'mentality', 'radar', 'tactical', 'competitions', 'evolution', 'ranking', 'notifications', 'chat'],
  parent: ['dashboard', 'attendance', 'financial', 'evolution', 'nadscore', 'journey', 'mentality', 'notifications', 'chat'],
  athlete: ['dashboard', 'performance', 'nadscore', 'journey', 'scout', 'intelligence', 'mentality', 'radar', 'daily', 'mindgame', 'profile', 'evolution', 'ranking', 'notifications', 'chat'],
};

export function canAccess(role: UserRole, section: string) {
  return ROLE_PERMISSIONS[role]?.includes(section) ?? false;
}

/** Telas já ligadas ao banco. As demais ainda mostram dados de exemplo. */
export const SECOES_CONECTADAS = new Set(['evolution', 'daily', 'journey', 'tactical', 'mindgame', 'profile', 'performance', 'ranking', 'competitions', 'notifications', 'chat', 'access', 'dashboard', 'athletes', 'classes', 'attendance', 'financial', 'settings', 'nadscore', 'scout', 'radar', 'intelligence', 'mentality']);
