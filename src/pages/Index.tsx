
import React from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  return (
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  );
};

export default Index;
