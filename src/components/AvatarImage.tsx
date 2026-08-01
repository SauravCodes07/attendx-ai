import { type ReactNode, useEffect, useState } from 'react'
import { getAvatarDisplayUrl } from '../avatar'

interface AvatarImageProps {
  avatarUrl: string | null | undefined
  alt: string
  className?: string
  fallback?: ReactNode
}

export default function AvatarImage({ avatarUrl, alt, className, fallback = null }: AvatarImageProps) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setSrc(null)
    void getAvatarDisplayUrl(avatarUrl).then((nextUrl) => {
      if (active) setSrc(nextUrl)
    })

    return () => {
      active = false
    }
  }, [avatarUrl])

  if (!src) return <>{fallback}</>

  return <img src={src} alt={alt} className={className} />
}
