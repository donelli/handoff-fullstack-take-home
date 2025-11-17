"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "~/providers/auth-provider";
import styles from "./JobChat.module.css";
import { Spinner } from "~/foundation/Spinner";
import { Button } from "~/foundation/Button";
import { useToast } from "~/foundation/hooks/useToast";
import { useJobChatMessages, useCreateJobChatMessage } from "~/hooks/api";

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

interface JobChatProps {
  jobId: number;
}

export function JobChat({ jobId }: JobChatProps) {
  const [message, setMessage] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showErrorToast } = useToast();

  const { messages, loading, error, refetch } = useJobChatMessages(jobId);

  const { createMessage, loading: creatingMessage } = useCreateJobChatMessage();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || creatingMessage) return;

    try {
      await createMessage({
        content: message.trim(),
        jobId,
      });
      setMessage("");
      void refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
      showErrorToast("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Chat</h2>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Chat</h2>
        </div>
        <div
          style={{
            padding: "var(--spacing-md)",
            textAlign: "center",
            color: "var(--red-500)",
          }}
        >
          Failed to load messages
        </div>
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  const currentUserId = user?.id;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Chat</h2>
      </div>
      <div ref={messagesContainerRef} className={styles.messages}>
        {messages.length === 0 ? (
          <div
            style={{
              padding: "var(--spacing-md)",
              textAlign: "center",
              color: "var(--gray-500)",
            }}
          >
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = currentUserId === msg.createdByUserId;
            return (
              <div
                key={msg.id}
                className={`${styles.message} ${isOwnMessage ? styles.messageOwn : ""}`}
              >
                <div className={styles.messageHeader}>
                  <div className={styles.messageSender}>
                    {isOwnMessage ? "You" : msg.createdByUser.name}
                  </div>
                  <div className={styles.messageTime}>
                    {formatMessageTime(msg.createdAt)}
                  </div>
                </div>
                <div className={styles.messageContent}>{msg.content}</div>
              </div>
            );
          })
        )}
      </div>
      <form className={styles.inputContainer} onSubmit={handleSubmit}>
        <textarea
          className={styles.input}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={creatingMessage}
        />
        <Button type="submit" loading={creatingMessage} variant="primary">
          Send
        </Button>
      </form>
      <div className={styles.chatHelpText}>
        Press Shift + Enter to send a message
      </div>
    </div>
  );
}
