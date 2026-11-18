import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { assertOk, siteUrl, supabase, unwrap } from '../lib/supabase';
import type { Profile } from '../types/database';

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName }, emailRedirectTo: siteUrl },
    });
    if (error) throw error;
    return data; // data.session é null enquanto o e-mail não for confirmado
  },
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  /** Envia o e-mail de recuperação; o link volta para a raiz do app. */
  async requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: siteUrl });
    if (error) throw error;
  },
  /** Chamar na tela de nova senha (após o evento PASSWORD_RECOVERY). */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  /** Eventos relevantes: SIGNED_IN, SIGNED_OUT, PASSWORD_RECOVERY. Retorna função de cancelamento. */
  onAuthChange(cb: (event: AuthChangeEvent, session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(cb);
    return () => data.subscription.unsubscribe();
  },
};

export const profileService = {
  async get(): Promise<Profile> {
    const session = await authService.getSession();
    if (!session) throw new Error('Não autenticado.');
    return unwrap(await supabase.from('profiles').select('*').eq('id', session.user.id).single());
  },
  async update(patch: Partial<Pick<Profile,
    'full_name' | 'course' | 'university' | 'current_period' | 'student_id' | 'avatar_url' | 'timezone' | 'weekly_study_goal_minutes' | 'week_starts_on' | 'notifications'>>) {
    const session = await authService.getSession();
    if (!session) throw new Error('Não autenticado.');
    assertOk(await supabase.from('profiles').update(patch).eq('id', session.user.id));
  },
};
