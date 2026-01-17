import { useState } from "react";
import { 
  Search, 
  Send, 
  Phone, 
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  color: string;
}

interface Message {
  id: string;
  content: string;
  time: string;
  sent: boolean;
  read: boolean;
}

const contacts: Contact[] = [
  { id: "1", name: "Captain Nova", avatar: "CN", lastMessage: "The mission is a go! 🚀", time: "2m", unread: 2, online: true, color: "from-purple-500 to-violet-600" },
  { id: "2", name: "Engineer Luna", avatar: "EL", lastMessage: "I've fixed the quantum drive", time: "15m", unread: 0, online: true, color: "from-blue-500 to-cyan-600" },
  { id: "3", name: "Dr. Stellar", avatar: "DS", lastMessage: "The readings are fascinating", time: "1h", unread: 0, online: false, color: "from-green-500 to-emerald-600" },
  { id: "4", name: "Pilot Orion", avatar: "PO", lastMessage: "Ready for departure", time: "3h", unread: 1, online: true, color: "from-amber-500 to-orange-600" },
  { id: "5", name: "Commander Atlas", avatar: "CA", lastMessage: "Meeting at 0900 hours", time: "1d", unread: 0, online: false, color: "from-rose-500 to-pink-600" },
];

const messageHistory: Record<string, Message[]> = {
  "1": [
    { id: "1", content: "Hey team, status report?", time: "10:30", sent: false, read: true },
    { id: "2", content: "All systems nominal, Captain!", time: "10:31", sent: true, read: true },
    { id: "3", content: "Excellent work. Prepare for hyperjump.", time: "10:32", sent: false, read: true },
    { id: "4", content: "Coordinates locked in.", time: "10:33", sent: true, read: true },
    { id: "5", content: "The mission is a go! 🚀", time: "10:35", sent: false, read: false },
  ],
  "2": [
    { id: "1", content: "The quantum drive was malfunctioning", time: "09:15", sent: false, read: true },
    { id: "2", content: "What was the issue?", time: "09:16", sent: true, read: true },
    { id: "3", content: "Particle alignment was off by 0.003%", time: "09:18", sent: false, read: true },
    { id: "4", content: "I've fixed the quantum drive", time: "09:45", sent: false, read: true },
  ],
};

const MessagesApp = () => {
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Record<string, Message[]>>(messageHistory);

  const currentMessages = messages[selectedContact.id] || [];

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      sent: true,
      read: false,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), message],
    }));
    setNewMessage("");
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex bg-background/50">
      {/* Contacts List */}
      <div className="w-72 border-r border-border/50 flex flex-col">
        <div className="p-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  selectedContact.id === contact.id
                    ? "bg-primary/20"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="relative">
                  <Avatar className={`bg-gradient-to-br ${contact.color}`}>
                    <AvatarFallback className="text-white text-sm">
                      {contact.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {contact.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">
                      {contact.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{contact.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {contact.lastMessage}
                  </p>
                </div>
                {contact.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[10px] text-primary-foreground font-medium">
                      {contact.unread}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-3 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className={`bg-gradient-to-br ${selectedContact.color}`}>
              <AvatarFallback className="text-white">
                {selectedContact.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground">{selectedContact.name}</h3>
              <p className="text-xs text-muted-foreground">
                {selectedContact.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {currentMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sent ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.sent
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "glass rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${message.sent ? "justify-end" : ""}`}>
                    <span className={`text-[10px] ${message.sent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {message.time}
                    </span>
                    {message.sent && (
                      message.read ? (
                        <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                      ) : (
                        <Check className="w-3 h-3 text-primary-foreground/70" />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="bg-background/50"
            />
            <Button variant="ghost" size="icon">
              <Smile className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-gradient-to-br from-violet-500 to-purple-600"
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesApp;
