export function logout() {
  // Clear the session cookie
  document.cookie = 'user-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  // Redirect to login page
  window.location.href = '/';
} 