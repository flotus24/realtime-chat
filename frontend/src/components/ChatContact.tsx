"use client";

import React, { useContext, useEffect, useState } from "react";
import { WebsocketContext } from "@/contexts/WebsocketContext";
import { useRouter } from "next/navigation";
import { ScrollArea } from "./ui/scroll-area";
// import { cn } from "@/lib/utils";
// import { LogOut } from "lucide-react";
// import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
// import { useSelectedUser } from "@/store/useSelectedUser";
// import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

type Contact = {
  userID: number;
  username: string;
};

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

interface ChatContactProps {
  handleSelected: (user: ChatRooms) => void;
  handleChatRooms: (chatRoom: ChatRooms) => void;
  chatRooms: ChatRooms[];
  selected: ChatRooms | null;
  // Add other props here if needed
}

const ChatContact: React.FC<ChatContactProps> = ({
  handleSelected,
  handleChatRooms,
  chatRooms,
  selected,
}) => {
  const router = useRouter();
  const socket = useContext(WebsocketContext);
  const username = localStorage.getItem("username");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [focus, setFocus] = useState<number | null>(null);

  useEffect(() => {
    const userID: number = Number(localStorage.getItem("userID"));

    // Make socket connection
    socket.auth = { userID, username };
    socket.connect();
    console.log("Setting up Events...");

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("getUsers");
    });

    socket.on("disconnect", () => {
      socket.emit("getUsers");
    });

    socket.on("userUpdated", () => {
      socket.emit("getUsers");
    });

    socket.on("resUsers", (users) => {
      setContacts(users);
    });

    return () => {
      console.log("Unregistering Events...");
      socket.off("resUsers");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("userUpdated");
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    for (let i = 0; i < contacts.length; i++) {
      const ID: number = contacts[i].userID;
      if (chatRooms.some((obj) => obj.fromUserID === ID) === false) {
        const chatRoom = {
          fromUserID: ID,
          username: contacts[i].username,
          content: [],
        };
        handleChatRooms(chatRoom);
      }
    }
  }, [contacts]);

  useEffect(() => {
    for (let i = 0; i < chatRooms.length; i++) {
      const check = chatRooms[i];
      if (check.fromUserID === selected?.fromUserID) {
        handleSelected(check);
        break;
      }
    }
  }, [chatRooms]);

  const handleContact = (user: Contact) => {
    setFocus(user.userID);
    for (let i = 0; i < chatRooms.length; i++) {
      const check = chatRooms[i];
      if (check.fromUserID === user.userID) {
        handleSelected(check);
        break;
      }
    }
  };

  const handleLogout = () => {
    localStorage.setItem("jwtToken", "-");
    router.push("/");
  };

  return (
    <div className="h-screen w-1/4 min-w-56 bg-white border">
      <div className="flex flex-col items-center min-h-full">
        {/* <ScrollArea className="gap-2 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2"> */}
        {contacts.map((user) => (
          <button
            className={`h-10 p-1 w-full text-left hover:bg-stone-100 shadow-sm focus:bg-neutral-200  ${
              focus === user.userID ? "bg-neutral-200" : ``
            } `}
            key={user.userID}
            onClick={() => handleContact(user)}
          >
            {user.username}
          </button>
        ))}
        {/* </ScrollArea> */}
        <div className="bg-slate-100 p-2 flex flex-col items-center w-full mt-auto">
          <p className="break-all font-bold items">{username}</p>
          <button
            onClick={handleLogout}
            className="text-white bg-sky-500 mt-2 px-4 py-2 mx-auto flex items-center rounded-md opacity-70 hover:opacity-100 duration-300 z-0"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContact;
