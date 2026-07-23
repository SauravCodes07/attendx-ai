import { createClient } from '@supabase/supabase-js'
import type { Profile } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ioxfyynymtxsunwkwejj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_x-2ARMwkIieFMIbaXpZfnw_z37ZU_l8'
const missingConfigMessage = 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'

export const ADMIN_EMAIL = 'sauravd.it25@sbjit.edu.in'

export const getAuthRedirectUrl = () => {
  const configured = import.meta.env.VITE_SITE_URL || window.location.origin
  return configured.replace(/\/$/, '')
}

const createMissingQueryBuilder = () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    neq: () => builder,
    in: () => builder,
    order: () => builder,
    limit: async () => ({ data: null, error: { message: missingConfigMessage } }),
    single: async () => ({ data: null, error: { message: missingConfigMessage } }),
    maybeSingle: async () => ({ data: null, error: null }),
  }

  return builder
}

const createFallbackClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null } }),
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({ data: { session: null }, error: { message: missingConfigMessage } }),
    signUp: async () => ({ data: { user: null, session: null }, error: { message: missingConfigMessage } }),
    resetPasswordForEmail: async () => ({ error: { message: missingConfigMessage } }),
    signInWithOAuth: async () => ({ error: { message: missingConfigMessage } }),
    updateUser: async () => ({ data: { user: null }, error: { message: missingConfigMessage } }),
  },
  from: () => ({
    select: () => createMissingQueryBuilder(),
    update: () => ({
      eq: async () => ({ data: null, error: { message: missingConfigMessage } }),
    }),
    upsert: async () => ({ data: null, error: { message: missingConfigMessage } }),
    insert: async () => ({ data: null, error: { message: missingConfigMessage } }),
    delete: () => ({
      eq: async () => ({ data: null, error: { message: missingConfigMessage } }),
    }),
  }),
  channel: () => ({
    on: function () { return this },
    subscribe: () => ({}),
  }),
  removeChannel: async () => {},
  storage: {
    from: () => ({
      upload: async () => ({ error: { message: missingConfigMessage } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
})

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createFallbackClient() as any

export const isSupabaseConfigured = hasSupabaseConfig

/**
 * Ensures a profile row exists for the given user.
 * Uses upsert so it works for both new and existing users.
 * This prevents the loading screen from getting stuck when
 * a new user has no profile row yet.
 */
export const ensureProfile = async (
  userId: string,
  email?: string | null,
  fullName?: string | null
): Promise<Profile | null> => {
  if (!isSupabaseConfigured) return null

  // First try to fetch existing profile
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (existing) return existing as Profile

  // No profile exists — create one via upsert
  const { data: created, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: email || null,
      full_name: fullName || null,
      role: email === ADMIN_EMAIL ? 'admin' : 'student',
      dark_mode: false,
      theme_preference: 'system',
    }, { onConflict: 'id' })
    .select('*')
    .single()

  if (error) {
    // If upsert fails (e.g. RLS), still return a minimal profile object
    // so the app doesn't hang on the loading screen
    return {
      id: userId,
      email: email || null,
      full_name: fullName || null,
      role: email === ADMIN_EMAIL ? 'admin' : 'student',
      avatar_url: null,
      phone: null,
      bio: null,
      dark_mode: false,
      theme_preference: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile
  }

  return created as Profile
}

export const getUserProfile = async () => {
  if (!isSupabaseConfigured) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return ensureProfile(user.id, user.email, user.user_metadata?.full_name)
}

/**
 * Check if a profile is "complete" enough to skip the profile-setup screen.
 * A profile needs at least one academic field filled in.
 */
export const isProfileComplete = (profile: Profile | null): boolean => {
  if (!profile) return false
  return Boolean(
    profile.full_name &&
    (profile.usn || profile.roll_number) &&
    (profile.department || profile.branch)
  )
}
