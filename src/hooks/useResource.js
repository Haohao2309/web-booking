import { useEffect, useState, useCallback } from 'react'
import { errorMessage } from '../api/axiosClient'
export function useResource(loader) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion((v) => v + 1), [])
  useEffect(() => {
    const controller = new AbortController()
    loader(controller.signal).then((data) => { if (!controller.signal.aborted) setState({ data, loading: false, error: '', loader, version }) })
      .catch((error) => { if (!controller.signal.aborted) setState({ data: null, loading: false, error: errorMessage(error), loader, version }) })
    return () => controller.abort()
  }, [loader, version])
  return state.loader === loader && state.version === version ? { ...state, reload } : { data: null, loading: true, error: '', reload }
}
