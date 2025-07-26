import { useState } from "react";
import { getGPTReply } from "./gpt";

function ChatCoach() {
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a chill running coach." }
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    const updated = [...messages, { role: "user", content: input }];
    setMessages(updated);
    const reply = await getGPTReply(updated);
    setMessages([...updated, { role: "assistant", content: reply }]);
    setInput("");
  };

  return (
    <div>
      <h2>Talk to your coach</h2>
      {messages.map((m, i) => (
        <p key={i}><b>{m.role}:</b> {m.content}</p>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default ChatCoach;
