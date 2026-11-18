import { assertOk, supabase, unwrap } from '../lib/supabase';
import type { Task, TaskInsert, TaskStatus } from '../types/database';

export const tasksService = {
  async list(f: { disciplineId?: string; status?: TaskStatus; pendingOnly?: boolean } = {}) {
    let q = supabase.from('tasks').select('*').order('due_at', { ascending: true, nullsFirst: false });
    if (f.disciplineId) q = q.eq('discipline_id', f.disciplineId);
    if (f.status) q = q.eq('status', f.status);
    if (f.pendingOnly) q = q.neq('status', 'done');
    return unwrap(await q);
  },
  /** Pendentes por urgência (prazo mais próximo primeiro; atrasadas aparecem no topo). */
  priorities(limit = 5) {
    return this.list({ pendingOnly: true }).then((t) => t.slice(0, limit));
  },
  async get(id: string) {
    return unwrap(await supabase.from('tasks').select('*').eq('id', id).single());
  },
  async create(input: TaskInsert): Promise<Task> {
    return unwrap(await supabase.from('tasks').insert(input).select().single());
  },
  async update(id: string, patch: Partial<TaskInsert>): Promise<Task> {
    return unwrap(await supabase.from('tasks').update(patch).eq('id', id).select().single());
  },
  setStatus(id: string, status: TaskStatus) {
    return this.update(id, { status });
  },
  async remove(id: string) {
    assertOk(await supabase.from('tasks').delete().eq('id', id));
  },
};
