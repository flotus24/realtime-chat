"use client";

import React, { useEffect, useState } from "react";
import ChatContact from "@/components/ChatContact";
import ChatContainer from "@/components/ChatContainer";
import { WebsocketProvider, socket } from "@/contexts/WebsocketContext";
import { ChatRoomsProvider } from "@/contexts/ChatRoomsContext";
import { SelectedRoomProvider } from "@/contexts/SelectedRoomContext";
import { useRouter } from "next/navigation";

const Chat = () => {
  const router = useRouter();
  const [showPage, setShowPage] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const authorization = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}/auth/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
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
            <ChatRoomsProvider>
              <SelectedRoomProvider>
                <ChatContact />
                <ChatContainer />
              </SelectedRoomProvider>
            </ChatRoomsProvider>
          </WebsocketProvider>
        </>
      )}
    </div>
  );
};

export default Chat;
