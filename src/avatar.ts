import { supabase, isSupabaseConfigured } from './supabase'
import type { Profile } from './types'

export const AVATAR_BUCKET = 'avatars'
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const signedUrlCache = new Map<string, string>()

export type AvatarUploadProgress = {
  stage: 'validating' | 'compressing' | 'uploading' | 'saving' | 'complete'
  percentage: number
}

export type AvatarUploadResult = {
  profile: Profile
  path: string
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback

export const validateAvatarFile = (file: File) => {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Choose a JPG, PNG, or WEBP image.')
  }

  if (file.size === 0) {
    throw new Error('The selected image is empty.')
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error('Profile photos must be 5 MB or smaller.')
  }
}

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const source = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(source)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(source)
      reject(new Error('The selected file could not be read as an image.'))
    }
    image.src = source
  })

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Unable to prepare the image for upload.'))
    }, 'image/webp', quality)
  })

export const compressAvatarImage = async (file: File): Promise<File> => {
  const image = await loadImage(file)
  const maxDimension = 1600
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Your browser cannot prepare this image for upload.')

  context.drawImage(image, 0, 0, width, height)
  let output = await canvasToBlob(canvas, 0.86)
  if (output.size > 2 * 1024 * 1024) output = await canvasToBlob(canvas, 0.72)

  if (output.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error('The compressed image is still larger than 5 MB.')
  }

  return new File([output], `${file.name.replace(/\.[^.]+$/, '') || 'profile'}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  })
}

export const isAvatarStoragePath = (value: string | null | undefined) =>
  Boolean(value && !/^(blob:|https?:)/i.test(value))

const isOwnedAvatarPath = (userId: string, path: string) => path.startsWith(`${userId}/`)

const getStoredAvatarPath = (avatarReference: string) => {
  if (isAvatarStoragePath(avatarReference)) return avatarReference

  try {
    const url = new URL(avatarReference)
    const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`
    const markerIndex = url.pathname.indexOf(marker)
    if (markerIndex === -1) return null
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length))
  } catch {
    return null
  }
}

export const getAvatarDisplayUrl = async (avatarReference: string | null | undefined) => {
  if (!avatarReference) return null
  if (!isAvatarStoragePath(avatarReference)) return avatarReference

  const cached = signedUrlCache.get(avatarReference)
  if (cached) return cached

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(avatarReference, 60 * 60)

  if (error || !data?.signedUrl) return null
  signedUrlCache.set(avatarReference, data.signedUrl)
  return data.signedUrl
}

const removeAvatarObject = async (userId: string, avatarReference: string | null | undefined) => {
  if (!avatarReference) return

  const path = getStoredAvatarPath(avatarReference)
  if (!path || !isOwnedAvatarPath(userId, path)) {
    return
  }

  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([path])
  if (error) throw error
  signedUrlCache.delete(path)
}

export const ensureAvatarBucket = async (): Promise<{ ready: boolean; error?: string }> => {
  if (!isSupabaseConfigured) return { ready: false, error: 'Supabase is not configured.' }

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) return { ready: true }

    if (buckets.some((bucket: { name: string }) => bucket.name === AVATAR_BUCKET)) return { ready: true }

    const { error: createError } = await supabase.storage.createBucket(AVATAR_BUCKET, {
      public: false,
      fileSizeLimit: MAX_AVATAR_SIZE_BYTES,
      allowedMimeTypes: [...ACCEPTED_IMAGE_TYPES],
    })

    return createError ? { ready: false, error: createError.message } : { ready: true }
  } catch (error) {
    return { ready: false, error: getErrorMessage(error, 'Unable to prepare avatar storage.') }
  }
}

const assertCurrentUser = async (userId: string) => {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user || data.user.id !== userId) {
    throw new Error('Your session has expired. Please sign in again before changing your photo.')
  }
}

export const uploadAvatar = async (
  userId: string,
  currentAvatar: string | null | undefined,
  sourceFile: File,
  onProgress?: (progress: AvatarUploadProgress) => void
): Promise<AvatarUploadResult> => {
  onProgress?.({ stage: 'validating', percentage: 8 })
  validateAvatarFile(sourceFile)
  await assertCurrentUser(userId)

  const bucket = await ensureAvatarBucket()
  if (!bucket.ready) throw new Error(bucket.error || 'Avatar storage is not ready.')

  onProgress?.({ stage: 'compressing', percentage: 25 })
  const file = await compressAvatarImage(sourceFile)
  const path = `${userId}/${crypto.randomUUID()}-${Date.now()}.webp`

  onProgress?.({ stage: 'uploading', percentage: 55 })
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: false })

  if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`)

  onProgress?.({ stage: 'saving', percentage: 85 })
  const { data: savedProfile, error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: path, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .single()

  if (profileError || !savedProfile) {
    await supabase.storage.from(AVATAR_BUCKET).remove([path])
    throw new Error(`Photo uploaded but could not be saved: ${profileError?.message || 'Unknown profile error.'}`)
  }

  try {
    await removeAvatarObject(userId, currentAvatar)
  } catch {}

  onProgress?.({ stage: 'complete', percentage: 100 })
  return { profile: savedProfile as Profile, path }
}

export const removeAvatar = async (userId: string, currentAvatar: string | null | undefined) => {
  await assertCurrentUser(userId)
  const { data: savedProfile, error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .single()

  if (profileError || !savedProfile) {
    throw new Error(profileError?.message || 'Could not remove your profile photo.')
  }

  try {
    await removeAvatarObject(userId, currentAvatar)
  } catch {}

  return savedProfile as Profile
}
