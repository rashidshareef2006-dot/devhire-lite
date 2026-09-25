import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Search, MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { messagesService } from '@/services/messages.service';
import { connectSocket, getSocket } from '@/lib/socket';
import type { Message, Conversation, ChatUser } from '@/types';

export default function Messages() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeUserId = searchParams.get('u');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Connect socket ──
  useEffect(() => {
    const s = connectSocket();
    if (!s) return;

    const onNewMessage = (msg: Message) => {
      // Add to current chat if it belongs to active conversation
      setMessages((prev) => {
        const belongs =
          (msg.senderId === user?.id && msg.receiverId === activeUserId) ||
          (msg.senderId === activeUserId && msg.receiverId === user?.id);
        if (belongs && !prev.some((m) => m.id === msg.id)) {
          return [...prev, msg];
        }
        return prev;
      });
      // Refresh conversation list
      loadConversations();
    };

    const onTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      if (userId === activeUserId) setTyping(isTyping);
    };

    s.on('new_message', onNewMessage);
    s.on('user_typing', onTyping);

    return () => {
      s.off('new_message', onNewMessage);
      s.off('user_typing', onTyping);
    };
  }, [activeUserId, user?.id]);

  // ── Load conversations ──
  const loadConversations = async () => {
    try {
      const data = await messagesService.conversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // ── Load active chat ──
  useEffect(() => {
    if (!activeUserId) {
      setActiveUser(null);
      setMessages([]);
      return;
    }
    setLoadingMsgs(true);
    setMobileView('chat');

    Promise.all([
      messagesService.history(activeUserId),
      // Find user details from conversations or search
      (async (): Promise<ChatUser | null> => {
        const existing = conversations.find((c) => c.user.id === activeUserId);
        if (existing) return existing.user;
        return null;
      })(),
    ])
      .then(([msgs, u]) => {
        setMessages(msgs);
        if (u) setActiveUser(u);
        // Mark as read
        getSocket()?.emit('mark_read', { senderId: activeUserId });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingMsgs(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserId]);

  // ── Auto scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // ── Search users ──
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      messagesService
        .searchUsers(searchQuery)
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ── Send message ──
  const handleSend = () => {
    const content = input.trim();
    if (!content || !activeUserId) return;

    const s = getSocket();
    if (!s) return;

    s.emit('send_message', { receiverId: activeUserId, content });
    setInput('');
    s.emit('typing', { receiverId: activeUserId, isTyping: false });
  };

  // ── Typing indicator emit ──
  const handleInputChange = (val: string) => {
    setInput(val);
    if (!activeUserId) return;
    const s = getSocket();
    if (!s) return;

    s.emit('typing', { receiverId: activeUserId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      s.emit('typing', { receiverId: activeUserId, isTyping: false });
    }, 1500);
  };

  const selectUser = (u: ChatUser) => {
    setActiveUser(u);
    setSearchQuery('');
    setSearchResults([]);
    setSearchParams({ u: u.id });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-[calc(100vh-140px)] flex">
        {/* ═══ SIDEBAR ═══ */}
        <aside
          className={`w-full sm:w-80 border-r border-slate-200 dark:border-slate-800 flex-col ${
            mobileView === 'chat' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
              Messages
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indeed-blue/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {searchQuery ? (
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                  Search results
                </p>
                {searchResults.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-slate-500 text-center">No users found</p>
                ) : (
                  searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => selectUser(u)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  No conversations yet.
                  <br />
                  Search users to start chatting.
                </p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.user.id}
                  onClick={() => selectUser(c.user)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left border-l-2 ${
                    activeUserId === c.user.id
                      ? 'bg-blue-50 dark:bg-slate-800 border-indeed-blue'
                      : 'border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {c.user.name.charAt(0).toUpperCase()}
                    </div>
                    {c.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {c.user.name}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-indeed-blue text-white text-xs font-bold">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ═══ CHAT WINDOW ═══ */}
        <section
          className={`flex-1 flex-col ${
            mobileView === 'list' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {!activeUserId ? (
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <div>
                <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  Select a conversation
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Or search users to start a new chat
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => setMobileView('list')}
                  className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                  {activeUser?.name.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">
                    {activeUser?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {typing ? (
                      <span className="text-green-600 dark:text-green-400">typing...</span>
                    ) : conversations.find((c) => c.user.id === activeUserId)?.online ? (
                      <span className="text-green-600 dark:text-green-400">● Online</span>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-slate-50 dark:bg-slate-950/50">
                {loadingMsgs ? (
                  <p className="text-center text-sm text-slate-500 py-8">Loading...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-8">
                    No messages yet. Say hi! 👋
                  </p>
                ) : (
                  messages.map((m) => {
                    const mine = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                            mine
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              mine ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {formatTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indeed-blue/30"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}