import React, { useState, useRef, useEffect } from 'react';

export const ChatBox = ({
  width = 'w-full max-w-md',
  height = 'h-[520px]',
  title = 'Assistente Flow',
  subtitle = 'Projeto Sangue Artificial - FECART',
  initialMessages = [
    {
      id: 1,
      text: 'Olá! Sou a Flow, sua assistente clínica. Como posso ajudar com os parâmetros do sangue artificial hoje?',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  onSendMessage,
  isTyping = false,
  isConnected = false,
  className = '',
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    if (onSendMessage) onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden ${width} ${height} ${className}`}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              🩸
            </div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'} border-2 border-slate-900 rounded-full`}></span>
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-none">{title}</h3>
            <span className="text-xs text-slate-400 mt-1 block">{subtitle}</span>
          </div>
        </div>

        {!isConnected && (
          <div className="text-[10px] text-amber-400 border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 rounded font-mono font-bold">
            [AGUARDANDO LEITURA SERIAL]
          </div>
        )}
      </div>

      {/* Área de Mensagens com Rolagem Automática (overflow-y-auto) */}
      <div className="flex-1 overflow-y-auto scroll-smooth p-4 space-y-4 bg-slate-50/60 dark:bg-slate-900/60">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-end space-x-2 ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400 flex-shrink-0">
                  AI
                </div>
              )}

              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-red-600 text-white rounded-br-none shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                <span
                  className={`text-[10px] mt-1 block text-right font-medium ${
                    isUser ? 'text-red-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center space-x-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400 flex-shrink-0">
              AI
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Caixa de Entrada */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm px-4 py-2.5 rounded-xl border border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all"
        />

        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="p-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 text-white rounded-xl transition-colors flex items-center justify-center shadow-md"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
