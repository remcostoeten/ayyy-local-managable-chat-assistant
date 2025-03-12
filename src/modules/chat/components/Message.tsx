import type { IChatMessage } from "@/modules/chat/types"
import styles from "./Message.module.css"

interface IMessageProps {
    message: IChatMessage
}

const Message = ({ message }: IMessageProps) => {
    const isUser = message.role === "user"

    return (
        <div className={`${styles.messageContainer} ${isUser ? styles.userMessage : styles.assistantMessage}`}>
            <div className={styles.messageContent}>{message.content}</div>
            <div className={styles.messageTime}>{formatTime(message.timestamp)}</div>
        </div>
    )
}

const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("nl-NL", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date))
}

export default Message

