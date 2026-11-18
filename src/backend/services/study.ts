import { assertOk, supabase, unwrap } from '../lib/supabase';
import type { StudySession, StudySessionInsert } from '../types/database';

export const studyService = {
  /** from/to: ISO. Intervalo [from, to). */
  async list(f: { from?: string; to?: string; disciplineId?: string } = {}) {
    let q = supabase.from('study_sessions').select('*').order('starts_at');
    if (f.from) q = q.gte('starts_at', f.from);
    if (f.to) q = q.lt('starts_at', f.to);
    if (f.disciplineId) q = q.eq('discipline_id', f.disciplineId);
    return unwrap(await q);
  },
  async create(input: StudySessionInsert): Promise<StudySession> {
    return unwrap(await supabase.from('study_sessions').insert(input).select().single());
  },
  async update(id: string, patch: Partial<StudySessionInsert>): Promise<StudySession> {
    return unwrap(await supabase.from('study_sessions').update(patch).eq('id', id).select().single());
  },
  complete(id: string) {
    return this.update(id, { status: 'done' });
  },
  async remove(id: string) {
    assertOk(await supabase.from('study_sessions').delete().eq('id', id));
  },
};
