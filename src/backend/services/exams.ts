import { assertOk, supabase, unwrap } from '../lib/supabase';
import type { Exam, ExamInsert } from '../types/database';

export const examsService = {
  async list(f: { disciplineId?: string } = {}) {
    let q = supabase.from('exams').select('*').order('exam_date', { ascending: true });
    if (f.disciplineId) q = q.eq('discipline_id', f.disciplineId);
    return unwrap(await q);
  },
  /** Provas futuras ainda sem nota. */
  async upcoming(limit = 3) {
    return unwrap(await supabase.from('exams').select('*').is('score', null)
      .gte('exam_date', new Date().toISOString()).order('exam_date').limit(limit));
  },
  async get(id: string) {
    return unwrap(await supabase.from('exams').select('*').eq('id', id).single());
  },
  async create(input: ExamInsert): Promise<Exam> {
    return unwrap(await supabase.from('exams').insert(input).select().single());
  },
  async update(id: string, patch: Partial<ExamInsert>): Promise<Exam> {
    return unwrap(await supabase.from('exams').update(patch).eq('id', id).select().single());
  },
  /** score = null remove a nota (volta a "não corrigida"). */
  setScore(id: string, score: number | null) {
    return this.update(id, { score });
  },
  async remove(id: string) {
    assertOk(await supabase.from('exams').delete().eq('id', id));
  },
};
