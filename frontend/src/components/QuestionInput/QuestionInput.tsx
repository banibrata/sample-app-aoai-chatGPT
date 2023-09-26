import { useState, useEffect } from "react";
import { Stack, TextField } from "@fluentui/react";
import { SendRegular } from "@fluentui/react-icons";
import Send from "../../assets/Send.svg";
import styles from "./QuestionInput.module.css";
// import {VoiceInput} from "../common/VoiceInputAlt";
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { IconButton } from '@fluentui/react/lib/Button';
import useSpeechToText from 'react-hook-speech-to-text';


interface Props {
    onSend: (question: string, id?: string) => void;
    disabled: boolean;
    placeholder?: string;
    clearOnSend?: boolean;
    conversationId?: string;
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend, conversationId }: Props) => {
    const [question, setQuestion] = useState<string>("");

    const isChrome = /Chrome/.test(navigator.userAgent);


    const handleTranscriptChange = (newTranscript) => {
        setQuestion(newTranscript);
    };



    initializeIcons();
    const {
      error,
      interimResult,
      isRecording,
      results,
      startSpeechToText,
      stopSpeechToText,
      setResults
    } = useSpeechToText({
      continuous: true,
      useLegacyResults: false
    });
    const MyMicButton = () => <IconButton iconProps={{ iconName: 'Microphone' }} title="Speak (Chrome browser only)" ariaLabel="Microphone" onClick={startSpeechToText} />;
    const StopButton = () => <IconButton iconProps={{ iconName: 'Stop' }} title="Stop" ariaLabel="Microphone" onClick={stopSpeechToText} />;



    const sendQuestion = () => {
        if (disabled || !question.trim()) {
            return;
        }

        if(conversationId){
            onSend(question, conversationId);
        }else{
            onSend(question);
        }

        if (clearOnSend) {
            setQuestion("");
        }
        setResults([]);
    };

    const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendQuestion();
        }
    };

    const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setQuestion(newValue || "");
    };

    const sendQuestionDisabled = disabled || !question.trim();

    useEffect(() => {
        const concatenatedTranscripts = results.map((result) => result.transcript).join(' ');
        setQuestion(concatenatedTranscripts);
      }, [results]);

    return (
        <Stack horizontal className={styles.questionInputContainer}>
            <TextField
                className={styles.questionInputTextArea}
                placeholder={placeholder}
                multiline
                resizable={false}
                borderless
                value={question}
                onChange={onQuestionChange}
                onKeyDown={onEnterPress}
            />
            <div className={styles.questionInputSendButtonContainer} 
                role="button" 
                tabIndex={0}
                aria-label="Ask question button"
                onClick={sendQuestion}
                onKeyDown={e => e.key === "Enter" || e.key === " " ? sendQuestion() : null}
            >
                { sendQuestionDisabled ? 
                    <SendRegular className={styles.questionInputSendButtonDisabled}/>
                    :
                    <img src={Send} className={styles.questionInputSendButton}/>
                }
            </div>
            <div className={styles.questionInputBottomBorder} />
            {/* <VoiceInput onTranscriptChange={handleTranscriptChange}/> */}
            <div>
                {isRecording ?<StopButton />: <MyMicButton/>}
            </div>
        </Stack>
    );
};
