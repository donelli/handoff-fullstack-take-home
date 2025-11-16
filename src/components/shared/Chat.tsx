"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Chat.module.css";

const formatMessageTime = (date: Date) => {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export function Chat() {
  const [message, setMessage] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Message:", message);
    setMessage("");
    setTimeout(scrollToBottom, 0);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Chat</h2>
      </div>
      <div ref={messagesContainerRef} className={styles.messages}>
        <div className={styles.message}>
          <div className={styles.messageHeader}>
            <div className={styles.messageSender}>John Doe</div>
            <div className={styles.messageTime}>
              {formatMessageTime(new Date(Date.now() - 2 * 60 * 60 * 1000))}
            </div>
          </div>
          <div className={styles.messageContent}>
            Hello! I&apos;m interested in discussing the job details.
          </div>
        </div>
        <div className={`${styles.message} ${styles.messageOwn}`}>
          <div className={styles.messageHeader}>
            <div className={styles.messageSender}>You</div>
            <div className={styles.messageTime}>
              {formatMessageTime(new Date(Date.now() - 1 * 60 * 60 * 1000))}
            </div>
          </div>
          <div className={styles.messageContent}>
            Thanks for reaching out! What would you like to know?
          </div>
        </div>
        <div className={`${styles.message} ${styles.messageOwn}`}>
          <div className={styles.messageHeader}>
            <div className={styles.messageSender}>You</div>
            <div className={styles.messageTime}>
              {formatMessageTime(new Date(Date.now() - 50 * 60 * 1000))}
            </div>
          </div>
          <div className={styles.messageContent}>
            Thanks for reaching out! What would you like to know?
          </div>
        </div>
        <div className={`${styles.message} ${styles.messageOwn}`}>
          <div className={styles.messageHeader}>
            <div className={styles.messageSender}>You</div>
            <div className={styles.messageTime}>
              {formatMessageTime(new Date(Date.now() - 45 * 60 * 1000))}
            </div>
          </div>
          <div className={styles.messageContent}>
            Thanks for reaching out! What would you like to know?
          </div>
        </div>
        <div className={`${styles.message} ${styles.messageOwn}`}>
          <div className={styles.messageHeader}>
            <div className={styles.messageSender}>You</div>
            <div className={styles.messageTime}>
              {formatMessageTime(new Date(Date.now() - 40 * 60 * 1000))}
            </div>
          </div>
          <div className={styles.messageContent}>
            Thanks for reaching out! What would you like to know?
          </div>
        </div>
        <div className={`${styles.message} ${styles.messageOwn}`}>
          <div className={styles.messageHeader}>
            <div className={styles.messageSender}>You</div>
            <div className={styles.messageTime}>
              {formatMessageTime(new Date(Date.now() - 35 * 60 * 1000))}
            </div>
          </div>
          <div className={styles.messageContent}>
            Thanks for reaching out! What would you like to know?
          </div>
        </div>
        <div className={`${styles.message} ${styles.messageOwn}`}>
          <div className={styles.messageHeader}>
            <div className={styles.messageSender}>You</div>
            <div className={styles.messageTime}>
              {formatMessageTime(new Date(Date.now() - 30 * 60 * 1000))}
            </div>
          </div>
          <div className={styles.messageContent}>
            Thanks for reaching out! What would you like to know?
          </div>
        </div>
        <div className={`${styles.message} ${styles.messageOwn}`}>
          <div className={styles.messageHeader}>
            <div className={styles.messageSender}>You</div>
            <div className={styles.messageTime}>
              {formatMessageTime(new Date(Date.now() - 25 * 60 * 1000))}
            </div>
          </div>
          <div className={styles.messageContent}>
            Thanks for reaching out! What would you like to know?
          </div>
        </div>
        <div className={`${styles.message} ${styles.messageOwn}`}>
          <div className={styles.messageHeader}>
            <div className={styles.messageSender}>You</div>
            <div className={styles.messageTime}>
              {formatMessageTime(new Date(Date.now() - 20 * 60 * 1000))}
            </div>
          </div>
          <div className={styles.messageContent}>
            Thanks for reaching out! What would you like to know?
          </div>
        </div>
        <div className={`${styles.message} ${styles.messageOwn}`}>
          <div className={styles.messageHeader}>
            <div className={styles.messageSender}>You</div>
            <div className={styles.messageTime}>
              {formatMessageTime(new Date(Date.now() - 15 * 60 * 1000))}
            </div>
          </div>
          <div className={styles.messageContent}>
            Thanks for reaching out! What would you like to know?
          </div>
        </div>
        <div className={`${styles.message} ${styles.messageOwn}`}>
          <div className={styles.messageHeader}>
            <div className={styles.messageSender}>You</div>
            <div className={styles.messageTime}>
              {formatMessageTime(new Date(Date.now() - 10 * 60 * 1000))}
            </div>
          </div>
          <div className={styles.messageContent}>
            Thanks for reaching out! What would you like to know?
          </div>
        </div>
        <div className={`${styles.message} ${styles.messageOwn}`}>
          <div className={styles.messageHeader}>
            <div className={styles.messageSender}>You</div>
            <div className={styles.messageTime}>
              {formatMessageTime(new Date(Date.now() - 5 * 60 * 1000))}
            </div>
          </div>
          <div className={styles.messageContent}>
            Thanks for reaching out! What would you like to know?
          </div>
        </div>
      </div>
      <form className={styles.inputContainer} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
    </div>
  );
}
