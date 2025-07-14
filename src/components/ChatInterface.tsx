
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/ChatContext';
import { api } from '@/lib/api';

const ChatInterface: React.FC = () => {
  const { messages, addMessage, currentQuestion, currentStep, isTyping, dispatch, resetChat } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addMessage({ type: 'user', content: userMessage });
    setInputValue('');

    // Set typing indicator
    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      // Search for matching questions
      const matchingQuestions = await api.searchQuestions(userMessage);

      // Simulate brief processing time for better UX
      setTimeout(async () => {
        dispatch({ type: 'SET_TYPING', payload: false });

        if (matchingQuestions.length > 0) {
          const question = matchingQuestions[0];
          dispatch({ type: 'SET_CURRENT_QUESTION', payload: question });
          dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });

          // Get first solution step
          try {
            const solution = await api.getSolutionStep(question.id, 1);
            if (solution) {
              addMessage({
                type: 'bot',
                content: `I found a solution for "${question.title}". Let's try this first step:\n\n${solution.text}`,
                questionId: question.id,
                step: 1,
                showActions: true,
              });
            } else {
              addMessage({
                type: 'bot',
                content: "I found a matching issue but don't have specific steps available. Please contact support for further assistance.",
              });
            }
          } catch (error) {
            console.error('Error fetching solution step:', error);
            addMessage({
              type: 'bot',
              content: "I found a matching issue but encountered an error retrieving the solution steps. Please try again or contact support.",
            });
          }
        } else {
          addMessage({
            type: 'bot',
            content: "I couldn't find a specific solution for your issue. Could you try rephrasing your question or provide more details? For example, you could ask about 'boot issues', 'network problems', or 'performance issues'.",
          });
        }
      }, 800);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      dispatch({ type: 'SET_TYPING', payload: false });
      addMessage({
        type: 'bot',
        content: "I'm having trouble processing your request right now. This might be because the support system is offline. Please try again in a moment, or try asking about common issues like 'computer won't start', 'no internet', or 'black screen'.",
      });
    }
  };

  const handleStepResponse = async (worked: boolean, questionId: number, currentStepNum: number) => {
    if (worked) {
      addMessage({
        type: 'bot',
        content: "Great! I'm glad that worked. Is there anything else I can help you with?",
      });
      dispatch({ type: 'SET_CURRENT_QUESTION', payload: null });
      dispatch({ type: 'SET_CURRENT_STEP', payload: 0 });
    } else {
      // Try next step
      const nextStep = currentStepNum + 1;
      try {
        const solution = await api.getSolutionStep(questionId, nextStep);
        
        if (solution) {
          dispatch({ type: 'SET_CURRENT_STEP', payload: nextStep });
          addMessage({
            type: 'bot',
            content: `Let's try the next step:\n\n${solution.text}`,
            questionId: questionId,
            step: nextStep,
            showActions: true,
          });
        } else {
          addMessage({
            type: 'bot',
            content: "I've exhausted all the troubleshooting steps I have for this issue. I recommend contacting technical support for further assistance. Is there anything else I can help you with?",
          });
          dispatch({ type: 'SET_CURRENT_QUESTION', payload: null });
          dispatch({ type: 'SET_CURRENT_STEP', payload: 0 });
        }
      } catch (error) {
        console.error('Error fetching next solution step:', error);
        addMessage({
          type: 'bot',
          content: "I encountered an error while trying to get the next troubleshooting step. Please try starting over with your question or contact support directly.",
        });
        dispatch({ type: 'SET_CURRENT_QUESTION', payload: null });
        dispatch({ type: 'SET_CURRENT_STEP', payload: 0 });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Tech Support Assistant</h1>
              <p className="text-sm text-gray-500">Here to help with your technical issues</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetChat}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Chat</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gray-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message */}
                <div className={`px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm border'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  
                  {/* Action buttons for troubleshooting steps */}
                  {message.showActions && message.questionId && message.step && (
                    <div className="mt-3 flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStepResponse(true, message.questionId!, message.step!)}
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      >
                        ✓ It worked
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStepResponse(false, message.questionId!, message.step!)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                      >
                        ✗ Still not working
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your technical issue..."
                className="w-full"
                disabled={isTyping}
              />
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Try asking about boot issues, network problems, or performance issues
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
