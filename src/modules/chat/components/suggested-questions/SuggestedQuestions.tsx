"use client"

import styles from "./SuggestedQuestions.module.css"

interface ISuggestedQuestionsProps {
    questions: string[]
    onQuestionClick: (question: string) => void
}

const SuggestedQuestions = ({ questions, onQuestionClick }: ISuggestedQuestionsProps) => {
    return (
        <div className={styles.suggestedQuestions}>
            <p className={styles.suggestedTitle}>Suggested questions:</p>
            <div className={styles.questionsList}>
                {questions.map((question, index) => (
                    <button
                        key={index}
                        className={styles.questionButton}
                        onClick={() => onQuestionClick(question)}
                    >
                        {question}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SuggestedQuestions;

