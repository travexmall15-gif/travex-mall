export default function SubscriptionPage() {
  if (typeof window !== 'undefined') {
    window.location.replace('/dashboard/subscription.html')
  }
  return null
}
