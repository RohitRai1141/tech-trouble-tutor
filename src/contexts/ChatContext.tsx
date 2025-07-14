
'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Question, Solution } from '@/lib/api';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  questionId?: number;
  step?: number;
  showActions?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  currentQuestion: Question | null;
  currentStep: number;
  isTyping: boolean;
  isLoading: boolean;
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_QUESTION'; payload: Question | null }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'RESET_CHAT' };

const initialState: ChatState = {
  messages: [],
  currentQuestion: null,
  currentStep: 0,
  isTyping: false,
  isLoading: false,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload,
      };
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'RESET_CHAT':
      return {
        ...initialState,
        messages: [{
          id: 'welcome',
          type: 'bot',
          content: "Hello! I'm here to help you troubleshoot technical issues. What problem are you experiencing?",
          timestamp: new Date(),
        }],
      };
    default:
      return state;
  }
};

interface ChatContextType extends ChatState {
  dispatch: React.Dispatch<ChatAction>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  resetChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    messages: [{
      id: 'welcome',
      type: 'bot',
      content: "Hello! I'm here to help you troubleshoot technical issues. What problem are you experiencing?",
      timestamp: new Date(),
    }],
  });

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
  };

  const resetChat = () => {
    dispatch({ type: 'RESET_CHAT' });
  };

  const value: ChatContextType = {
    ...state,
    dispatch,
    addMessage,
    resetChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
