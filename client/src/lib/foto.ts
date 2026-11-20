// Foto do aluno: recorta quadrado, reduz e envia para o Storage do Supabase.
import { supabase } from './supabase';

export const BUCKET_FOTOS = 'nadgol-fotos';
const LADO = 480;       // px — suficiente para avatar e perfil, e leve no celular
const QUALIDADE = 0.82;

function carregar(file: File): Promise<HTMLImageElement> {
  return new Promise((ok, erro) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); ok(img); };
    img.onerror = () => { URL.revokeObjectURL(url); erro(new Error('Não foi possível abrir essa imagem.')); };
    img.src = url;
  });
}

/** Recorta um quadrado (puxando um pouco para cima, onde fica o rosto) e devolve um JPEG pequeno. */
export async function reduzirImagem(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.');
  if (file.size > 25 * 1024 * 1024) throw new Error('Imagem muito grande (máximo 25 MB).');

  let fonte: CanvasImageSource;
  let w: number, h: number;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    fonte = bmp; w = bmp.width; h = bmp.height;
  } catch {
    const img = await carregar(file);
    fonte = img; w = img.naturalWidth; h = img.naturalHeight;
  }
  const lado = Math.min(w, h);
  const sx = (w - lado) / 2;
  const sy = (h - lado) * 0.3;
  const canvas = document.createElement('canvas');
  canvas.width = LADO; canvas.height = LADO;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Seu navegador não conseguiu processar a imagem.');
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, LADO, LADO);
  ctx.drawImage(fonte, sx, sy, lado, lado, 0, 0, LADO, LADO);
  return new Promise((ok, erro) => canvas.toBlob(b => (b ? ok(b) : erro(new Error('Falha ao preparar a foto.'))), 'image/jpeg', QUALIDADE));
}

/** Envia e devolve a URL pública. Caminho: escola/atleta/arquivo (a regra do banco confere isso). */
export async function enviarFoto(escolaId: string, atletaId: string, blob: Blob): Promise<string> {
  const nome = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
  const caminho = `${escolaId}/${atletaId}/${nome}`;
  const { error } = await supabase.storage.from(BUCKET_FOTOS).upload(caminho, blob, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET_FOTOS).getPublicUrl(caminho).data.publicUrl;
}

/** Apaga a foto antiga (melhor esforço: se falhar, só sobra um arquivo). */
export async function removerFotoAntiga(url?: string | null) {
  if (!url) return;
  const i = url.indexOf(`/${BUCKET_FOTOS}/`);
  if (i < 0) return;
  const caminho = decodeURIComponent(url.slice(i + BUCKET_FOTOS.length + 2).split('?')[0]);
  try { await supabase.storage.from(BUCKET_FOTOS).remove([caminho]); } catch { /* ignora */ }
}
