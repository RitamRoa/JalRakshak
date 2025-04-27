import React, { useState, useRef, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { MessageSquare, X, Send, Bot, AlertCircle, RefreshCcw } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getGenAI, getGeminiModel } from '../../utils/apiClients';
import { supabase } from '../../utils/supabaseClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
}

interface QuickAction {
  id: string;
  label: string;
  query: string;
  category: 'general' | 'report' | 'emergency';
}

interface WaterIssue {
  issue_type: string;
}

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'report-issue',
    label: 'Report Water Issue',
    query: 'I want to report a water issue in my area',
    category: 'report'
  },
  {
    id: 'water-quality',
    label: 'Check Water Quality',
    query: 'What\'s the water quality in my area?',
    category: 'general'
  },
  {
    id: 'emergency',
    label: 'Report Emergency',
    query: 'There\'s a water emergency that needs immediate attention',
    category: 'emergency'
  },
  {
    id: 'conservation',
    label: 'Water Conservation Tips',
    query: 'How can I conserve water?',
    category: 'general'
  }
];

const CHAT_CONTEXT = `You are a helpful assistant focused on water-related issues in the community. 
Your role is to help users report water problems, provide information about water quality, 
and offer guidance on water conservation. Always prioritize user safety and direct them 
to emergency services when appropriate.`;

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>('');
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_QUICK_ACTIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      initializeChat();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, error]);

  useEffect(() => {
    // Update quick actions based on user context
    const updateQuickActions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userIssues } = await supabase
            .from('water_issues')
            .select('issue_type')
            .eq('user_id', user.id)
            .limit(3);

          if (userIssues && userIssues.length > 0) {
            const recentIssueTypes = new Set(userIssues.map((issue: WaterIssue) => issue.issue_type));
            const customActions: QuickAction[] = Array.from(recentIssueTypes).map((type, index) => ({
              id: `recent-${index}`,
              label: `Check ${type} Status`,
              query: `What's the status of my ${type} report?`,
              category: 'report'
            }));
            
            setQuickActions([...customActions, ...DEFAULT_QUICK_ACTIONS].slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Error updating quick actions:', error);
      }
    };

    if (isOpen) {
      updateQuickActions();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      setError('Initializing AI model...');
      const model = await getGeminiModel();
      setModelName('Gemini');
      setError(null);
    } catch (err: any) {
      handleError(err, 'Failed to initialize chat');
    }
  };

  const handleError = (err: any, defaultMessage: string) => {
    console.error(defaultMessage, err);
    let errorMessage = defaultMessage;

    if (!navigator.onLine) {
      errorMessage = 'No internet connection. Please check your network and try again.';
    } else if (err.message?.includes('404')) {
      errorMessage = 'The AI model is temporarily unavailable. Please try again in a moment.';
    } else if (err.message?.includes('429')) {
      errorMessage = 'Too many requests. Please wait a moment before trying again.';
    } else if (err.message?.includes('500')) {
      errorMessage = 'The AI service is experiencing issues. Please try again later.';
    }

    setError(errorMessage);
  };

  const handleRetry = async () => {
    setError(null);
    await initializeChat();
  };

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const model = await getGeminiModel();
      const chat = await model.startChat({
        history: messages.map(msg => ({
          role: msg.role,
          parts: msg.content,
        })),
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(messageText);
      const response = await result.response;
      const responseText = response.text();

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
          status: 'sent'
        }
      ]);

      // Update user message status to sent
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

      setError(null);
    } catch (err: any) {
      // Update user message status to error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
      handleError(err, 'Error generating response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSend(action.query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="primary"
        size="lg"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg hover:scale-105 transition-transform"
        onClick={() => setIsOpen(true)}
        aria-label="Open chat assistant"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          variant="primary"
          size="lg"
          className="rounded-full shadow-lg hover:scale-105 transition-transform"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      ) : (
        <Card className={`w-96 shadow-xl transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[600px] flex flex-col'}`} role="dialog" aria-label="Chat assistant">
          <div className="flex items-center justify-between p-4 border-b bg-primary-50">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Water Assistant</h3>
                {modelName && (
                  <p className="text-xs text-gray-500">Powered by {modelName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-full p-1 hover:bg-gray-100"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? (
                  <MessageSquare className="h-4 w-4" />
                ) : (
                  <span className="h-4 w-4 block border-t-2 border-gray-600" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" style={{ maxHeight: 'calc(600px - 8rem)' }} role="log" aria-live="polite">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    } animate-fade-in`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white shadow-sm border border-gray-100'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="break-words whitespace-pre-wrap">{message.content}</span>
                        <span className="text-xs opacity-75 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                          {message.role === 'user' && (
                            <span className="ml-2">
                              {message.status === 'sending' && '⋯'}
                              {message.status === 'sent' && '✓'}
                              {message.status === 'error' && '❌'}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-3">
                      <LoadingSpinner size="small" />
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex justify-center animate-fade-in">
                    <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm flex flex-col items-center">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                      </div>
                      {error !== 'Initializing AI model...' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRetry}
                          className="mt-2 text-red-600 hover:bg-red-100"
                        >
                          <RefreshCcw className="h-4 w-4 mr-1" />
                          Retry Connection
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                {messages.length === 0 && !error && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="text-center text-gray-500 text-sm">
                      <p>👋 Hello! I'm your Water Assistant.</p>
                      <p className="mt-2">Quick Actions:</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action)}
                          className={`text-left hover:bg-primary-50 ${
                            action.category === 'emergency' ? 'text-red-600 hover:bg-red-50' : ''
                          }`}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t bg-white mt-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(input);
                  }}
                  className="flex space-x-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    disabled={isLoading || !!error}
                    aria-label="Chat message input"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isLoading || !input.trim() || !!error}
                    className="hover:scale-105 transition-transform"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default ChatBot; 