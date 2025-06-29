import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import api from "@/lib/api";

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  message: string;
  createdAt: string;
  propertyId: string;
}

interface ChatDialogProps {
  booking: {
    _id: string;
    property: {
      _id: string;
      title: string;
      owner?: {
        _id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
      };
    };
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChatDialog = ({ booking, isOpen, onOpenChange }: ChatDialogProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('ChatDialog rendered with:', {
    booking,
    isOpen,
    user: user?.id,
    bookingId: booking?._id,
    propertyOwner: booking?.property?.owner?._id,
    userId: booking?.userId?._id
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch messages when dialog opens or booking changes
  useEffect(() => {
    if (isOpen && booking) {
      fetchMessages();
      
      // Set up periodic refresh every 5 seconds when dialog is open
      const interval = setInterval(() => {
        fetchMessages();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, booking?._id]);

  const fetchMessages = async () => {
    if (!booking?._id) {
      console.log('No booking ID, skipping fetch');
      return;
    }
    
    console.log('Fetching messages for booking:', booking._id);
    setIsLoading(true);
    try {
      const response = await api.get(`/messages/booking/${booking._id}`);
      console.log('Messages received:', response.data);
      console.log('Number of messages:', response.data.length);
      setMessages(response.data);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    // A single, robust guard clause at the beginning of the function
    if (!newMessage.trim() || !user || !booking?.property?._id) {
      console.error('sendMessage aborted: Missing critical data.', {
        hasMessage: !!newMessage.trim(),
        hasUser: !!user,
        hasBooking: !!booking,
        hasProperty: !!booking?.property,
        hasPropertyId: !!booking?.property?._id,
      });
      toast.error("Cannot send message: booking data is incomplete.");
      return;
    }
    
    setIsSending(true);
    try {
      // Determine if current user is the host or guest
      const isHost = user.id === booking.property.owner?._id;
      const recipientId = isHost ? booking.userId._id : booking.property.owner?._id;
      
      if (!recipientId) {
        toast.error("Unable to determine recipient. Chat may not be available for this booking.");
        setIsSending(false);
        return;
      }

      const messageData = {
        bookingId: booking._id,
        recipientId: recipientId,
        message: newMessage.trim(),
        propertyId: booking.property._id
      };
      
      console.log('Sending message data to API:', messageData);

      const response = await api.post('/messages', messageData);
      
      console.log('Message sent successfully:', response.data);
      setNewMessage("");
      
      // Add a small delay before fetching messages to ensure backend has processed
      setTimeout(() => {
        fetchMessages();
      }, 500);
    } catch (error: any) {
      console.error('Error sending message:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (message: Message) => {
    return message.sender._id === user?.id;
  };

  const getChatTitle = () => {
    if (!user || !booking) return "Chat";
    
    const isHost = user.id === booking.property?.owner?._id;
    const guestName = booking.userId?.firstName || "Guest";
    const hostName = booking.property?.owner?.firstName || 'Host';

    return isHost ? `Chat with ${guestName}` : `Chat with ${hostName}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col bg-background border-border shadow-medium" aria-describedby="chat-dialog-desc">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center space-x-2 text-foreground">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span>{getChatTitle()}</span>
          </DialogTitle>
          <DialogDescription id="chat-dialog-desc" className="text-muted-foreground">
            Send and receive messages for this booking.
          </DialogDescription>
          <p className="text-sm text-muted-foreground">
            {booking?.property?.title || "Property"}
          </p>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 rounded-lg border border-border">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`flex items-start space-x-2 max-w-xs ${isOwnMessage(message) ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="h-8 w-8 border-2 border-border">
                      <AvatarImage src={message.sender?.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {message.sender?.firstName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${isOwnMessage(message) ? 'items-end' : 'items-start'}`}>
                      <Card className={`message-bubble ${isOwnMessage(message) ? 'message-bubble-own' : 'message-bubble-other'} shadow-soft`}>
                        <CardContent className="p-3">
                          <p className="text-sm leading-relaxed">{message.message || '[empty message]'}</p>
                        </CardContent>
                      </Card>
                      <span className="text-xs text-muted-foreground mt-1 px-1">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex items-center space-x-2 p-4 border-t border-border bg-background">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={isSending}
              className="flex-1 input-enhanced focus-enhanced"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="btn-primary"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog; 