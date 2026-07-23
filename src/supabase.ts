import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ioxfyynymtxsunwkwejj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_x-2ARMwkIieFMIbaXpZfnw_z37ZU_l8'
const missingConfigMessage = 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'

const createMissingQueryBuilder = () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: async () => ({ data: null, error: { message: missingConfigMessage } }),
    single: async () => ({ data: null, error: { message: missingConfigMessage } }),
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
    insert: async () => ({ data: null, error: { message: missingConfigMessage } }),
    delete: () => ({
      eq: async () => ({ data: null, error: { message: missingConfigMessage } }),
    }),
  }),
  channel: () => ({
    on: () => ({
      subscribe: () => ({}),
    }),
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

export const getUserProfile = async () => {
  if (!isSupabaseConfigured) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data
}
