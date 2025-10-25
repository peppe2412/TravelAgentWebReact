import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showInitialMessage, setShowInitialMessage] = useState(true);
  const [randomMessages, setRandomMessages] = useState("");
  const [error, setError] = useState("");

  let strings = [
    "Ciao, di cosa hai bisogno oggi?",
    "Ciao, non lasciare che questa avventura ti sfugga: prenota ora il tuo viaggio!",
    "Ciao, che tipo di viaggio hai in mente?",
  ];

  useEffect(() => {
    let randomIndex = Math.floor(Math.random() * strings.length);
    setRandomMessages(strings[randomIndex]);
  }, []);

  const closeSpanError = () => {
      setError('');
    };

  const sendMessage = async () => {
    if (!input.trim()) {
      setError("Inserisci il tuo messaggio!");
      return;
    }

    if (showInitialMessage) setShowInitialMessage(false);

    const newMessage = [...messages, { role: "user", content: input }].map(
      (msg) => ({
        role: msg.role,
        content:
          typeof msg.content == "string"
            ? msg.content
            : JSON.stringify(msg.content),
      })
    );
    setMessages(newMessage);
    setInput("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8080/chat/travel-agent",
        {
          messages: newMessage,
        }
      );

      const reply = response.data.response;
      const replyText = typeof reply == "string" ? reply : reply.content;
      setIsTyping(true);
      typingMessage(replyText, newMessage);
    } catch (error) {
      console.error("Errore, durante la chiamata API", error);
    }
  };

  const typingMessage = (text, currentMessage) => {
    let index = 0;
    let speedTyping = 40;
    let diplayedText = "";

    const interval = setInterval(() => {
      diplayedText += text[index];
      index++;

      setMessages([
        ...currentMessage,
        { role: "assistant", content: diplayedText },
      ]);

      if (index == text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speedTyping);
  };

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <header className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <h1 className="text-center display-2">Travel Agent</h1>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 fs-5">
            <div className="chat-box">
              {showInitialMessage && (
                <h3 className="text-center display-5 fw-bold m-0">
                  {randomMessages}
                </h3>
              )}

              {!showInitialMessage &&
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`${
                      msg.role == "user"
                        ? "d-flex justify-content-end mb-5 mt-5"
                        : "d-flex justify-content-start"
                    }`}
                  >
                    <span
                      className={`${
                        msg.role == "user"
                          ? "user-message-box bg-main"
                          : "ai-message-box"
                      }`}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p {...props} className="bg-transparent m-0" />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </span>
                  </div>
                ))}
              <div ref={chatEndRef}></div>
            </div>

            {error && (
              <div className="d-flex justify-content-center">
                <div className="bg-danger p-3">
                  <span className="bg-transparent">{error}</span>
                  <button
                    className="bg-transparent mx-4 button-close"
                    onClick={closeSpanError}
                  >
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="bg-transparent"
                    />
                  </button>
                </div>
              </div>
            )}

            <div className="input-button-box">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key == "Enter" && sendMessage()}
                className="input-message"
                placeholder="Inserisci messaggio...."
                aria-describedby="addon-wrapping"
              />

              <button onClick={sendMessage} className="button-send bg-main">
                <FontAwesomeIcon icon={faArrowUp} className="bg-transparent" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
