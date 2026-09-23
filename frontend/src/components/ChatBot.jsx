import { useEffect, useRef, useState } from "react";
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi";

const WELCOME_MESSAGE =
  "Hi! I'm the BookMarket assistant. Ask me about buying, selling, orders, shipping, or your account.";

// Simple keyword -> answer rules. Checked in order; first match wins.
const RULES = [
  {
    keywords: ["sell", "list my book", "listing"],
    reply:
      "To sell a book, go to \"Sell Your Books\" in the menu, fill in the title, condition and price, add photos, and submit. You can track your listings from your dashboard under \"Listings\".",
  },
  {
    keywords: ["buy", "purchase", "order book", "how to order"],
    reply:
      "Browse books on the \"Books\" page, open a listing you like, and click \"Add to Cart\". When you're ready, go to your cart and checkout.",
  },
  {
    keywords: ["cart"],
    reply: "You can view and edit your cart anytime from the cart icon in the navbar, or by visiting /cart.",
  },
  {
    keywords: ["shipping", "delivery", "deliver"],
    reply:
      "Shipping details and delivery estimates are shown at checkout once you enter your address. Sellers ship directly to buyers after an order is placed.",
  },
  {
    keywords: ["payment", "pay", "refund", "cancel order"],
    reply:
      "Payments are handled securely at checkout. For refunds or order cancellations, please check \"My Orders\" in your dashboard or contact us via the Contact page.",
  },
  {
    keywords: ["track", "status", "my order"],
    reply: "You can track order status from your dashboard under \"Orders\".",
  },
  {
    keywords: ["account", "profile", "password", "login", "register", "sign up", "sign in"],
    reply:
      "You can manage your account from \"Profile\" in your dashboard. Forgot your password? Use the \"Forgot Password\" link on the login page.",
  },
  {
    keywords: ["wishlist"],
    reply: "Save books you're interested in to your Wishlist from any book's detail page, and view them anytime in your dashboard.",
  },
  {
    keywords: ["price", "condition", "category", "categories"],
    reply:
      "Books are listed with a condition (Like New, Good, Fair, Worn) and category (Fiction, Academic, Competitive-Exam, and more). You can filter by these on the Books page.",
  },
  {
    keywords: ["contact", "support", "help", "human"],
    reply: "For anything I can't help with, please reach out via our Contact page and our team will get back to you.",
  },
  {
    keywords: ["hi", "hello", "hey"],
    reply: "Hello! How can I help you with buying or selling books today?",
  },
  {
    keywords: ["thank", "thanks"],
    reply: "You're welcome! Happy to help with anything else.",
  },
];

const FALLBACK_REPLY =
  "I'm not totally sure about that, but you can browse the Books page, check your dashboard, or reach out on our Contact page for more help.";

function getReply(message) {
  const lower = message.toLowerCase();
  const match = RULES.find((rule) => rule.keywords.some((kw) => lower.includes(kw)));
  return match ? match.reply : FALLBACK_REPLY;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: WELCOME_MESSAGE }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, typing]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setError("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setTyping(true);

    // Simulate a short "thinking" delay so replies feel natural.
    setTimeout(() => {
      try {
        const reply = getReply(trimmed);
        setMessages((prev) => [...prev, { role: "bot", text: reply }]);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setTyping(false);
      }
    }, 500);
  };

  return (
    <div className="chatbot-root">
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>BookMarket Assistant</span>
            <button
              type="button"
              className="chatbot-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <FiX />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-bubble ${
                  msg.role === "user" ? "chatbot-bubble-user" : "chatbot-bubble-bot"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {typing && <div className="chatbot-bubble chatbot-bubble-bot chatbot-typing">Typing...</div>}
            {error && <div className="chatbot-error">{error}</div>}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-row" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              aria-label="Type your message"
            />
            <button type="submit" disabled={!input.trim()} aria-label="Send message">
              <FiSend />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chatbot-fab"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <FiX /> : <FiMessageCircle />}
      </button>
    </div>
  );
}
