// pages/messaging/ConversationPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { messagingService } from '@/api';

const ConversationPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const currentUserId = user?._id || user?.id;

  const fetch = useCallback(async () => {
    try {
      const [conversationData, messagesData] = await Promise.all([
        messagingService.getConversation(conversationId),
        messagingService.getMessages(conversationId),
      ]);
      setConversation(conversationData);
      setMessages(messagesData.messages || []);
      await messagingService.markAsRead(conversationId).catch(() => {});
    } catch { toast.error('Failed to load conversation'); navigate(-1); }
    finally { setLoading(false); }
  }, [conversationId, navigate]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    const optimistic = { _id: Date.now(), content: newMsg, sender: { _id: currentUserId }, senderId: currentUserId, createdAt: new Date().toISOString(), pending: true };
    setMessages((m) => [...m, optimistic]);
    setNewMsg('');
    try {
      const sent = await messagingService.sendMessage(conversationId, { content: newMsg });
      setMessages((m) => m.map((msg) => msg._id === optimistic._id ? sent : msg));
    } catch {
      toast.error('Failed to send');
      setMessages((m) => m.filter((msg) => msg._id !== optimistic._id));
    } finally {
      setSending(false);
    }
  };

  const other = conversation?.participants?.find((p) => p._id !== currentUserId) || conversation?.otherParticipant;

  return (
    <div className="flex flex-col h-screen font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-background shrink-0">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">{(other?.name || other?.firstName || '?')[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-bold">{other?.name || `${other?.firstName || ''} ${other?.lastName || ''}`.trim() || 'Unknown'}</p>
          <p className="text-[11px] text-muted-foreground">{conversation?.subject || ''}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-3/4 rounded-2xl" style={{ marginLeft: i % 2 ? 'auto' : undefined }} />)
        : messages.map((msg) => {
          const isMe = msg.sender?._id === currentUserId || msg.senderId === currentUserId;
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary text-black rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'} ${msg.pending ? 'opacity-60' : ''}`}>
                <p>{msg.content || msg.body}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-black/50' : 'text-muted-foreground'}`}>{formatDate(msg.createdAt, { dateStyle: undefined, timeStyle: 'short' })}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background shrink-0">
        <div className="flex gap-2">
          <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message…" className="h-10" onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} />
          <Button onClick={handleSend} disabled={sending || !newMsg.trim()} size="icon" className="h-10 w-10 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
