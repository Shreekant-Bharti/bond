import { useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    text: "Hello! I'm Aartha, your BondFi assistant. I can help you understand government bonds, explain yields, or guide you through the platform. What would you like to know?",
    sender: "bot",
    timestamp: new Date(),
  },
];

const BOT_RESPONSES: Record<string, string> = {
  bond: "Government bonds are debt securities issued by governments to fund public spending. On BondFi, you can invest in fractional ownership of these bonds using stablecoins, making them accessible to everyone.",
  yield: "Yield represents the annual return you earn from a bond, expressed as a percentage. BondFi bonds typically offer yields between 6-9% based on tenure and risk level.",
  invest: "To invest on BondFi: 1) Create an account, 2) Fund your wallet with stablecoins, 3) Browse available bonds, 4) Select quantity and confirm purchase. It's that simple!",
  secondary: "The Secondary Market allows you to sell your bond holdings before maturity. Other investors can purchase your bonds at current market rates.",
  risk: "Government bonds are generally considered low-risk investments. BondFi lists bonds from verified government sources with transparent oracle-verified pricing.",
  wallet: "Your BondFi wallet holds USDT stablecoins. You can deposit funds, track your balance, and withdraw earnings anytime through the Wallet section.",
  oracle: "BondFi uses Chainlink-style oracle verification to ensure bond yields are accurately cross-checked against official government reference rates.",
  default: "I'd be happy to help with that! You can ask me about bonds, yields, investing process, the secondary market, wallets, or risk levels. What specific topic interests you?",
};

function getBotResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("bond") && !lowerMessage.includes("yield")) {
    return BOT_RESPONSES.bond;
  }
  if (lowerMessage.includes("yield") || lowerMessage.includes("return") || lowerMessage.includes("interest")) {
    return BOT_RESPONSES.yield;
  }
  if (lowerMessage.includes("invest") || lowerMessage.includes("buy") || lowerMessage.includes("purchase") || lowerMessage.includes("how")) {
    return BOT_RESPONSES.invest;
  }
  if (lowerMessage.includes("secondary") || lowerMessage.includes("sell") || lowerMessage.includes("market")) {
    return BOT_RESPONSES.secondary;
  }
  if (lowerMessage.includes("risk") || lowerMessage.includes("safe")) {
    return BOT_RESPONSES.risk;
  }
  if (lowerMessage.includes("wallet") || lowerMessage.includes("fund") || lowerMessage.includes("deposit")) {
    return BOT_RESPONSES.wallet;
  }
  if (lowerMessage.includes("oracle") || lowerMessage.includes("verify") || lowerMessage.includes("chainlink")) {
    return BOT_RESPONSES.oracle;
  }
  
  return BOT_RESPONSES.default;
}

export function AarthaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: getBotResponse(userMessage.text),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center",
          "bg-gradient-to-br from-primary to-secondary hover:scale-110 hover:shadow-primary/30",
          isOpen && "rotate-90"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[9999] w-80 sm:w-96 h-[28rem] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.15)",
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Aartha</h3>
              <p className="text-xs text-muted-foreground">BondFi Assistant</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  {message.text}
                </div>
                {message.sender === "user" && (
                  <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-secondary" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-background/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about bonds, yields..."
                className="flex-1 bg-muted/50 border border-border/50 rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  inputValue.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
