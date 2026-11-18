import { assertOk, supabase, unwrap } from '../lib/supabase';
import type { Material } from '../types/database';
import { authService } from './auth';

const BUCKET = 'materials';
const MAX_BYTES = 25 * 1024 * 1024; // mesmo limite do bucket

const safeName = (n: string) => n.replace(/[^\w.\-]+/g, '_').slice(-100);

export const materialsService = {
  async list(f: { disciplineId?: string } = {}) {
    let q = supabase.from('materials').select('*').order('created_at', { ascending: false });
    if (f.disciplineId) q = q.eq('discipline_id', f.disciplineId);
    return unwrap(await q);
  },
  async addLink(input: { title: string; url: string; disciplineId?: string | null; description?: string }): Promise<Material> {
    return unwrap(await supabase.from('materials').insert({
      kind: 'link', title: input.title, url: input.url,
      discipline_id: input.disciplineId ?? null, description: input.description ?? null,
    }).select().single());
  },
  /** Envia o arquivo para <user_id>/<uuid>-<nome> e registra a linha; desfaz o upload se o registro falhar. */
  async uploadFile(file: File, input: { title?: string; disciplineId?: string | null; description?: string } = {}): Promise<Material> {
    if (file.size > MAX_BYTES) throw new Error('Arquivo maior que 25 MB.');
    const session = await authService.getSession();
    if (!session) throw new Error('Não autenticado.');
    const path = `${session.user.id}/${crypto.randomUUID()}-${safeName(file.name)}`;

    const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) throw up.error;

    const res = await supabase.from('materials').insert({
      kind: 'file', title: input.title?.trim() || file.name, storage_path: path,
      file_name: file.name, mime_type: file.type || null, size_bytes: file.size,
      discipline_id: input.disciplineId ?? null, description: input.description ?? null,
    }).select().single();
    if (res.error) {
      await supabase.storage.from(BUCKET).remove([path]);
      throw res.error;
    }
    return res.data;
  },
  async update(id: string, patch: Partial<Pick<Material, 'title' | 'description' | 'discipline_id'>>) {
    return unwrap(await supabase.from('materials').update(patch).eq('id', id).select().single());
  },
  /** URL assinada e temporária (bucket privado). */
  async getDownloadUrl(m: Pick<Material, 'kind' | 'url' | 'storage_path'>, expiresInSeconds = 3600) {
    if (m.kind === 'link') return m.url as string;
    const { data, error } = await supabase.storage.from(BUCKET)
      .createSignedUrl(m.storage_path as string, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
  },
  /** Remove o arquivo do Storage (se houver) e depois a linha. */
  async remove(m: Pick<Material, 'id' | 'kind' | 'storage_path'>) {
    if (m.kind === 'file' && m.storage_path) {
      const { error } = await supabase.storage.from(BUCKET).remove([m.storage_path]);
      if (error) throw error;
    }
    assertOk(await supabase.from('materials').delete().eq('id', m.id));
  },
};
