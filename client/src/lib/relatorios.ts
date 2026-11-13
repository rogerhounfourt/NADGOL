// Relatórios em PDF: monta uma página A4 com a identidade Nadgol e abre o diálogo de
// impressão do aparelho ("Salvar como PDF"). Sem dependências e funciona no celular.
import type { MetricaAtleta, JogoAtleta, AvalFisica, Avaliacao } from './queries';
import { TIPO_AVALIACAO } from './queries';

const esc = (v: unknown) => String(v ?? '—').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const dataBR = (d: string) => (d ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : '—');
const num = (v: number | null | undefined, suf = '') => (v === null || v === undefined ? '—' : `${v}${suf}`);

const CSS = `
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; font-size: 12px; margin: 0; }
  header { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #CC1A1A; padding-bottom: 10px; margin-bottom: 16px; }
  header img { width: 42px; }
  header h1 { font-size: 20px; margin: 0; letter-spacing: 1px; }
  header p { margin: 2px 0 0; color: #666; font-size: 11px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #CC1A1A; margin: 18px 0 8px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .kpi { border: 1px solid #ddd; border-radius: 8px; padding: 10px; text-align: center; }
  .kpi b { display: block; font-size: 20px; color: #CC1A1A; }
  .kpi span { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #111; color: #fff; text-align: left; padding: 6px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
  td { padding: 6px 8px; border-bottom: 1px solid #e5e5e5; }
  tr:nth-child(even) td { background: #fafafa; }
  .vazio { color: #888; font-style: italic; }
  footer { margin-top: 24px; font-size: 10px; color: #888; border-top: 1px solid #ddd; padding-top: 8px; }
  tr, .kpi { break-inside: avoid; }
`;

function cabecalho(titulo: string, escola: string) {
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  return `<header><img src="${location.origin}/escudo-nadgol.svg" alt=""/><div><h1>${esc(titulo)}</h1><p>${esc(escola)} · Gerado em ${hoje}</p></div></header>`;
}
const kpi = (rotulo: string, valor: string) => `<div class="kpi"><b>${esc(valor)}</b><span>${esc(rotulo)}</span></div>`;
const tabela = (cols: string[], linhas: (string | number)[][], vazio: string) =>
  linhas.length
    ? `<table><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${linhas.map(l => `<tr>${l.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    : `<p class="vazio">${esc(vazio)}</p>`;

export function imprimirRelatorio(titulo: string, corpo: string) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>${CSS}</style></head><body>${corpo}</body></html>`);
  doc.close();
  const limpar = () => setTimeout(() => iframe.remove(), 1000);
  const imprimir = () => { iframe.contentWindow!.focus(); iframe.contentWindow!.print(); limpar(); };
  // espera o escudo carregar antes de imprimir
  const img = doc.querySelector('img');
  if (img && !img.complete) { img.onload = imprimir; img.onerror = imprimir; } else setTimeout(imprimir, 150);
}

export function relatorioAtleta(p: {
  escola: string; metrica: MetricaAtleta; jogos: JogoAtleta[]; fisicas: AvalFisica[]; avaliacoes: Avaliacao[];
}) {
  const m = p.metrica;
  const corpo = `
    ${cabecalho(`Relatório do atleta — ${m.nome}`, p.escola)}
    <p><b>${esc(m.nome)}</b> · ${esc(m.posicao)} · ${esc(m.idade)} anos · ${esc(m.categoria)}</p>
    <div class="kpis">
      ${kpi('NadScore', num(m.nadscore))}${kpi('Overall', num(m.overall))}${kpi('Presença', num(m.presenca, '%'))}${kpi('Jogos', String(m.jogos))}
      ${kpi('Gols', String(m.gols))}${kpi('Assistências', String(m.assistencias))}${kpi('Evolução VO2', m.vo2Evolucao === null ? '—' : `${m.vo2Evolucao > 0 ? '+' : ''}${m.vo2Evolucao}%`)}${kpi('Velocidade máx.', num(m.velocidadeMax, ' km/h'))}
    </div>
    <h2>Avaliações físicas</h2>
    ${tabela(['Data', 'Peso (kg)', 'Altura (cm)', 'VO2', 'Velocidade (km/h)', 'Resistência'],
      [...p.fisicas].reverse().map(f => [dataBR(f.data), num(f.peso), num(f.altura), num(f.vo2), num(f.velocidade), num(f.resistencia)]), 'Nenhuma medição registrada.')}
    <h2>Avaliações técnicas, táticas e comportamentais</h2>
    ${tabela(['Data', 'Tipo', 'Nota', 'Comentário'],
      p.avaliacoes.map(a => [dataBR(a.data), TIPO_AVALIACAO[a.tipo], num(a.nota), a.comentario ?? '—']), 'Nenhuma avaliação registrada.')}
    <h2>Jogos</h2>
    ${tabela(['Data', 'Adversário', 'Tipo', 'Gols', 'Assist.', 'Nota'],
      p.jogos.map(j => [dataBR(j.data), j.adversario, j.competicao ? 'Competição' : 'Amistoso', j.gols, j.assistencias, num(j.nadscore)]), 'Nenhum jogo registrado.')}
    <footer>Nadgol Academy · Documento gerado automaticamente a partir dos dados da escola.</footer>`;
  imprimirRelatorio(`Relatório - ${m.nome}`, corpo);
}

export function relatorioEscola(p: { escola: string; atletas: MetricaAtleta[] }) {
  const a = [...p.atletas].sort((x, y) => y.overall - x.overall);
  const soma = (f: (m: MetricaAtleta) => number) => a.reduce((t, m) => t + f(m), 0);
  const presMedia = a.length ? Math.round(soma(m => m.presenca) / a.length) : 0;
  const corpo = `
    ${cabecalho('Relatório geral da escola', p.escola)}
    <div class="kpis">
      ${kpi('Atletas ativos', String(a.length))}${kpi('Presença média', `${presMedia}%`)}${kpi('Gols', String(soma(m => m.gols)))}${kpi('Assistências', String(soma(m => m.assistencias)))}
    </div>
    <h2>Atletas (por overall)</h2>
    ${tabela(['#', 'Atleta', 'Posição', 'Categoria', 'Overall', 'NadScore', 'Presença', 'Jogos', 'Gols', 'Assist.'],
      a.map((m, i) => [i + 1, m.nome, m.posicao, m.categoria, m.overall, num(m.nadscore), `${m.presenca}%`, m.jogos, m.gols, m.assistencias]), 'Nenhum atleta ativo.')}
    <footer>Nadgol Academy · Documento gerado automaticamente a partir dos dados da escola.</footer>`;
  imprimirRelatorio('Relatório geral da escola', corpo);
}
