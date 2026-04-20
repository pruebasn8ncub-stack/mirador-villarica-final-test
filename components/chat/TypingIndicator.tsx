import { AssistantAvatar } from './AssistantAvatar';

export function TypingIndicator() {
  return (
    <div
      className="flex items-end gap-2 animate-message-in"
      role="status"
      aria-label="Lucía está escribiendo"
    >
      <AssistantAvatar size="xs" robot />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-bosque-100 bg-white px-3 py-2 shadow-chat-bubble-bot">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-bosque-400" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-bosque-400" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-bosque-400" />
      </div>
    </div>
  );
}
