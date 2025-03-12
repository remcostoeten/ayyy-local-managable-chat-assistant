"use client"

import type React from "react"

import styles from "./MessageInput.module.css"

interface IMessageInputProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSubmit: (e: React.FormEvent) => void
    isLoading: boolean
}

const MessageInput = ({ value, onChange, onSubmit, isLoading }: IMessageInputProps) => {
    return (
        <form className={styles.inputForm} onSubmit={onSubmit}>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder="Type je vraag hier... (Type your question here...)"
                className={styles.inputField}
                disabled={isLoading}
            />
            <button
                type="submit"
                className={styles.sendButton}
                disabled={isLoading || !value.trim()}
                aria-label="Send message"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            </button>
        </form>
    )
}

export default MessageInput

