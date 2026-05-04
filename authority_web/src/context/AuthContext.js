import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('policeToken'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('policeUser') || 'null'));

  const login = (token, user) => {
    localStorage.setItem('policeToken', token);
    localStorage.setItem('policeUser', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('policeToken');
    localStorage.removeItem('policeUser');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
