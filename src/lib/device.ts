/**
 * Anonymous Device Identity for Habibi City
 * Stores a random UUID in localStorage to identify the local device without accounts.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'ssr-device-id'
  }
  let id = localStorage.getItem('device_id')
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : 'dev-' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('device_id', id)
  }
  return id
}
