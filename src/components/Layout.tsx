import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatBot from './chat/ChatBot';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';
import { useState } from 'react';

// Create a context for managing chat queries
import { createContext, useContext } from 'react';

interface ChatContextType {
  openChatWithQuery: (query: string) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

const Layout = () => {
  const { isLoading } = useAuth();
  const [chatQuery, setChatQuery] = useState<string | undefined>();

  const openChatWithQuery = (query: string) => {
    setChatQuery(query);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <ChatContext.Provider value={{ openChatWithQuery }}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
        <ChatBot initialQuery={chatQuery} />
      </div>
    </ChatContext.Provider>
  );
};

export default Layout;