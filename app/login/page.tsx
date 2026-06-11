export default function LoginPage() {
  if (typeof window !== 'undefined') {
    window.location.replace('/dashboard/login.html')
  }
  return null
}
