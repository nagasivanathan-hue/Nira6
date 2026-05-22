'use client';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Send, ArrowLeft, User, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store';
import api from '@/services/api';

interface ContactDetails {
  _id: string;
  name: string;
  avatar: string;
}

interface Contact {
  contact: ContactDetails;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface Message {
  _id: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: string;
  createdAt: string;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialContactId = searchParams.get('contact');
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedContactRef = useRef<ContactDetails | null>(null);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations sidebar
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/chat');
      setContacts(data);

      // If initialContactId is specified in URL, fetch/create it
      if (initialContactId && !selectedContactRef.current) {
        const found = data.find((c: Contact) => c.contact._id === initialContactId);
        if (found) {
          setSelectedContact(found.contact);
        } else {
          // If no existing conversation, fetch details of user to show at top
          try {
            const userRes = await api.get(`/users/${initialContactId}`);
            setSelectedContact({
              _id: initialContactId,
              name: userRes.data.name || 'Creative Partner',
              avatar: userRes.data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
            });
          } catch {
            setSelectedContact({
              _id: initialContactId,
              name: 'Creative Partner',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
            });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingContacts(false);
    }
  }, [initialContactId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        fetchConversations();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchConversations]);

  // Poll messages every 3 seconds for simulated live chat
  useEffect(() => {
    if (!selectedContact) return;

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/chat`, {
          params: { contactId: selectedContact._id }
        });
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [selectedContact]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const contentText = inputText;
    setInputText('');
    setSending(true);

    try {
      // Optimistic update
      const tempMsg: Message = {
        _id: `temp-${Date.now()}`,
        senderId: currentUser?.id || '',
        recipientId: selectedContact._id,
        content: contentText,
        type: 'text',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempMsg]);

      await api.post('/chat', {
        recipientId: selectedContact._id,
        content: contentText
      });

      // Reload conversations list to update sidebar text
      fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <ShieldAlert className="w-12 h-12 text-nira-yellow mb-3" />
        <h2 className="text-xl font-bold text-nira-dark font-heading">Authorization Required</h2>
        <p className="text-xs text-nira-text-secondary mt-1 mb-4">Please log in to your NIRA6 account to chat with creators.</p>
        <Link href="/auth/login" className="px-6 py-2.5 bg-nira-yellow text-nira-dark font-black text-xs uppercase tracking-wider rounded-xl shadow-md">Login Now</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nira-gray text-nira-dark flex flex-col">
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/creators" className="flex items-center gap-1 text-xs font-bold text-nira-text-secondary hover:text-nira-dark">
            <ArrowLeft className="w-4 h-4" /> Back to Creator Hub
          </Link>
          <span className="text-[10px] bg-nira-yellow/20 border border-nira-yellow/30 px-2 py-0.5 rounded text-nira-dark font-black uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-nira-dark" /> NIRA6 SECURE ENVELOPE
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex gap-6 h-[calc(100vh-140px)] min-h-[500px]">
        {/* Conversations Sidebar */}
        <div className="w-1/3 bg-white rounded-3xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-heading font-black text-sm uppercase tracking-wider">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingContacts ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-nira-yellow" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-10">
                <User className="w-8 h-8 text-nira-text-secondary mx-auto mb-2 opacity-30" />
                <p className="text-xs text-nira-text-secondary font-bold">No active conversations</p>
              </div>
            ) : (
              contacts.map((c) => (
                <button
                  key={c.contact._id}
                  onClick={() => setSelectedContact(c.contact)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${selectedContact?._id === c.contact._id ? 'bg-nira-yellow/10 border border-nira-yellow/20' : 'hover:bg-nira-gray border border-transparent'}`}
                >
                  <Image src={c.contact.avatar} alt={c.contact.name} width={40} height={40} className="rounded-xl object-cover shrink-0" unoptimized />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-xs text-nira-dark truncate">{c.contact.name}</p>
                      {c.unreadCount > 0 && (
                        <span className="w-2.5 h-2.5 bg-nira-yellow rounded-full shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-nira-text-secondary truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Window */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
          {selectedContact ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                <Image src={selectedContact.avatar} alt={selectedContact.name} width={40} height={40} className="rounded-xl object-cover" unoptimized />
                <div>
                  <h4 className="font-bold text-xs text-nira-dark">{selectedContact.name}</h4>
                  <p className="text-[9px] text-nira-success font-bold uppercase tracking-wider">Secure Escrow Chat</p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-nira-gray/20">
                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-nira-dark text-white rounded-br-none shadow-sm' : 'bg-white border border-gray-150 text-nira-dark rounded-bl-none shadow-sm'}`}>
                        {msg.content}
                        <p className={`text-[8px] mt-1 text-right ${isMe ? 'text-white/55' : 'text-nira-text-secondary'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="p-3 bg-nira-yellow text-nira-dark rounded-xl hover:bg-nira-yellow-dark transition-all disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <User className="w-12 h-12 text-nira-text-secondary opacity-20 mb-3 animate-pulse" />
              <h3 className="font-heading font-black text-sm text-nira-dark uppercase tracking-wider">No Conversation Selected</h3>
              <p className="text-[11px] text-nira-text-secondary mt-1">Select a contact from the sidebar list to transmit messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-nira-gray flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-nira-yellow" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
