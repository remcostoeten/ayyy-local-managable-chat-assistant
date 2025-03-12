import type { IChatMessage } from "@/modules/chat/types"
import Message from "./Message"
import styles from "./MessageList.module.css"

interface IMessageListProps {
    messages: IChatMessage[]
}

const MessageList = ({ messages }: IMessageListProps) => {
    return (
        <div className={styles.messageList}>
            {messages.map((message) => (
                <Message key={message.id} message={message} />
            ))}
        </div>
    )
}

export default MessageList

