import { createContext, useState, type ReactNode } from "react";

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

interface ChatRoomsInterface {
  chatRooms: ChatRooms[];
  handleChatRooms: (chatRooms: ChatRooms) => void;
  updateMessage: (content: Content, ID: number) => void;
}

const ChatRoomsContext = createContext<ChatRoomsInterface>({
  chatRooms: [],
  handleChatRooms: () => {},
  updateMessage: () => {},
});

interface ProviderProps {
  children: ReactNode;
}

export const ChatRoomsProvider = ({ children }: ProviderProps) => {
  const [chatRooms, setChatRooms] = useState<ChatRooms[]>([]);

  const handleChatRooms = (chatRoom: ChatRooms) => {
    setChatRooms((prev) => [
      ...prev,
      {
        fromUserID: chatRoom.fromUserID,
        username: chatRoom.username,
        content: [],
      },
    ]);
  };

  const updateMessage = (newContent: Content, ID: number) => {
    setChatRooms(
      [...chatRooms].map((object) => {
        if (object.fromUserID === ID) {
          return {
            ...object,
            content: [
              ...object.content,
              {
                id: newContent!.id, // Non-null assertion operator : 99% certarin the value cannot be null
                messages: newContent!.messages,
                fromSelf: newContent!.fromSelf,
              },
            ],
          };
        } else return object;
      })
    );
  };

  const value: ChatRoomsInterface = {
    chatRooms,
    handleChatRooms,
    updateMessage,
  };

  return (
    <ChatRoomsContext.Provider value={value}>
      {children}
    </ChatRoomsContext.Provider>
  );
};

export default ChatRoomsContext;
