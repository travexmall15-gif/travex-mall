export default function AdminPage() {
  if (typeof window !== 'undefined') {
    window.location.replace('/dashboard/admin-panel.html')
  }
  return null
}
