/** Regras da senha: mínimo 8 caracteres, com maiúscula, minúscula e número. */
export const REGRAS_SENHA: { id: string; texto: string; ok: (s: string) => boolean }[] = [
  { id: 'tam', texto: 'Pelo menos 8 caracteres', ok: s => s.length >= 8 },
  { id: 'mai', texto: 'Uma letra maiúscula', ok: s => /[A-ZÀ-Ý]/.test(s) },
  { id: 'min', texto: 'Uma letra minúscula', ok: s => /[a-zß-ÿ]/.test(s) },
  { id: 'num', texto: 'Um número', ok: s => /[0-9]/.test(s) },
];

export const senhaForte = (s: string) => REGRAS_SENHA.every(r => r.ok(s));
