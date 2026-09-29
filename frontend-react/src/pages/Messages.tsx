import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Search, MessageSquare, ArrowLeft, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { messagesService } from '@/services/messages.service';
import { connectSocket, getSocket } from '@/lib/socket';
import type { Message, Conversation, ChatUser } from '@/types';

// ✅ Robust sender id extractor
const getSenderId = (m: any): string =>
  String(m?.senderId ?? m?.sender_id ?? m?.sender?.id ?? '');

const getReceiverId = (m: any): string =>
  String(m?.receiverId ?? m?.receiver_id ?? m?.receiver?.id ?? '');

// 🛡️ Always returns an array — kabhi undefined/null nahi
const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

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
  const [clearingChat, setClearingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const myId = String(user?.id || '');

  // 🔍 Debug
  useEffect(() => {
    if (myId) console.log('[Chat] I am:', myId, user?.name);
  }, [myId, user?.name]);

  // ─── Socket ───
  useEffect(() => {
    const s = connectSocket();
    if (!s) return;

    const onNewMessage = (msg: Message) => {
      setMessages((prev) => {
        const sid = getSenderId(msg);
        const rid = getReceiverId(msg);
        const belongs =
          (sid === myId && rid === String(activeUserId)) ||
          (sid === String(activeUserId) && rid === myId);
        if (belongs && !prev.some((m) => m.id === msg.id)) {
          return [...prev, msg];
        }
        return prev;
      });
      loadConversations();
    };

    const onTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      if (String(userId) === String(activeUserId)) setTyping(isTyping);
    };

    const onMessageDeleted = ({ id }: { id: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    };

    const onConversationCleared = ({ userId }: { userId: string }) => {
      if (String(userId) === String(activeUserId)) {
        setMessages([]);
      }
      loadConversations();
    };

    s.on('new_message', onNewMessage);
    s.on('user_typing', onTyping);
    s.on('message_deleted', onMessageDeleted);
    s.on('conversation_cleared', onConversationCleared);

    return () => {
      s.off('new_message', onNewMessage);
      s.off('user_typing', onTyping);
      s.off('message_deleted', onMessageDeleted);
      s.off('conversation_cleared', onConversationCleared);
    };
  }, [activeUserId, myId]);

  const loadConversations = async () => {
    try {
      const data = await messagesService.conversations();
      // 🛡️ normalize: service kabhi bhi object/undefined de sakta hai
      const list = asArray<Conversation>(
        Array.isArray(data) ? data : (data as any)?.conversations,
      );
      setConversations(list);
    } catch (err) {
      console.error('[Chat] loadConversations failed:', err);
      setConversations([]);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

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
      Promise.resolve(
        (conversations ?? []).find(
          (c) => String(c.user?.id) === String(activeUserId),
        )?.user ?? null,
      ),
    ])
      .then(([msgs, u]) => {
        const list = asArray<Message>(
          Array.isArray(msgs) ? msgs : (msgs as any)?.messages,
        );
        setMessages(list);
        if (u) setActiveUser(u);
        getSocket()?.emit('mark_read', { senderId: activeUserId });
      })
      .catch((err) => {
        console.error('[Chat] history failed:', err);
        setMessages([]);
      })
      .finally(() => setLoadingMsgs(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      messagesService
        .searchUsers(searchQuery)
        .then((res) => {
          const list = asArray<ChatUser>(
            Array.isArray(res) ? res : (res as any)?.users,
          );
          setSearchResults(list);
        })
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || !activeUserId) return;

    const s = getSocket();
    if (!s) return;

    s.emit('send_message', { receiverId: activeUserId, content });
    setInput('');
    s.emit('typing', { receiverId: activeUserId, isTyping: false });
  };

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

  // 🗑️ Delete single message
  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await messagesService.deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete message');
    }
  };

  // 🗑️ Clear entire conversation
  const handleClearChat = async () => {
    if (!activeUserId || clearingChat) return;
    const ok = window.confirm(
      'Clear entire conversation? This will delete all messages for both you and the other person. This cannot be undone.',
    );
    if (!ok) return;

    setClearingChat(true);
    try {
      await messagesService.clearConversation(activeUserId);
      setMessages([]);
      loadConversations();
    } catch (err) {
      console.error(err);
      alert('Failed to clear conversation');
    } finally {
      setClearingChat(false);
    }
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

  // 🛡️ Extra safety for JSX reads
  const safeConversations = conversations ?? [];
  const safeMessages = messages ?? [];
  const safeSearchResults = searchResults ?? [];

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
                {safeSearchResults.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-slate-500 text-center">
                    No users found
                  </p>
                ) : (
                  safeSearchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => selectUser(u)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                        {u.name?.charAt(0).toUpperCase() ?? '?'}
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
            ) : safeConversations.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  No conversations yet.
                  <br />
                  Search users to start chatting.
                </p>
              </div>
            ) : (
              safeConversations.map((c) => (
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
                      {c.user.name?.charAt(0).toUpperCase() ?? '?'}
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
                      {(c.unreadCount ?? 0) > 0 && (
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
          className={`flex-1 flex-col ${mobileView === 'list' ? 'hidden sm:flex' : 'flex'}`}
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
                  {activeUser?.name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {activeUser?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {typing ? (
                      <span className="text-green-600 dark:text-green-400">typing...</span>
                    ) : safeConversations.find((c) => c.user.id === activeUserId)?.online ? (
                      <span className="text-green-600 dark:text-green-400">● Online</span>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>

                {/* Clear conversation button */}
                <button
                  onClick={handleClearChat}
                  disabled={clearingChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50 dark:bg-slate-950/50">
                {loadingMsgs ? (
                  <p className="text-center text-sm text-slate-500 py-8">Loading...</p>
                ) : safeMessages.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-8">
                    No messages yet. Say hi! 👋
                  </p>
                ) : (
                  <div className="space-y-3">
                    {safeMessages.map((m, idx) => {
                      const senderId = getSenderId(m);
                      const isMine = senderId === myId;
                      const prevMsg = idx > 0 ? safeMessages[idx - 1] : null;
                      const prevIsMine = prevMsg ? getSenderId(prevMsg) === myId : null;
                      const showAvatar = !isMine && prevIsMine !== false;

                      return (
                        <div
                          key={m.id}
                          className={`group flex w-full gap-2 ${
                            isMine ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!isMine && (
                            <div
                              className={`w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold text-xs shrink-0 self-end ${
                                showAvatar ? '' : 'invisible'
                              }`}
                            >
                              {(m.sender?.name || activeUser?.name || '?')
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                          {isMine && (
                            <button
                              onClick={() => handleDeleteMessage(m.id)}
                              title="Delete message"
                              aria-label="Delete message"
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 self-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <div
                            className={`max-w-[70%] flex flex-col ${
                              isMine ? 'items-end' : 'items-start'
                            }`}
                          >
                            <div
                              className={`px-4 py-2 rounded-2xl shadow-sm ${
                                isMine
                                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {m.content}
                              </p>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 px-1">
                              {formatTime(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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