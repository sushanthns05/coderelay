'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function adminLoginAction(formData: FormData) {
  const username = formData.get('username')
  const password = formData.get('password')

  if (username === 'admin789' && password === 'Admin@1410') {
    // Set a secure cookie for the admin session
    const cookieStore = await cookies()
    cookieStore.set('code_relay_admin', 'authenticated', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 // 1 day
    })
    
    redirect('/admin')
  } else {
    return { error: 'Invalid admin credentials.' }
  }
}

export async function adminLogoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('code_relay_admin')
  redirect('/admin-login')
}
