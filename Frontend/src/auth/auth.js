export const saveAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore errors — logout must always succeed
  } finally {
    localStorage.removeItem("token");
    window.location.href = "/";
  }
};


