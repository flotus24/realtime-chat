"use client";

import React, { useState, useContext, useEffect } from "react";
import { WebsocketContext } from "@/contexts/WebsocketContext";
import { ChatInput } from "./ui/chat/chat-input";
import { ChatMessageList } from "./ui/chat/chat-message-list";
import { BsFillArrowRightCircleFill } from "react-icons/bs";
import { ChatBubble, ChatBubbleMessage } from "./ui/chat/chat-bubble";
import { v4 as uuidv4 } from "uuid";

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

interface ChatContainerProps {
  selected: ChatRooms | null;
  chatRooms: ChatRooms[];
  updateMessage: (chatRoom: Content, ID: number) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  selected,
  chatRooms,
  updateMessage,
}) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [newContent, setNewContent] = useState<Content | null>(null);
  const [fromUserID, setFromUserID] = useState<number>(0);
  const socket = useContext(WebsocketContext);

  // First step of receiving new Message
  useEffect(() => {
    socket.on("onMessage", (message: string, ID: number) => {
      setFromUserID(ID);
      const content: Content = {
        id: uuidv4(),
        messages: message,
        fromSelf: false,
      };
      setNewContent(content);
    });
    return () => {
      socket.off("onMessage");
    };
  }, []);

  // Second step of receiving new Message
  useEffect(() => {
    if (selected?.fromUserID != null) {
      updateMessage(newContent!, fromUserID);
    }
    console.log("received Message");
  }, [newContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if input only contains spaces
    if (!/^\s*$/.test(newMessage)) {
      socket.emit("newMessage", newMessage, selected);
      console.log(selected);
      setNewMessage("");
      findContact();
    }
  };

  const findContact = () => {
    for (let i = 0; i < chatRooms.length; i++) {
      const user = chatRooms[i];
      if (user.fromUserID === selected?.fromUserID) {
        user.content.push({
          id: uuidv4(),
          messages: newMessage,
          fromSelf: true,
        });
        break;
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-3/4 min-w-96 bg-stone-100">
      {selected ? (
        <>
          <div className="w-full p-2 bg-white shadow-sm">
            {selected.username}
          </div>

          <ChatMessageList>
            {selected.content.length === 0 ? (
              <div className="text-center text-lg font-bold">
                New Conversation
              </div>
            ) : (
              <>
                {selected.content.map((msg) => (
                  <div key={msg.id}>
                    {msg.fromSelf ? (
                      <ChatBubble variant="sent">
                        <ChatBubbleMessage variant="sent">
                          <p>{msg.messages}</p>
                        </ChatBubbleMessage>
                      </ChatBubble>
                    ) : (
                      <ChatBubble variant="received">
                        <ChatBubbleMessage variant="received">
                          <p>{msg.messages}</p>
                        </ChatBubbleMessage>
                      </ChatBubble>
                    )}
                  </div>
                ))}
              </>
            )}
          </ChatMessageList>
          <form className="rounded-lg" onSubmit={(e) => handleSubmit(e)}>
            <div className="px-4 pb-4 flex relative">
              <ChatInput
                placeholder="Type your message here..."
                className="z-0 border-0"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => (e.key === "Enter" ? handleSubmit(e) : null)}
              ></ChatInput>
              <div className="absolute right-5 top-[0.6rem]">
                <button type="submit" className="bg-white">
                  <BsFillArrowRightCircleFill
                    size={38}
                    color="black"
                    className="z-50"
                  />
                </button>
              </div>

              {/* <div className="flex items-center p-3 pt-0"></div> */}
            </div>
          </form>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ChatContainer;
