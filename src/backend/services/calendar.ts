import { assertOk, supabase, unwrap } from '../lib/supabase';
import type { CalendarEventInsert } from '../types/database';

export const calendarService = {
  /** Agenda unificada: tarefas (prazo), provas, estudos e compromissos. Intervalo [from, to). */
  async feed(from: string, to: string) {
    return unwrap(await supabase.from('calendar_feed').select('*')
      .gte('starts_at', from).lt('starts_at', to).order('starts_at'));
  },
  async listEvents(f: { from?: string; to?: string } = {}) {
    let q = supabase.from('calendar_events').select('*').order('starts_at');
    if (f.from) q = q.gte('starts_at', f.from);
    if (f.to) q = q.lt('starts_at', f.to);
    return unwrap(await q);
  },
  async createEvent(input: CalendarEventInsert) {
    return unwrap(await supabase.from('calendar_events').insert(input).select().single());
  },
  async updateEvent(id: string, patch: Partial<CalendarEventInsert>) {
    return unwrap(await supabase.from('calendar_events').update(patch).eq('id', id).select().single());
  },
  async removeEvent(id: string) {
    assertOk(await supabase.from('calendar_events').delete().eq('id', id));
  },
};
