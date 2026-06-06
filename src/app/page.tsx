import { createClient } from '@/lib/supabase/server'
import MainApp from '@/components/MainApp'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return <MainApp initialProfile={profile} userId={user?.id ?? null} />
}
