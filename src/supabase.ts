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
 * Check if a profile is "complete" enough to skip the onboarding screen (First Login check).
 * Only requires the minimal onboarding fields.
 */
export const isProfileComplete = (profile: Profile | null): boolean => {
  if (!profile) return false
  return Boolean(
    profile.full_name?.trim() &&
    profile.branch?.trim() &&
    profile.department?.trim() &&
    profile.year?.trim() &&
    profile.semester?.trim()
  )
}

/** Fields counted toward 100% profile completion (11 total). */
export const PROFILE_COMPLETENESS_FIELDS = [
  { key: 'full_name' as const, label: 'Full Name' },
  { key: 'branch' as const, label: 'Branch' },
  { key: 'department' as const, label: 'Department' },
  { key: 'year' as const, label: 'Year' },
  { key: 'semester' as const, label: 'Semester' },
  { key: 'phone' as const, label: 'Phone Number' },
  { key: 'dob' as const, label: 'Date of Birth' },
  { key: 'address' as const, label: 'Address' },
  { key: 'gender' as const, label: 'Gender' },
  { key: 'roll_number' as const, label: 'Roll Number' },
  { key: 'emergency_contact' as const, label: 'Emergency Contact' },
]

/**
 * Calculates profile completeness percentage (0–100) from 11 key fields.
 */
export const calculateCompletionPercentage = (profile: Profile | null): number => {
  if (!profile) return 0
  const filledCount = PROFILE_COMPLETENESS_FIELDS.filter(({ key }) => {
    const value = profile[key]
    return value !== null && value !== undefined && value.toString().trim() !== ''
  }).length
  return Math.round((filledCount / PROFILE_COMPLETENESS_FIELDS.length) * 100)
}

/**
 * Returns human-readable labels for unfilled completeness fields.
 */
export const getMissingFields = (profile: Profile | null): string[] => {
  if (!profile) return PROFILE_COMPLETENESS_FIELDS.map(({ label }) => label)
  return PROFILE_COMPLETENESS_FIELDS.filter(({ key }) => {
    const value = profile[key]
    return !value || value.toString().trim() === ''
  }).map(({ label }) => label)
}

/** Optional fields shown after minimal onboarding is complete. */
export const OPTIONAL_PROFILE_FIELDS = PROFILE_COMPLETENESS_FIELDS.slice(5)

export const getOptionalMissingFields = (profile: Profile | null): string[] => {
  if (!profile) return OPTIONAL_PROFILE_FIELDS.map(({ label }) => label)
  return OPTIONAL_PROFILE_FIELDS.filter(({ key }) => {
    const value = profile[key]
    return !value || value.toString().trim() === ''
  }).map(({ label }) => label)
}

