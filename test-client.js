import { data } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001");

socket.on("connect", () => {
  console.log("connected!", socket.id);
  socket.emit("joinQueue", 2);
  socket.emit("joinUser", 16);
});

socket.on("queue_updated", (data) => {
  console.log(" queue_updated received:", data);
});

socket.on("yourTurn" , (data)=>{
  console.log("your turn notification recieved" , data);
  
})
// socket.on("message", (data) => {
//   console.log("📩 message received:", data);
// });


socket.on("test" , (data)=>{
  console.log("our custom event recieved from server " , data);
  
})

socket.emit("clientevent"  , "event from the client")

socket.on('broadcast' , (data)=>{
  console.log("clients are :" , data);
  
})
socket.on("connect_error", (err) => {
  console.log(" connect error:", err.message);
});