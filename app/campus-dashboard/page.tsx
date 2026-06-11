export default function CampusDashboardPage() {
  if (typeof window !== 'undefined') {
    window.location.replace('/dashboard/campus-dashboard.html')
  }
  return null
}
