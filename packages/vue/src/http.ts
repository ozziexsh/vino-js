function getXsrfToken() {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('XSRF-TOKEN=')) {
      return cookie.substring('XSRF-TOKEN='.length, cookie.length);
    }
  }
  return null;
}

export async function http(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'X-Vino': 'true',
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': decodeURIComponent(getXsrfToken() || ''),
      ...options.headers,
    },
  });
}
