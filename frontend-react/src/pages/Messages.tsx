/**
 * Messages.tsx — Stitch "LuckyJob - Messages & Recruiter Chat" Screen
 * Design: DevHire Lite × Stitch Project 7104340314056633206
 * Screen: 119c5ea5eea147a488e884cbe77045ff
 */
import { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { messagesService } from '@/services/messages.service';
import { connectSocket, getSocket } from '@/lib/socket';
import type { Message, Conversation, ChatUser, UserRole } from '@/types';

/* ── helpers ─────────────────────────────────────────────────── */
const getSenderId   = (m: any): string => String(m?.senderId   ?? m?.sender_id   ?? m?.sender?.id   ?? '');
const getReceiverId = (m: any): string => String(m?.receiverId ?? m?.receiver_id ?? m?.receiver?.id ?? '');
const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

function formatTime(iso: string | Date | undefined) {
  if (!iso) return 'Just now';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ── pastel badge colors by company ─────────────────────────── */
const PASTEL_MAP: Record<string, string> = {
  stripe: '#FBE0CE',
  linear: '#D4F4E9',
  figma: '#E5DDF9',
  notion: '#DDF1FC',
  arcade: '#F8DDF0',
};

const PASTEL_COLORS: Record<number, string> = {
  0: '#FBE0CE', 1: '#D4F4E9', 2: '#E5DDF9',
  3: '#DDF1FC', 4: '#F8DDF0', 5: '#E9EDF2',
};

const getPastel = (companyOrName: string) => {
  const key = companyOrName.toLowerCase();
  return PASTEL_MAP[key] || PASTEL_COLORS[key.charCodeAt(0) % 6] || '#E9EDF2';
};

/* ── Stitch Mock / Fallback Recruiter Profiles ───────────────── */
interface RecruiterProfile extends ChatUser {
  company: string;
  category: 'recruiters' | 'community';
  unreadCount?: number;
  online?: boolean;
  jobRole?: string;
  jobBrief?: {
    title: string;
    tag: string;
    salary: string;
    location: string;
    appliedDate: string;
    jobId: string;
  };
  lastMessageText?: string;
  lastMessageTime?: string;
}

const STITCH_RECRUITERS: RecruiterProfile[] = [
  {
    id: 'stripe-sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@stripe.com',
    role: 'RECRUITER' as UserRole,
    company: 'Stripe',
    category: 'recruiters',
    unreadCount: 1,
    online: true,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmcG-Ogd_ehqYnp8hdw1GAeeDfoaT6tCiR9tYpUWGTJO1MOsqePd6LuYEsRoVHhLGYBYJiiZjAgKLtgjH8g-PzCw1XBQxv7nfcJ8HhJ0MYcD2pKAxSZJNb7jXi2tWUkH0oaK5li-ROVx1tHGb8nAzuqjkz2--5eFvLYK5UQkovSLrmNyScReYOX1GTczpCgdVI7cvzCsT53dWyXCQ3BTA6-jSera4rBzEjm24f85rsNaamiKw773IE',
    jobRole: 'Senior Product Designer',
    lastMessageText: 'Regarding your application for Senior Product Designer...',
    lastMessageTime: '10:24 AM',
    jobBrief: {
      title: 'Senior Product Designer',
      tag: 'DESIGN SYSTEMS',
      salary: '$140k - $175k',
      location: 'San Francisco, CA (Hybrid)',
      appliedDate: 'Applied May 10',
      jobId: '#STR-8924',
    },
  },
  {
    id: 'linear-marcus',
    name: 'Marcus Sterling',
    email: 'marcus@linear.app',
    role: 'RECRUITER' as UserRole,
    company: 'Linear',
    category: 'recruiters',
    unreadCount: 0,
    online: false,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCE7lA_0eg3GCi5rIC-RwiJknHXmK1C0NHh_d4V2IsNsaA0bu-iuBt1SMVMyepUIdjG_MmKWpkVYFC581PHw8YBsMrkm3qczrSPJyajDOlAwSbul5IKsj4c6izJ7W9vfhghlTcVuBnlLtDvjley2z1rrdmmo1P9mi-hfd0g1UY0jOsaDiChCZ-jHc1E83m_HhI_2Eia79hs4H3j5mJzU1kxd0wUiJh0Zq3QKSq5l84Vj3gR1OFBqaVb',
    jobRole: 'Talent Operations Lead',
    lastMessageText: "Let's schedule your interview for Wednesday",
    lastMessageTime: 'Yesterday',
    jobBrief: {
      title: 'Staff Frontend Engineer',
      tag: 'CORE SYSTEMS',
      salary: '$160k - $190k',
      location: 'Remote (US/EU)',
      appliedDate: 'Applied May 5',
      jobId: '#LIN-4102',
    },
  },
  {
    id: 'figma-elena',
    name: 'Elena Rostova',
    email: 'elena@figma.com',
    role: 'RECRUITER' as UserRole,
    company: 'Figma',
    category: 'recruiters',
    unreadCount: 1,
    online: true,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-xenD4MqWFWBXVPJaigkOTlH3WUE79fnERuWmC6PLHBpIi8wnR1nO_q7O085g_ExkiwghBKEVCePtCCawXFE9LtiU2V0_c1RHdlWIWJVREkKltPsgXFpM3aGFW_Ie5ze22DmqJETAC5H6OfD8mE9_PhzWYSMytYStrHol_BBtQXwA2TavfgWJmp_xTfGE6Q0oMyDjjlm6-8TvpXq3cL4wi27-Sizc3MxMFx2Djyqsp3imEu3iws6z',
    jobRole: 'Design Director • Core Systems',
    lastMessageText: 'Thanks for sharing your portfolio!',
    lastMessageTime: 'May 12',
    jobBrief: {
      title: 'Principal Systems Architect',
      tag: 'DESIGN TOKENS',
      salary: '$180k - $220k',
      location: 'San Francisco, CA',
      appliedDate: 'Applied May 2',
      jobId: '#FIG-7721',
    },
  },
  {
    id: 'notion-julian',
    name: 'Julian Vance',
    email: 'julian@makenotion.com',
    role: 'RECRUITER' as UserRole,
    company: 'Notion',
    category: 'recruiters',
    unreadCount: 0,
    online: false,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAcBGIADjZQHctHpLOSYS3jy51xv_-ZQTiRdpUNVZJhfkDPaiySKgX9dZjv5Oluvs2SPTtDcgneJaqsd4E77lFJLWNLkaRY7gi2q1B5CvbsMsPQFLGL50WE1lNmFq_yhp_0U-vQGvAOMvRQwV4dobwd5arf7b4-s_EmIswqR0dZvFFtIbEYae3OATcu3VpAj0l1cC-xSvXHo_PP_f5YAgcW9vzhw9jXXyruW6uAp-XLu-oqVSdBiTxi',
    jobRole: 'People Partner',
    lastMessageText: 'New role opening next week',
    lastMessageTime: 'May 8',
  },
  {
    id: 'arcade-alex',
    name: 'Alex Rivera',
    email: 'alex@arcade.software',
    role: 'RECRUITER' as UserRole,
    company: 'Arcade',
    category: 'community',
    unreadCount: 0,
    online: false,
    avatar: '',
    jobRole: 'Community Lead',
    lastMessageText: 'Great syncing during the SF Design Summit!',
    lastMessageTime: 'Apr 29',
  },
];

/* ── Initial Mock Messages for Sarah Jenkins ─────────────────── */
const STITCH_INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    senderId: 'stripe-sarah',
    receiverId: 'me',
    content:
      'Hi! Thanks for applying to Stripe. We loved your portfolio piece on multi-tenant design tokens. The cross-platform governance model you showcased is directly applicable to what our team is building right now.',
    createdAt: '2025-05-14T10:18:00Z',
    read: true,
  },
  {
    id: 'msg-2',
    senderId: 'stripe-sarah',
    receiverId: 'me',
    content:
      "Are you available for a 30-min intro call this Thursday? We'd love to walk through the organizational structure and introduce our Design Platform VP.",
    createdAt: '2025-05-14T10:19:00Z',
    read: true,
  },
  {
    id: 'msg-3',
    senderId: 'me',
    receiverId: 'stripe-sarah',
    content:
      "Hi Sarah, thank you! I'd love to chat. Thursday at 2:00 PM PST works great for me. Looking forward to learning more about the platform roadmaps.",
    createdAt: '2025-05-14T10:22:00Z',
    read: true,
  },
  {
    id: 'msg-4',
    senderId: 'stripe-sarah',
    receiverId: 'me',
    content:
      'Perfect, calendar invite sent! Feel free to review our team deck in the meantime.',
    createdAt: '2025-05-14T10:24:00Z',
    read: false,
  },
];

/* ── Avatar Initials Component ──────────────────────────────── */
function Initials({ name, size = 48, className = '' }: { name: string; size?: number; className?: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const pastel = getPastel(name);
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-[#181c21] shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: pastel, fontSize: Math.max(12, size * 0.35) }}
    >
      {initials || 'U'}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Messages() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeUserIdParam = searchParams.get('u');

  // Backend state
  const [dbConversations, setDbConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>(STITCH_INITIAL_MESSAGES);
  const [activeUser, setActiveUser] = useState<RecruiterProfile | ChatUser | null>(STITCH_RECRUITERS[0]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [activeFilter, setActiveFilter] = useState<'all' | 'recruiters' | 'unread'>('all');
  const [isTypingRemote, setIsTypingRemote] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const myId = String(user?.id || 'me');

  /* ── Socket Connection ───────────────────────────────────────── */
  useEffect(() => {
    const s = connectSocket();
    if (!s) return;

    const onNew = (msg: Message) => {
      const activeId = String(activeUser?.id || '');
      const sid = getSenderId(msg);
      const rid = getReceiverId(msg);
      const belongs =
        (sid === myId && rid === activeId) ||
        (sid === activeId && rid === myId);

      if (belongs) {
        setMessages((prev) => (!prev.some((m) => m.id === msg.id) ? [...prev, msg] : prev));
      }

      // Update conversations list
      setDbConversations((prev) =>
        prev.map((c) => {
          if (String(c.user?.id) === sid || String(c.user?.id) === rid) {
            return {
              ...c,
              lastMessage: msg.content,
              unreadCount: sid === activeId ? (c.unreadCount || 0) + 1 : c.unreadCount,
            };
          }
          return c;
        }),
      );
    };

    const onTyping = ({ senderId, isTyping }: { senderId: string; isTyping: boolean }) => {
      if (String(activeUser?.id) === String(senderId)) {
        setIsTypingRemote(isTyping);
      }
    };

    s.on('new_message', onNew);
    s.on('typing', onTyping);

    return () => {
      s.off('new_message', onNew);
      s.off('typing', onTyping);
    };
  }, [myId, activeUser?.id]);

  /* ── Load Conversations from Backend ─────────────────────────── */
  const loadConversations = () => {
    if (!user) return;
    messagesService
      .conversations()
      .then((data) => {
        const list = asArray<Conversation>(Array.isArray(data) ? data : (data as any)?.conversations);
        setDbConversations(list);
      })
      .catch((err) => {
        console.warn('Backend conversations fallback to Stitch demo list:', err);
      });
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  /* ── Open initial conversation if query param set ────────────── */
  useEffect(() => {
    if (!activeUserIdParam) {
      if (!activeUser) {
        setActiveUser(STITCH_RECRUITERS[0]);
      }
      return;
    }

    const mock = STITCH_RECRUITERS.find((r) => r.id === activeUserIdParam);
    if (mock) {
      setActiveUser(mock);
      if (mock.id === 'stripe-sarah') {
        setMessages(STITCH_INITIAL_MESSAGES);
      } else {
        setMessages([]);
      }
      return;
    }

    setLoadingMsgs(true);
    messagesService
      .history(activeUserIdParam)
      .then((res) => {
        const msgs = asArray<Message>(Array.isArray(res) ? res : (res as any)?.messages);
        setMessages(msgs);
        const inDb = dbConversations.find((c) => String(c.user?.id) === activeUserIdParam);
        if (inDb?.user) {
          setActiveUser(inDb.user);
        }
        getSocket()?.emit('mark_read', { senderId: activeUserIdParam });
      })
      .catch((err) => {
        console.error('Failed to load history:', err);
      })
      .finally(() => setLoadingMsgs(false));
  }, [activeUserIdParam, dbConversations]);

  /* ── Scroll to bottom ────────────────────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTypingRemote]);

  /* ── User Search ─────────────────────────────────────────────── */
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      messagesService
        .searchUsers(q)
        .then((res) => {
          const list = asArray<ChatUser>(Array.isArray(res) ? res : (res as any)?.users);
          setSearchResults(list);
        })
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  /* ── Selection Handler ───────────────────────────────────────── */
  const handleSelectUser = (recruiter: RecruiterProfile | ChatUser) => {
    setActiveUser(recruiter);
    setSearchParams({ u: String(recruiter.id) });
    setSearchQuery('');
    setSearchResults([]);
    setMobileView('chat');

    const isMock = STITCH_RECRUITERS.some((r) => r.id === recruiter.id);
    if (isMock) {
      if (recruiter.id === 'stripe-sarah') {
        setMessages(STITCH_INITIAL_MESSAGES);
      } else {
        setMessages([
          {
            id: `init-${recruiter.id}`,
            senderId: recruiter.id,
            receiverId: myId,
            content: (recruiter as RecruiterProfile).lastMessageText || 'Hello! Thanks for reaching out.',
            createdAt: new Date().toISOString(),
            read: true,
          },
        ]);
      }
      return;
    }

    setLoadingMsgs(true);
    messagesService
      .history(String(recruiter.id))
      .then((res) => {
        const msgs = asArray<Message>(Array.isArray(res) ? res : (res as any)?.messages);
        setMessages(msgs);
        getSocket()?.emit('mark_read', { senderId: String(recruiter.id) });
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
  };

  /* ── Send Message ────────────────────────────────────────────── */
  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend || input).trim();
    if (!content || !activeUser) return;

    const newMsg: Message = {
      id: `local-${Date.now()}`,
      senderId: myId,
      receiverId: String(activeUser.id),
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const isMock = STITCH_RECRUITERS.some((r) => r.id === activeUser.id);
    if (isMock) {
      setIsTypingRemote(true);
      setTimeout(() => {
        setIsTypingRemote(false);
        const replyMsg: Message = {
          id: `reply-${Date.now()}`,
          senderId: activeUser.id,
          receiverId: myId,
          content: `Thanks for the update! I received: "${content.slice(0, 40)}${
            content.length > 40 ? '...' : ''
          }". I will review this with our hiring leads and follow up shortly!`,
          createdAt: new Date().toISOString(),
          read: true,
        };
        setMessages((prev) => [...prev, replyMsg]);
      }, 1600);
      return;
    }

    // Real Socket Emit
    const s = getSocket();
    if (s) {
      s.emit('send_message', { receiverId: String(activeUser.id), content });
      s.emit('typing', { receiverId: String(activeUser.id), isTyping: false });
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (!activeUser) return;
    const s = getSocket();
    if (s && !STITCH_RECRUITERS.some((r) => r.id === activeUser.id)) {
      s.emit('typing', { receiverId: String(activeUser.id), isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        s.emit('typing', { receiverId: String(activeUser.id), isTyping: false });
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const autoGrow = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  /* ── Filtered conversation list ──────────────────────────────── */
  const combinedConversations = useMemo(() => {
    const items: Array<{
      id: string;
      user: RecruiterProfile | ChatUser;
      lastText: string;
      lastTime: string;
      unread: number;
      category: string;
      online: boolean;
      jobRole?: string;
    }> = [];

    // Real conversations first
    dbConversations.forEach((c) => {
      if (!c.user) return;
      const lastText = typeof c.lastMessage === 'string' ? c.lastMessage : (c.lastMessage as any)?.content || '';
      items.push({
        id: String(c.user.id),
        user: c.user,
        lastText,
        lastTime: '',
        unread: c.unreadCount || 0,
        category: 'recruiters',
        online: c.online || false,
        jobRole: c.user.role || 'Member',
      });
    });

    // Stitch mock recruiters
    STITCH_RECRUITERS.forEach((r) => {
      if (!items.some((i) => i.id === r.id)) {
        items.push({
          id: r.id,
          user: r,
          lastText: r.lastMessageText || '',
          lastTime: r.lastMessageTime || '',
          unread: r.unreadCount || 0,
          category: r.category,
          online: r.online || false,
          jobRole: r.jobRole || r.role,
        });
      }
    });

    return items;
  }, [dbConversations]);

  const filteredItems = useMemo(() => {
    return combinedConversations.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesQ =
        !q ||
        item.user.name.toLowerCase().includes(q) ||
        (item.user as any).company?.toLowerCase().includes(q) ||
        item.lastText.toLowerCase().includes(q);

      if (!matchesQ) return false;

      if (activeFilter === 'unread') return item.unread > 0;
      if (activeFilter === 'recruiters') return item.category === 'recruiters';
      return true;
    });
  }, [combinedConversations, searchQuery, activeFilter]);

  const unreadTotal = useMemo(
    () => combinedConversations.filter((i) => i.unread > 0).length,
    [combinedConversations],
  );

  const activeRecruiter = activeUser as RecruiterProfile | null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#f0f4fc]">

      {/* ── Stitch Obsidian Dark Sub-header ──────────────────────── */}
      <div className="w-full bg-[#171819] text-white px-5 lg:px-8 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#79d2f2] text-[#001f28]">
            <span className="material-symbols-outlined text-[18px]">forum</span>
          </span>
          <div className="flex items-center gap-2.5">
            <span className="text-[17px] sm:text-[18px] font-bold text-white tracking-tight">
              Direct Recruiter Messenger
            </span>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 text-[#79d2f2] text-[11px] font-semibold border border-[#79d2f2]/30">
              Active Pipeline
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-white/70">
          <div className="hidden md:flex items-center gap-2 text-[12px] font-medium text-white/80">
            <span className="w-2 h-2 rounded-full bg-[#79d2f2] animate-pulse" />
            <span>Candidate Sync Engine • Live</span>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Message settings"
          >
            <span className="material-symbols-outlined text-lg">tune</span>
          </button>
        </div>
      </div>

      {/* ── Main Container (12-Col Grid) ─────────────────────────── */}
      <div className="flex-1 w-full p-3 sm:p-5 lg:p-6 flex flex-col justify-start">
        <div className="max-w-[1360px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(23,24,25,0.06)] bg-white border border-[#e2e8f0] h-[calc(100vh-140px)] min-h-[640px] max-h-[880px]">

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── LEFT: CONVERSATION LIST (4 cols on desktop) ────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          <aside
            className={`lg:col-span-4 xl:col-span-4 flex-col bg-white border-r border-[#e2e8f0] overflow-hidden ${
              mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Search + Filter Row */}
            <div className="p-4 bg-[#f8faff] flex flex-col gap-3 border-b border-[#e2e8f0]">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75777a] text-lg pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations or recruiters..."
                  className="w-full bg-white text-[#181c21] text-[13px] sm:text-[14px] pl-10 pr-4 py-2.5 rounded-xl border border-[#d9dce1] placeholder-[#75777a] focus:outline-none focus:ring-2 focus:ring-[#79d2f2] transition-all shadow-2xs"
                />
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center gap-1 p-1 bg-[#ebeef6] rounded-xl text-[12px] font-medium">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                    activeFilter === 'all'
                      ? 'bg-white text-[#181c21] font-bold shadow-xs'
                      : 'text-[#444749] hover:text-[#181c21]'
                  }`}
                >
                  All <span className="text-[#75777a] text-[11px]">({combinedConversations.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('recruiters')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                    activeFilter === 'recruiters'
                      ? 'bg-white text-[#181c21] font-bold shadow-xs'
                      : 'text-[#444749] hover:text-[#181c21]'
                  }`}
                >
                  Recruiters{' '}
                  <span className="text-[#75777a] text-[11px]">
                    ({combinedConversations.filter((c) => c.category === 'recruiters').length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('unread')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center flex items-center justify-center gap-1.5 transition-all ${
                    activeFilter === 'unread'
                      ? 'bg-white text-[#181c21] font-bold shadow-xs'
                      : 'text-[#444749] hover:text-[#181c21]'
                  }`}
                >
                  <span>Unread</span>
                  {unreadTotal > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#79d2f2] text-[#001f28] text-[10px] font-bold">
                      {unreadTotal}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Backend User Search Results */}
            {searchResults.length > 0 && (
              <div className="border-b border-[#e2e8f0] bg-[#f8faff] max-h-48 overflow-y-auto">
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#75777a]">
                  Search Results
                </div>
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#f0f4fc] transition-colors text-left"
                  >
                    <Initials name={u.name} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#181c21] truncate">{u.name}</p>
                      <p className="text-[11px] text-[#75777a] truncate">{u.role || u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Conversations Stream */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#f0f4fc]">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                  <span className="material-symbols-outlined text-4xl text-[#c5c6c9] mb-2">forum</span>
                  <p className="text-[13px] font-semibold text-[#444749]">No conversations found</p>
                  <p className="text-[12px] text-[#75777a] mt-1">Try another filter or search term</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isCurrentActive = String(activeUser?.id) === item.id;
                  const companyName = (item.user as any).company || item.user.role?.split(' ')[0] || '';
                  const pastelBg = getPastel(companyName || item.user.name);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectUser(item.user)}
                      className={`relative w-full flex items-start gap-3 p-3.5 sm:p-4 text-left transition-colors ${
                        isCurrentActive
                          ? 'bg-[#f0f4fc]'
                          : 'bg-white hover:bg-[#f8faff]'
                      }`}
                    >
                      {/* Active Left Indicator Strip */}
                      {isCurrentActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#006780] rounded-r-md" />
                      )}

                      {/* Avatar with Online Badge */}
                      <div className="relative shrink-0">
                        {item.user.avatar ? (
                          <img
                            src={item.user.avatar}
                            alt={item.user.name}
                            className="w-12 h-12 rounded-full object-cover shadow-2xs"
                          />
                        ) : (
                          <Initials name={item.user.name} size={48} />
                        )}
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                            item.online ? 'bg-emerald-500' : 'bg-[#d9dce1]'
                          }`}
                          title={item.online ? 'Online now' : 'Offline'}
                        />
                      </div>

                      {/* Meta Information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className={`text-[14px] truncate ${
                                item.unread > 0 ? 'font-bold text-[#181c21]' : 'font-semibold text-[#181c21]'
                              }`}
                            >
                              {item.user.name}
                            </span>
                            {companyName && (
                              <span
                                className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-[#181c21] shrink-0"
                                style={{ backgroundColor: pastelBg }}
                              >
                                {companyName}
                              </span>
                            )}
                          </div>
                          {item.lastTime && (
                            <span
                              className={`text-[11px] shrink-0 ${
                                item.unread > 0 ? 'font-bold text-[#181c21]' : 'text-[#75777a]'
                              }`}
                            >
                              {item.lastTime}
                            </span>
                          )}
                        </div>

                        {/* Job Role / Subtitle */}
                        {item.jobRole && (
                          <p className="text-[12px] font-medium text-[#444749] truncate mb-0.5">
                            {item.jobRole}
                          </p>
                        )}

                        {/* Last message preview + Unread pill */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[12px] text-[#75777a] truncate">
                            {item.lastText || 'Click to view conversation'}
                          </p>
                          {item.unread > 0 ? (
                            <span className="shrink-0 w-5 h-5 rounded-full bg-[#006780] text-white text-[11px] flex items-center justify-center font-bold">
                              {item.unread}
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-[#75777a] text-[15px] shrink-0">
                              done_all
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Sidebar Bottom Status */}
            <div className="p-3.5 bg-[#f8faff] flex items-center justify-between text-[#75777a] border-t border-[#e2e8f0] shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
                <span className="text-[11px] text-[#444749] font-medium">Verified Recruiting Channel</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === 'unread' ? 'all' : 'unread')}
                className="text-[#181c21] hover:text-[#006780] text-[11px] font-semibold transition-colors"
              >
                Archived
              </button>
            </div>
          </aside>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* ── RIGHT: CHAT PANEL (8 cols on desktop) ──────────────── */}
          {/* ═════════════════════════════════════════════════════════ */}
          <main
            className={`lg:col-span-8 xl:col-span-8 flex-col bg-white overflow-hidden relative ${
              mobileView === 'list' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {activeUser ? (
              <>
                {/* ── Chat Recruiter Header ──────────────────────── */}
                <header className="px-4 lg:px-6 py-3.5 bg-white flex items-center justify-between gap-4 border-b border-[#e2e8f0] shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Back button on mobile */}
                    <button
                      type="button"
                      onClick={() => setMobileView('list')}
                      className="lg:hidden p-1.5 rounded-lg hover:bg-[#f0f4fc] text-[#181c21] transition-colors shrink-0"
                      aria-label="Back to conversations"
                    >
                      <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>

                    {/* Recruiter Avatar */}
                    <div className="relative shrink-0">
                      {activeUser.avatar ? (
                        <img
                          src={activeUser.avatar}
                          alt={activeUser.name}
                          className="w-11 h-11 rounded-full object-cover shadow-2xs"
                        />
                      ) : (
                        <Initials name={activeUser.name} size={44} />
                      )}
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    {/* Recruiter Name & Position */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[16px] font-bold text-[#181c21] truncate">
                          {activeUser.name}
                        </h2>
                        {((activeUser as any).company || activeUser.role) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0f4fc] text-[#181c21] text-[11px] font-semibold">
                            <span className="material-symbols-outlined text-[12px] text-[#006780]">domain</span>
                            {(activeUser as any).company || activeUser.role?.split(' ')[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[#444749] text-[12px] truncate">
                        <span className="font-medium text-[#181c21]">
                          {activeRecruiter?.jobRole || activeUser.role || 'Recruiter'}
                        </span>
                        <span className="text-[#c5c6c9]">•</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Online • typically replies in 1 hour
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Header Action Buttons */}
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0f4fc] hover:bg-[#ebeef6] text-[#181c21] text-[12px] font-semibold transition-colors"
                      title="View Job Posting"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#006780]">open_in_new</span>
                      Job Posting
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-xl text-[#444749] hover:text-[#181c21] hover:bg-[#f0f4fc] transition-colors"
                      title="Audio Call"
                      onClick={() => alert(`Starting audio call with ${activeUser.name}...`)}
                    >
                      <span className="material-symbols-outlined text-lg">call</span>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-xl text-[#444749] hover:text-[#181c21] hover:bg-[#f0f4fc] transition-colors"
                      title="Schedule Interview"
                      onClick={() => alert(`Opening interview scheduler with ${activeUser.name}...`)}
                    >
                      <span className="material-symbols-outlined text-lg">calendar_today</span>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-xl text-[#444749] hover:text-[#181c21] hover:bg-[#f0f4fc] transition-colors"
                      title="Options"
                    >
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </div>
                </header>

                {/* ── Job Brief Banner Card (Stripe / Recruiter Role) ── */}
                {activeRecruiter?.jobBrief && (
                  <div className="px-4 lg:px-6 pt-3 pb-1 shrink-0 bg-white">
                    <div
                      className="rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs border border-[#FBE0CE]/70"
                      style={{ backgroundColor: 'rgba(251, 224, 206, 0.55)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#171819] text-white flex items-center justify-center shrink-0 font-bold text-[13px] tracking-wide">
                          {activeRecruiter.company.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] sm:text-[14px] font-bold text-[#171819]">
                              {activeRecruiter.jobBrief.title}
                            </span>
                            <span className="bg-[#171819]/10 text-[#171819] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              {activeRecruiter.jobBrief.tag}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 text-[12px] text-[#444749] mt-0.5">
                            <span className="font-semibold text-[#171819]">{activeRecruiter.jobBrief.salary}</span>
                            <span>•</span>
                            <span>{activeRecruiter.jobBrief.location}</span>
                            <span>•</span>
                            <span className="text-[#006780] font-medium">{activeRecruiter.jobBrief.appliedDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="text-[11px] text-[#75777a] font-medium hidden md:inline">
                          Job ID: {activeRecruiter.jobBrief.jobId}
                        </span>
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-lg bg-[#171819] hover:bg-[#252629] text-white text-[12px] font-semibold transition-all inline-flex items-center gap-1 shadow-2xs"
                        >
                          View Brief
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Chat Messages Feed ─────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 flex flex-col bg-[#ffffff]">
                  {/* Centered Date Separator */}
                  <div className="flex items-center justify-center my-1">
                    <span className="px-3.5 py-1 rounded-full bg-[#f0f4fc] text-[#444749] text-[11px] font-semibold border border-[#e2e8f0]">
                      Today • May 14, 2025
                    </span>
                  </div>

                  {loadingMsgs ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 rounded-full border-2 border-[#79d2f2] border-t-transparent animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
                      <div className="w-14 h-14 rounded-2xl bg-[#f0f4fc] flex items-center justify-center mb-3 text-[#75777a]">
                        <span className="material-symbols-outlined text-2xl">chat</span>
                      </div>
                      <p className="text-[14px] font-semibold text-[#181c21]">No messages yet</p>
                      <p className="text-[12px] text-[#75777a] mt-1 max-w-xs">
                        Say hello to {activeUser.name} to kickstart your conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = getSenderId(msg) === myId || msg.senderId === 'me';
                      const prevMsg = i > 0 ? messages[i - 1] : null;
                      const prevIsMe = prevMsg ? (getSenderId(prevMsg) === myId || prevMsg.senderId === 'me') : null;
                      const showAvatar = !isMe && prevIsMe !== false;

                      const hasPdfAttachment = msg.content.includes('team deck') || msg.content.includes('.pdf');

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[78%] ${
                            isMe ? 'self-end justify-end' : 'self-start'
                          }`}
                        >
                          {/* Recruiter Avatar next to received message */}
                          {!isMe && (
                            <div className="w-8 shrink-0 mt-0.5">
                              {showAvatar ? (
                                activeUser.avatar ? (
                                  <img
                                    src={activeUser.avatar}
                                    alt={activeUser.name}
                                    className="w-8 h-8 rounded-full object-cover shadow-2xs"
                                  />
                                ) : (
                                  <Initials name={activeUser.name} size={32} />
                                )
                              ) : null}
                            </div>
                          )}

                          <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                            {showAvatar && !isMe && (
                              <div className="flex items-baseline gap-2">
                                <span className="text-[12px] font-semibold text-[#181c21]">{activeUser.name}</span>
                                <span className="text-[11px] text-[#75777a]">{formatTime(msg.createdAt)}</span>
                              </div>
                            )}

                            {isMe && showAvatar && (
                              <div className="flex items-baseline gap-2 flex-row-reverse">
                                <span className="text-[12px] font-semibold text-[#181c21]">You</span>
                                <span className="text-[11px] text-[#75777a]">{formatTime(msg.createdAt)}</span>
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div
                              className={`p-3.5 text-[13px] sm:text-[14px] leading-relaxed shadow-2xs ${
                                isMe
                                  ? 'rounded-2xl rounded-tr-sm bg-[#171819] text-white text-left'
                                  : 'rounded-2xl rounded-tl-sm bg-[#f0f4fc] text-[#181c21]'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>

                              {/* Embedded Deck / PDF Card if available */}
                              {hasPdfAttachment && (
                                <div className="mt-3 p-3 rounded-xl bg-white border border-[#d9dce1] flex items-center justify-between gap-3 text-[#181c21]">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-[#ddf1fc] text-[#006780] flex items-center justify-center shrink-0">
                                      <span className="material-symbols-outlined text-[18px]">description</span>
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[12px] font-bold truncate">Stripe_DesignPlatform_2025.pdf</p>
                                      <p className="text-[11px] text-[#75777a]">4.2 MB • Deck Overview</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="p-1.5 rounded-lg hover:bg-[#f0f4fc] text-[#444749] hover:text-[#181c21] transition-colors"
                                    title="Download Attachment"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Delivered status for sender */}
                            {isMe && (
                              <div className="flex items-center gap-1 text-[#006780] text-[11px] mr-1">
                                <span>Delivered</span>
                                <span className="material-symbols-outlined text-[13px]">done_all</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Remote Typing Indicator */}
                  {isTypingRemote && (
                    <div className="flex items-center gap-2 text-[#75777a] text-[12px] bg-[#f0f4fc] px-3 py-1.5 rounded-full w-fit">
                      <span className="w-2 h-2 rounded-full bg-[#006780] animate-bounce" />
                      <span>{activeUser.name} is typing...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* ── Quick Attach Bar (Stripe / Stitch pills) ───── */}
                <div className="px-4 lg:px-6 py-2.5 bg-white border-t border-[#f0f4fc] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
                  <span className="text-[#75777a] uppercase text-[10px] font-bold tracking-wider shrink-0 mr-1">
                    Quick Attach:
                  </span>
                  {[
                    { icon: 'description', label: 'Resume_Design_Lead.pdf' },
                    { icon: 'link',        label: 'Case Study: Fintech Tokenization' },
                    { icon: 'calendar_month', label: 'Share My Availability' },
                  ].map(({ icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleSendMessage(`[Attached: ${label}]`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f4fc] hover:bg-[#e2e8f0] text-[#181c21] text-[12px] font-medium transition-colors shrink-0 border border-[#d9dce1]/60"
                    >
                      <span className="material-symbols-outlined text-[14px] text-[#006780]">{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {/* ── Message Composer ────────────────────────────── */}
                <footer className="p-3.5 lg:px-6 lg:pb-4 bg-white border-t border-[#e2e8f0] shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="relative flex items-end gap-2 bg-[#f0f4fc] rounded-2xl p-2 focus-within:ring-2 focus-within:ring-[#79d2f2] focus-within:bg-white transition-all shadow-2xs border border-[#d9dce1]"
                  >
                    {/* Voice message button */}
                    <button
                      type="button"
                      onClick={() => setIsRecording(!isRecording)}
                      className={`p-2 rounded-xl transition-colors shrink-0 ${
                        isRecording
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'text-[#75777a] hover:text-[#181c21] hover:bg-[#e2e8f0]'
                      }`}
                      title={isRecording ? 'Stop recording' : 'Voice note'}
                    >
                      <span className="material-symbols-outlined text-lg">mic</span>
                    </button>

                    {/* Paperclip attach button */}
                    <button
                      type="button"
                      className="p-2 rounded-xl text-[#75777a] hover:text-[#181c21] hover:bg-[#e2e8f0] transition-colors shrink-0"
                      title="Attach file"
                    >
                      <span className="material-symbols-outlined text-lg">attach_file</span>
                    </button>

                    {/* Text input area */}
                    <div className="flex-1 min-w-0">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={autoGrow}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder={`Write a message to ${activeUser.name}... (Enter to send, Shift+Enter for newline)`}
                        className="w-full bg-transparent text-[#181c21] placeholder-[#75777a] text-[13px] sm:text-[14px] resize-none border-0 focus:outline-none py-1.5 px-1 max-h-32 leading-5"
                      />
                    </div>

                    {/* Cyan Stitch Send Button */}
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#79d2f2] hover:bg-[#a3e5ff] text-[#001f28] text-[13px] sm:text-[14px] font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Send</span>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </button>
                  </form>

                  {/* Sub-bar Status */}
                  <div className="flex items-center justify-between mt-2 px-2 text-[#75777a] text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Direct encrypted line with {(activeUser as any).company || activeUser.name} Talent Team
                    </span>
                    <span className="hidden sm:inline">Press Return ↵ to send</span>
                  </div>
                </footer>
              </>
            ) : (
              /* Empty state when no conversation active */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f8faff]">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#DDF1FC' }}
                >
                  <span className="material-symbols-outlined text-4xl text-[#006780]">forum</span>
                </div>
                <h2 className="text-[20px] font-bold text-[#181c21] tracking-tight mb-1.5">
                  Direct Recruiter Messenger
                </h2>
                <p className="text-[13px] text-[#75777a] max-w-sm leading-relaxed">
                  Select a recruiter or applicant from the conversation list on the left to start collaborating.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#006780]">
                  <span className="w-2 h-2 rounded-full bg-[#79d2f2] animate-pulse" />
                  Candidate Sync Engine • Live
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}