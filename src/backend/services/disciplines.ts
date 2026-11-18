import { assertOk, supabase, unwrap } from '../lib/supabase';
import type { Discipline, DisciplineInsert } from '../types/database';

export const disciplinesService = {
  async list(opts: { includeArchived?: boolean } = {}) {
    let q = supabase.from('disciplines').select('*').order('name');
    if (!opts.includeArchived) q = q.eq('is_archived', false);
    return unwrap(await q);
  },
  /** Cards/tabela: pendentes, feitas/total, próxima avaliação, média, conteúdo. */
  async overview() {
    return unwrap(await supabase.from('discipline_overview').select('*')
      .eq('is_archived', false).order('name'));
  },
  async get(id: string) {
    return unwrap(await supabase.from('disciplines').select('*').eq('id', id).single());
  },
  async create(input: DisciplineInsert): Promise<Discipline> {
    return unwrap(await supabase.from('disciplines').insert(input).select().single());
  },
  async update(id: string, patch: Partial<DisciplineInsert>): Promise<Discipline> {
    return unwrap(await supabase.from('disciplines').update(patch).eq('id', id).select().single());
  },
  /** Apaga também tarefas e provas da disciplina (cascata). Materiais ficam sem disciplina. */
  async remove(id: string) {
    assertOk(await supabase.from('disciplines').delete().eq('id', id));
  },
};
