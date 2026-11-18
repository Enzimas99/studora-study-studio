import { supabase, unwrap } from '../lib/supabase';
import { calendarService } from './calendar';
import { disciplinesService } from './disciplines';
import { examsService } from './exams';
import { tasksService } from './tasks';

export const dashboardService = {
  async summary() {
    return unwrap(await supabase.rpc('dashboard_summary'));
  },
  /** Segunda→domingo, minutos estudados/planejados por dia (fuso do perfil). */
  async weeklyProgress() {
    return unwrap(await supabase.rpc('weekly_study_progress'));
  },
  /** Carrega tudo o que o Dashboard precisa em paralelo. */
  async load(opts: { priorities?: number; upcomingExams?: number; agendaDays?: number } = {}) {
    const now = new Date();
    const end = new Date(now.getTime() + (opts.agendaDays ?? 4) * 86_400_000);
    const [summary, weekly, priorities, exams, agenda, disciplines] = await Promise.all([
      this.summary(),
      this.weeklyProgress(),
      tasksService.priorities(opts.priorities ?? 5),
      examsService.upcoming(opts.upcomingExams ?? 3),
      calendarService.feed(now.toISOString(), end.toISOString()),
      disciplinesService.overview(),
    ]);
    return { summary, weekly, priorities, exams, agenda, disciplines };
  },
};
