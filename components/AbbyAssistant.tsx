import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { UserWallet } from "@shared/schema";
import absaAbbyLogo from "../assets/absa_abby_logo.png";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  type?: "text" | "achievement" | "tip" | "reward";
  metadata?: {
    points?: number;
    achievement?: string;
    progress?: number;
    rewardType?: string;
  };
}

// Enhanced AI responses with personalization and gamification
const mockResponses: Record<string, string> = {
  // Onboarding responses
  "new": "Welcome to Absa MoneyCircles! 🎉 I'm Abby, your personal financial guide. I can help you save smarter, manage your money circles, and achieve your financial goals. What would you like to explore first?",
  "guide": "Let me show you around! With MoneyCircles, you can save with friends, track goals, earn rewards, and learn money tips. Want to start a circle or set a savings goal?",
  
  // Financial literacy responses
  "learn": "I love sharing financial knowledge! 📚 We have daily tips, fun quests, and interactive lessons. You can earn XP points while learning. What topic interests you?",
  "tips": "Here's a smart saving tip: Set up automatic contributions to your MoneyCircle. Even small, regular amounts add up over time! Want to try it?",
  "budget": "Creating a budget is your first step to financial success! Let's break down your income and expenses together. Ready to start?",
  
  // MoneyCircles specific responses
  "circle progress": "Your Family Vacation Fund circle is doing great! 🌟 The group has saved R15,000 (75% of goal). You've contributed R3,000 so far. Keep it up!",
  "circle achievement": "🎉 Congratulations! Your Office Party circle just reached its first milestone! You've unlocked a special badge and 100 XP points!",
  "circle tip": "Pro tip: Invite more friends to your circle! Larger groups often reach their goals faster and make saving more fun. Want to send some invites?",
  
  // Gamification and rewards
  "points": "You've earned 350 XP points this month! 🏆 Complete 2 more savings missions to level up and unlock exclusive rewards!",
  "rewards": "You have 3,250 Absa Rewards points and 3 unclaimed badges! Would you like to see what you can redeem them for?",
  "mission": "New mission alert! 🎯 Save R500 this week to earn double XP points and a special achievement badge. Ready to accept?",
  
  // Personalized financial insights
  "analysis": "I notice you're great at regular saving! 📈 Based on your pattern, you could reach your holiday goal 2 months earlier by increasing your weekly contribution by just R50!",
  "suggestion": "Hey, I see you have some extra funds in your account. Would you like me to automatically distribute it across your savings goals?",
  "hello": "Hello! I'm Abby, your Absa virtual assistant. How can I help you today?",
  "hi": "Hi there! I'm Abby, your Absa virtual assistant. How can I help you today?",
  "help": "I can help you with account information, money circles, savings goals, payments, and more. What would you like to know?",
  "balance": "Let me check your account balance for you.",
  "account": "Your Absa Gold Account is in good standing. Your current balance is R12,450.00.",
  "transfer": "I can help you transfer money. Who would you like to send money to?",
  "pay": "To make a payment, head to the Pay tab in the app. You can send money via phone number or QR code.",
  "savings": "You have 2 active savings goals: Holiday Fund (75% complete) and New Laptop (35% complete).",
  "goal": "You can create a new savings goal by tapping the + button on the home screen.",
  "circles": "You're currently part of 2 money circles: Family Vacation Fund and Office Party.",
  "create circle": "To create a new money circle, tap the + button at the bottom of the screen.",
  "join circle": "To join an existing money circle, you'll need an invite code from the circle admin.",
  "interest rate": "Your Absa savings account currently earns 5.5% interest per annum.",
  "loan": "I can help you explore loan options. What type of loan are you interested in?",
  "mortgage": "Absa offers competitive mortgage rates starting from 7.25%. Would you like to speak to a mortgage specialist?",
  "invest": "Absa offers various investment options including mutual funds, stocks, and retirement accounts.",
  "fees": "Absa account maintenance fees are R5.50 per month for your current plan.",
  "rewards": "You have 3,250 Absa Rewards points. You can redeem them for airtime, vouchers, or cash back.",
  "card": "Your Absa credit card ending in 3456 has a limit of R25,000 and a current balance of R7,234.",
  "branch": "The nearest Absa branch is at 120 Main Street, open Monday-Friday 8am-4pm and Saturday 8am-12pm.",
  "contact": "You can contact Absa customer service at 0860 000 123 or support@absa.co.za.",
  "thanks": "You're welcome! Is there anything else I can help you with?",
  "thank you": "You're welcome! Is there anything else I can help you with?",
  "bye": "Goodbye! Have a great day. Feel free to chat with me anytime you need assistance.",
};

// Enhanced contextual suggestions
const defaultSuggestions = [
  "What's my balance?",
  "Show my savings goals",
  "Money circle information",
  "Help with payments",
  "Investment options"
];

export default function AbbyAssistant({ onClose }: { onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm Abby, your Absa virtual assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date()
    }
  ]);
  const [suggestions, setSuggestions] = useState(defaultSuggestions);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: wallet } = useQuery<UserWallet>({
    queryKey: ['/api/wallet']
  });

  useEffect(() => {
    scrollToBottom();
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Process the message and generate a response
    setTimeout(() => {
      const { response, type, metadata } = generateEnhancedResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "assistant",
        timestamp: new Date(),
        type,
        metadata
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Show toast for achievements and rewards
      if (type === "achievement" || type === "reward") {
        toast({
          title: type === "achievement" ? "Achievement Unlocked! 🏆" : "Reward Earned! 🎁",
          description: metadata?.achievement || metadata?.rewardType,
          duration: 5000
        });
      }

      // Update suggestions based on context
      updateSuggestions(input);
    }, 500); // Simulate AI processing time
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Enhanced response generation with types and metadata
  const generateEnhancedResponse = (userInput: string): { response: string; type: Message['type']; metadata?: Message['metadata'] } => {
    const lowerInput = userInput.toLowerCase();
    
    // Check for achievements and rewards
    if (lowerInput.includes("achievement") || lowerInput.includes("badge")) {
      return {
        response: mockResponses["circle achievement"],
        type: "achievement",
        metadata: {
          points: 100,
          achievement: "Savings Milestone Master"
        }
      };
    }

    if (lowerInput.includes("reward") || lowerInput.includes("points")) {
      return {
        response: mockResponses["rewards"],
        type: "reward",
        metadata: {
          points: 3250,
          rewardType: "Cashback Reward"
        }
      };
    }

    // Check for tips and financial advice
    if (lowerInput.includes("tip") || lowerInput.includes("advice")) {
      return {
        response: mockResponses["tips"],
        type: "tip"
      };
    }

    // Check for balance or account inquiries
    if (lowerInput.includes("balance") || lowerInput.includes("money") || lowerInput.includes("account")) {
      if (wallet) {
        return {
          response: `Your current account balance is ${formatCurrency(wallet.balance)}.`,
          type: "text"
        };
      }
    }

    // Check for direct matches in our mock responses
    for (const key in mockResponses) {
      if (lowerInput.includes(key)) {
        return {
          response: mockResponses[key],
          type: "text"
        };
      }
    }

    // Default responses if no match is found
    const defaultResponses = [
      "I want to make sure I help you in the best way possible. Could you rephrase that? 🤔",
      "I'm continuously learning to serve you better! Can you tell me more about what you need? 📚",
      "Let me suggest something else that might help. Would you like to explore savings goals or money circles? 💡",
      "While I'm working on understanding that better, I can help you with account info, savings goals, or money circles! What interests you? 🎯"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  // Update suggestion chips based on conversation context
  const updateSuggestions = (lastInput: string) => {
    const input = lastInput.toLowerCase();
    
    if (input.includes("savings") || input.includes("goal")) {
      setSuggestions([
        "Create a new goal",
        "Increase my savings",
        "Savings tips",
        "Auto-save options",
        "View all goals"
      ]);
    } else if (input.includes("circle") || input.includes("group")) {
      setSuggestions([
        "Join a circle",
        "Create new circle",
        "Circle benefits",
        "Circle rules",
        "Circle contributions"
      ]);
    } else if (input.includes("payment") || input.includes("pay") || input.includes("send")) {
      setSuggestions([
        "Pay via QR",
        "Transfer to account",
        "Schedule payment",
        "Payment history",
        "Payment limits"
      ]);
    } else if (input.includes("invest") || input.includes("investment")) {
      setSuggestions([
        "Investment options",
        "Current rates",
        "Risk assessment",
        "Talk to advisor",
        "Portfolio review"
      ]);
    } else {
      setSuggestions(defaultSuggestions);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: suggestion,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Process the suggestion
    setTimeout(() => {
      const response = generateResponse(suggestion);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "assistant",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update suggestions
      updateSuggestions(suggestion);
    }, 500);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className={`fixed inset-0 bg-black/50 z-50 flex justify-center items-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white w-full max-w-md rounded-t-2xl h-[80vh] flex flex-col transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-primary text-white rounded-t-2xl">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center mr-3">
              <img 
                src={absaAbbyLogo} 
                alt="Absa Abby" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Abby</h3>
              <p className="text-xs text-white/70">Absa Virtual Assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'assistant' && (
                <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center mr-2 flex-shrink-0">
                  <img 
                    src={absaAbbyLogo} 
                    alt="Absa Abby" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              <div 
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  message.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : message.type === 'achievement' 
                    ? 'bg-green-50 border-2 border-green-200 rounded-tl-none'
                    : message.type === 'reward'
                    ? 'bg-yellow-50 border-2 border-yellow-200 rounded-tl-none'
                    : message.type === 'tip'
                    ? 'bg-blue-50 border-2 border-blue-200 rounded-tl-none'
                    : 'bg-white shadow-sm rounded-tl-none'
                }`}
              >
                {message.type === 'achievement' && (
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">🏆</span>
                    <span className="text-sm font-semibold text-green-700">Achievement Unlocked!</span>
                  </div>
                )}
                {message.type === 'reward' && (
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">🎁</span>
                    <span className="text-sm font-semibold text-yellow-700">Reward Earned!</span>
                  </div>
                )}
                {message.type === 'tip' && (
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">💡</span>
                    <span className="text-sm font-semibold text-blue-700">Pro Tip</span>
                  </div>
                )}
                <p>{message.text}</p>
                {message.metadata?.points && (
                  <div className="mt-2 text-sm">
                    <span className="font-semibold">+{message.metadata.points} XP</span>
                  </div>
                )}
                <p className="text-xs opacity-70 mt-1 text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.sender === 'user' && (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="p-3 bg-white border-t overflow-x-auto">
          <div className="flex space-x-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="px-3 py-1.5 bg-gray-100 rounded-full text-sm whitespace-nowrap hover:bg-gray-200 transition"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t flex items-center space-x-2">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-full"
          />
          <Button 
            size="icon" 
            className="rounded-full"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}