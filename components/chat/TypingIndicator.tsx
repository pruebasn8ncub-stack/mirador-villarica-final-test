export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 px-4 py-3"
      role="status"
      aria-label="El asistente está escribiendo"
    >
      <span className="typing-dot h-2 w-2 rounded-full bg-bosque-400" />
      <span className="typing-dot h-2 w-2 rounded-full bg-bosque-400" />
      <span className="typing-dot h-2 w-2 rounded-full bg-bosque-400" />
    </div>
  );
}
