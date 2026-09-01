import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../services/api";
import { socket } from "../socket";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({
      email,
      password,
    });

    const token = res.data?.token;
    const userData = res.data?.user;

    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setToken(token);
    setUser(userData);

    return userData;
  };

  // useEffect(()=>{
  //   if (user?.user_id){
  //     socket.connect();
  //     console.log("Joining room:", user.user_id);
  //     socket.emit("joinUser" , user.user_id)
  //   }
  // },[user])

  useEffect(() => {
    if (!user?.user_id) return;

    const joinUser = () => {
        socket.emit("joinUser", user.user_id);
    };

    joinUser();

    console.log("Joining room:", user.user_id);

    socket.on("connect", joinUser);

    return () => {
        socket.off("connect", joinUser);
    };
}, [user]);

  

  const register = async (data) => {
    await authAPI.register(data);

    return await login(
      data.email,
      data.password
    );
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    socket.disconnect();

    setUser(null);
    setToken(null);
  };

  const updateUser = (data) => {
    setUser((prevUser) => {
      const updatedUser = {
        ...prevUser,
        ...data,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        // email,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}