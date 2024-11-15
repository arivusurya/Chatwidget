import { Message } from "@/types";
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

// Define the type for each message

// Define the context value type
interface ChatContextType {
  messages: Message[];
  handleSendMessage: (messageContent: string, botid: string) => void;
  clearMessages: () => void;
  joinRoom: (roomName: string) => void;
  leaveRoom: (roomName: string) => void;
}

// Initialize the socket connection
const socket: Socket = io("http://localhost:3000");

// Create the chat context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatWrapperProps {
  children: ReactNode;
}

// ChatWrapper component
const ChatWrapper: React.FC<ChatWrapperProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Function to add a new message
  const addMessage = (newMessage: Message) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // Function to clear all messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Function to handle sending a message
  const handleSendMessage = (messageContent: string, botid: string) => {
    const message: Message = {
      botid: botid,
      id: Date.now(),
      content: messageContent,
      sender: "user",
    };
    console.log(message);
    addMessage(message);
    socket.emit("sendMessage", message); // Send message to server
  };

  // Function to join a chat room
  const joinRoom = (roomName: string) => {
    socket.emit("joinRoom", roomName);
    console.log(`Joined room: ${roomName}`);
  };

  // Function to leave a chat room
  const leaveRoom = (roomName: string) => {
    socket.emit("leaveRoom", roomName);
    console.log(`Left room: ${roomName}`);
  };

  // Set up socket event listeners for incoming messages and notifications
  useEffect(() => {
    // Listen for incoming messages
    socket.on("receiveMessage", (message: Message) => {
      console.log(message);
      addMessage(message);
    });

    // Listen for notifications about users joining/leaving rooms
    socket.on("userJoined", (msg: string) => {
      //   addMessage({ id: Date.now(), content: msg, sender: "bot" });
    });
    socket.on("userLeft", (msg: string) => {
      //   addMessage({ id: Date.now(), content: msg, sender: "bot" });
    });

    // Clean up the event listeners on unmount
    return () => {
      socket.off("receiveMessage");
      socket.off("userJoined");
      socket.off("userLeft");
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        handleSendMessage,
        clearMessages,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatWrapper");
  }
  return context;
};

export default ChatWrapper;
