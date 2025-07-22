"use client";

import React, { useEffect, useState } from "react";
import ChatContact from "@/components/ChatContact";
import ChatContainer from "@/components/ChatContainer";
import { WebsocketProvider, socket } from "@/contexts/WebsocketContext";
import { useRouter } from "next/navigation";

interface ChatRooms {
  fromUserID: number | null;
  username: string;
  content: Content[];
}

interface Content {
  id: string;
  messages: string;
  fromSelf: boolean;
}

const Chat = () => {
  const router = useRouter();
  const [showPage, setShowPage] = useState<boolean>(false);
  const [selected, setSelected] = useState<ChatRooms | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRooms[]>([]);

  const handleSelected = (user: ChatRooms) => {
    setSelected(user);
  };

  const handleChatRooms = (chatRoom: ChatRooms) => {
    setChatRooms((prev) => [
      ...prev,
      {
        fromUserID: chatRoom.fromUserID, // Non-null assertion operator : 99% certarin the value cannot be null
        username: chatRoom.username,
        content: [],
      },
    ]);
  };

  //Third step of receiving new Message
  const updateMessage = (newContent: Content, ID: number) => {
    setChatRooms(
      [...chatRooms].map((object) => {
        if (object.fromUserID === ID) {
          return {
            ...object,
            content: [
              ...object.content,
              {
                id: newContent!.id,
                messages: newContent!.messages,
                fromSelf: newContent!.fromSelf,
              },
            ],
          };
        } else return object;
      })
    );
  };

  useEffect(() => {
    //check to see if it's on client side
    const token = localStorage.getItem("jwtToken");
    const authorization = async () => {
      try {
        const response = await fetch("http://localhost:3001/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          router.push("/");
        } else if (response.status === 200) {
          setShowPage(true);
        }
      } catch (err: any) {
        console.error(err.message);
      }
    };

    authorization();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showPage && (
        <>
          <WebsocketProvider value={socket}>
            <ChatContact
              handleSelected={handleSelected}
              handleChatRooms={handleChatRooms}
              chatRooms={chatRooms}
              selected={selected}
            />
            <ChatContainer
              selected={selected}
              chatRooms={chatRooms}
              updateMessage={updateMessage}
            />
          </WebsocketProvider>
        </>
      )}
    </div>
  );
};

export default Chat;
