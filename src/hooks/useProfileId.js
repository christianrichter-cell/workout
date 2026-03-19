import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const cache = {}

export function useProfileId(profileName) {
  const [profileId, setProfileId] = useState(cache[profileName] ?? null)

  useEffect(() => {
    if (cache[profileName]) {
      setProfileId(cache[profileName])
      return
    }
    supabase
      .from('profiles')
      .select('id')
      .eq('name', profileName)
      .single()
      .then(({ data }) => {
        if (data) {
          cache[profileName] = data.id
          setProfileId(data.id)
        }
      })
  }, [profileName])

  return profileId
}
