"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ChatWrapper, { useChat } from "@/components/Wrappers/socketwrapper"; // Use the context directly
import { UserInfo } from "@/types";
import { createCustomerapi } from "@/utils/Api";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const params = useSearchParams();
  const botid = params.get("botid");
  const { messages, handleSendMessage } = useChat(); // Access chat context
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isCollected, setIsCollected] = useState(false);
  const [input, setInput] = useState("");

  // Handle sending messages
  const handleSend = () => {
    if (input.trim() && botid) {
      console.log(input);
      handleSendMessage(input, botid); // Use handleSendMessage from context
      setInput("");
    }
  };

  // Handle dialog submission to collect user information
  const handleDialogSubmit = async () => {
    if (user) {
      localStorage.setItem("chatUser", JSON.stringify(user));
      setIsCollected(true);
      await createCustomerapi({ email: user.email, name: user.name });
    }
  };

  useEffect(() => {
    // Retrieve stored user info from localStorage
    const storedUser = localStorage.getItem("chatUser");
    if (storedUser) {
      const chatUser: UserInfo = JSON.parse(storedUser);
      setUser(chatUser);
      setIsCollected(true);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center bg-blue-600 p-3 rounded-md text-white mb-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-lg ml-3">Chat with Support</span>
      </div>

      {/* Messages List */}
      <div className="flex-1 items-center overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={`p-3 ${
              message.sender === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "bg-gray-200"
            } max-w-xs rounded-lg`}
          >
            <CardContent className="flex items-start">
              <div className="text-sm">
                {message.content.includes("*") ? (
                  <ul className="list-disc list-inside space-y-1">
                    {message.content
                      .split("* ")
                      .filter((item) => item.trim()) // Remove any empty items
                      .map((item, index) =>
                        item.startsWith("**") ? (
                          // Render as heading if item starts with "**"
                          <li
                            key={index}
                            className="font-semibold leading-relaxed"
                          >
                            {item.replace(/\*\*/g, "*").trim()}
                          </li>
                        ) : (
                          <li key={index} className="leading-relaxed">
                            {item.trim()}
                          </li>
                        )
                      )}
                  </ul>
                ) : (
                  <span>{message.content}</span> // For non-list content
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 mt-4">
        <Input
          type="text"
          placeholder="Type a message..."
          className="flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend} variant="secondary">
          Send
        </Button>
      </div>

      {/* Dialog for User Info */}
      <Dialog open={!isCollected} onOpenChange={() => setIsCollected(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hi there!</DialogTitle>
            <DialogDescription>
              Please enter your name and email address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={user?.name || ""}
                onChange={(e) =>
                  setUser(
                    (prev) => ({ ...prev, name: e.target.value } as UserInfo)
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <Input
                id="email"
                value={user?.email || ""}
                onChange={(e) =>
                  setUser(
                    (prev) => ({ ...prev, email: e.target.value } as UserInfo)
                  )
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleDialogSubmit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Wrap the Page component with ChatWrapper in your main entry point (e.g., _app.tsx or index.tsx)
const WrappedPage = () => (
  <ChatWrapper>
    <Page />
  </ChatWrapper>
);

export default WrappedPage;
