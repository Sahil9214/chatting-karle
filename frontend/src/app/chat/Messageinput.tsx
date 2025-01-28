"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Smile, Send } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  disabled,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFormat = (format: "bold" | "italic") => {
    const textarea = document.getElementById(
      "message-input"
    ) as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    const beforeText = message.substring(0, start);
    const afterText = message.substring(end);

    const formatChar = format === "bold" ? "**" : "_";
    const formattedText = `${beforeText}${formatChar}${selectedText}${formatChar}${afterText}`;

    setMessage(formattedText);
    textarea.focus();
  };

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex items-center mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleFormat("bold")}
          disabled={disabled}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleFormat("italic")}
          disabled={disabled}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" disabled={disabled}>
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-8 gap-2">
              {["😀", "😂", "😍", "🤔", "😎", "👍", "❤️", "🎉"].map((emoji) => (
                <button
                  key={emoji}
                  className="text-2xl hover:bg-gray-100 rounded p-1"
                  onClick={() => setMessage((prev) => prev + emoji)}
                  disabled={disabled}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-2">
        <Textarea
          id="message-input"
          placeholder={
            disabled
              ? "Select a user to start chatting"
              : "Type your message..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          className="flex-1 min-h-[80px] max-h-[160px]"
          disabled={disabled}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="h-10 px-4"
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
}
