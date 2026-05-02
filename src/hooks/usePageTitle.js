import { useEffect } from 'react'

const SITE = 'Fancy Cakes Patisserie'

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : SITE
    return () => { document.title = SITE }
  }, [title])
}
