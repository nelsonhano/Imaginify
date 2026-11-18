'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex-center flex-col gap-4 py-20 text-center">
            <h2 className="h2-bold text-dark-600">Something went wrong!</h2>
            <p className="p-16-regular text-dark-400 max-w-md">
                {error?.message || "Unable to load content. Please verify your database connection or try again."}
            </p>
            <button
                className="button bg-purple-gradient text-white rounded-full px-6 py-3 cursor-pointer"
                onClick={
                    () => reset()
                }
            >
                Try again
            </button>
        </div>
    )
}