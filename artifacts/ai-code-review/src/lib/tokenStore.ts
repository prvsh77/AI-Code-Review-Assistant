let _token: string | null = null;

export const tokenStore = {
  getToken: () => _token,
  setToken: (token: string | null) => {
    _token = token;
    if (token) {
      localStorage.setItem("has_session", "true");
    } else {
      localStorage.removeItem("has_session");
    }
  },
  hasSession: () => localStorage.getItem("has_session") === "true",
};
