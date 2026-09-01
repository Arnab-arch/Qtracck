import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { Children, useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { data } from "react-router-dom";


const SocketContext = createContext(null);

export function SocketProvider({children}){
    const {user} = useAuth();
    const [socket,setSocket] = useState(null);

    useEffect(()=>{
        if (!user){
            setSocket(null);
            return;
        }
        const newSocket = io("http://localhost:5001" , {
    transports:["websocket"]
});
       newSocket.on("connect" , ()=>{
        console.log("socket connected:" , newSocket);
        newSocket.emit("joinUser" , user.user_id??user.id)
       });
       setSocket(newSocket);
       return()=>{
        newSocket.disconnect();
       };
         
    } , [user]);
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )


}

export function useSocket(){
    return useContext(SocketContext)
}