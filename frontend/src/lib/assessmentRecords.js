import { supabase } from './supabaseClient';

export async function loadAssessmentRecords() {
  if (!supabase) throw new Error('Cloud database is not configured.');
  const { data, error } = await supabase
    .from('assessment_records')
    .select('id, assessment_type, completed_at, quality, effective_fps, results, created_at')
    .order('completed_at', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

export async function saveAssessmentRecord(userId, assessmentType, results) {
  if (!supabase) throw new Error('Cloud database is not configured.');
  const { data, error } = await supabase
    .from('assessment_records')
    .insert({
      user_id: userId,
      assessment_type: assessmentType,
      completed_at: new Date().toISOString(),
      quality: results.quality || null,
      effective_fps: results.effective_fps != null && Number.isFinite(Number(results.effective_fps)) ? Number(results.effective_fps) : null,
      results
    })
    .select('id, assessment_type, completed_at, quality, effective_fps, results, created_at')
    .single();
  if (error) throw error;
  return data;
}
