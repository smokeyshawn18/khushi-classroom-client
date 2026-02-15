const originalFetch = window.fetch;

window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  return originalFetch(input, {
    ...init,
    credentials: "include",
  });
};
