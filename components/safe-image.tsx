"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"
import { ImageOff } from "lucide-react"

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackClassName?: string
}

export function SafeImage({ fallbackClassName, alt, className, ...props }: SafeImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${fallbackClassName ?? className ?? ""}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="h-6 w-6 text-muted-foreground/40" />
      </div>
    )
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  )
}
