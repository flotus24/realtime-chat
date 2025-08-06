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

interface SelectedRoomInterface {
  selected: ChatRooms | null;
  handleSelected: (room: ChatRooms) => void;
}

const SelectedRoomContext = createContext<SelectedRoomInterface>({
  selected: null,
  handleSelected: () => {},
});

interface ProviderProps {
  children: ReactNode;
}

export const SelectedRoomProvider = ({ children }: ProviderProps) => {
  const [selected, setSelected] = useState<ChatRooms | null>(null);

  const handleSelected = (user: ChatRooms) => {
    setSelected(user);
  };

  const value: SelectedRoomInterface = {
    selected,
    handleSelected,
  };

  return (
    <SelectedRoomContext.Provider value={value}>
      {children}
    </SelectedRoomContext.Provider>
  );
};

export default SelectedRoomContext;
