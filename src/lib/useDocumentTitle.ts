import { useEffect } from 'react'

const DEFAULT_TITLE = 'Rust It Up — Should this repo be rewritten in Rust?'

/** Set the document title for a route and restore the default on unmount. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · Rust It Up`
    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [title])
}
