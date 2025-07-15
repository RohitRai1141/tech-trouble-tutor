
'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Question, Solution, api } from '@/lib/api';

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
  getResponse: (userInput: string) => Promise<string>;
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

  const getResponse = async (userInput: string): Promise<string> => {
    try {
      // Check if input is a number for direct question access
      const questionNumber = parseInt(userInput.trim());
      if (!isNaN(questionNumber) && questionNumber > 0) {
        const question = await api.getQuestionByIndex(questionNumber);
        if (question) {
          dispatch({ type: 'SET_CURRENT_QUESTION', payload: question });
          dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });
          
          const solutions = await api.getSolutions(question.id);
          if (solutions.length > 0) {
            const firstStep = solutions.find(s => s.step === 1);
            return `**${question.title}**\n\n${firstStep?.text || 'Solution not found.'}\n\nWould you like to try this step?`;
          }
          return `Found question: ${question.title}\n\n${question.description}\n\nBut no solutions are available yet.`;
        } else {
          return `Question #${questionNumber} not found. Please try a different number or describe your issue.`;
        }
      }

      // Search for matching questions
      const matchingQuestions = await api.searchQuestions(userInput);
      
      if (matchingQuestions.length === 0) {
        return "I couldn't find a specific solution for that issue. Could you try rephrasing your question or provide more details? You can also try typing a question number (1, 2, 3, etc.) to browse available topics.";
      }

      if (matchingQuestions.length === 1) {
        const question = matchingQuestions[0];
        dispatch({ type: 'SET_CURRENT_QUESTION', payload: question });
        dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });
        
        const solutions = await api.getSolutions(question.id);
        if (solutions.length > 0) {
          const firstStep = solutions.find(s => s.step === 1);
          return `I found a solution for: **${question.title}**\n\n**Step 1:** ${firstStep?.text || 'Solution step not found.'}\n\nDid this help? Type "next" for the next step or "no" if you need different assistance.`;
        }
        return `I found: **${question.title}**\n\n${question.description}\n\nBut detailed steps aren't available yet.`;
      }

      // Multiple matches - show options
      let response = "I found several possible solutions. Please choose one by typing the corresponding number:\n\n";
      matchingQuestions.forEach((q, index) => {
        response += `${index + 1}. ${q.title}\n`;
      });
      response += "\nOr describe your issue in more detail.";
      
      return response;
    } catch (error) {
      console.error('Error getting response:', error);
      return "I'm sorry, I encountered an error while processing your request. Please try again.";
    }
  };

  const value: ChatContextType = {
    ...state,
    dispatch,
    addMessage,
    resetChat,
    getResponse,
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
