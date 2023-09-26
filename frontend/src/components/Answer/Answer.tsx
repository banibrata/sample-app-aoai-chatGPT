import { useEffect, useMemo, useState, useRef } from "react";
import { useBoolean } from "@fluentui/react-hooks"
import { FontIcon, Stack, Text } from "@fluentui/react";

import styles from "./Answer.module.css";

import { AskResponse, Citation, getVoice } from "../../api";
import { parseAnswer } from "./AnswerParser";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import supersub from 'remark-supersub'
import { SpeechSynthesizer, SpeechConfig, AudioConfig } from "microsoft-cognitiveservices-speech-sdk";
import {Feedback, sendFeedbackApi} from "../../api";
import "./Modal.css";
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { IconButton } from '@fluentui/react/lib/Button';

interface Props {
    answer: AskResponse;
    onCitationClicked: (citedDocument: Citation) => void;
}

export const Answer = ({
    answer,
    onCitationClicked
}: Props) => {

    initializeIcons();

    const MyLikeButton = () => <IconButton iconProps={{ iconName: 'Like' }} title="Like" ariaLabel="Like" onClick={() => collectFeedback("Like")}/>;
    const MyLikeSolidButton = () => <IconButton iconProps={{ iconName: 'LikeSolid' }} title="Like already sent" ariaLabel="Liked" />;

    const MyDislikeButton = () => <IconButton iconProps={{ iconName: 'Dislike' }} title="Dislike" ariaLabel="Dislike" onClick={() => collectFeedback("Dislike")} />;
    const MyDislikeSolidButton = () => <IconButton iconProps={{ iconName: 'DislikeSolid' }} title="Dislike already sent" ariaLabel="Disliked" />;

    const MyMicButton = () => <IconButton iconProps={{ iconName: 'ReadOutLoud' }} title="Read Out Loud" ariaLabel="ReadOutLoud" onClick={readOut} />;
    // const MyMicStopButton = () => <IconButton iconProps={{ iconName: 'StopSolid' }} title="Stop" ariaLabel="Stop playing" onClick={abort} />;
    const [isRefAccordionOpen, { toggle: toggleIsRefAccordionOpen }] = useBoolean(false);
    const filePathTruncationLimit = 50;

    const parsedAnswer = useMemo(() => parseAnswer(answer), [answer]);
    const [chevronIsExpanded, setChevronIsExpanded] = useState(isRefAccordionOpen);
    const [modal, setModal] = useState(false);
    const [action, setAction] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [isDisLiked, setIsDisLiked] = useState(false);

  

    const toggleModal = () => {
      setModal(!modal);
    };
  

  

    const handleChevronClick = () => {
        setChevronIsExpanded(!chevronIsExpanded);
        toggleIsRefAccordionOpen();
      };

    useEffect(() => {
        setChevronIsExpanded(isRefAccordionOpen);
    }, [isRefAccordionOpen]);

    const createCitationFilepath = (citation: Citation, index: number, truncate: boolean = false) => {
        let citationFilename = "";

        if (citation.filepath && citation.chunk_id) {
            if (truncate && citation.filepath.length > filePathTruncationLimit) {
                const citationLength = citation.filepath.length;
                citationFilename = `${citation.filepath.substring(0, 20)}...${citation.filepath.substring(citationLength -20)} - Part ${parseInt(citation.chunk_id) + 1}`;
            }
            else {
                citationFilename = `${citation.filepath} - Part ${parseInt(citation.chunk_id) + 1}`;
            }
        }
        else {
            citationFilename = `Citation ${index}`;
        }
        return citationFilename;
    };


    const collectFeedback = (action: string) =>
    {
        setAction(action);
        toggleModal();
        if(action === "Like") setIsLiked(true); 
        if(action === "Dislike") setIsDisLiked(true);
        

        if(modal) {
            document.body.classList.add('active-modal')
          } else {
            document.body.classList.remove('active-modal')
          }


    };

    const sendFeedback = async (feedback: string) => {console.info("send feedback")
    if(text === '') {
        return;
    }
        const request : Feedback = {
            action: action,
            user_input: parsedAnswer.question,
            llm_output: parsedAnswer.markdownFormatText,
            feedback: feedback

        }

        toggleModal();
        setText('');
        
        try {
            const response = await sendFeedbackApi(request);
        } catch ( e )  { }
    };


    const sleep = (milliseconds: number) => {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
      };
    

const [playing, setPlaying] = useState(false);
const readOut = async () => {

    try {
        const response = await getVoice();
    } catch ( e )  { }

    
    const subscriptionKey = 'a87d4e8b33d14c84835b2b0ea6eca1b1';
    const region = 'eastus';
    setPlaying(true);
    const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);
    const audioConfig = AudioConfig.fromDefaultSpeakerOutput();
    const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
    const text_to_speak = "You asked : " + parsedAnswer.question + "LLM answers: " + parsedAnswer.markdownFormatText;
    await synthesizer.speakTextAsync(text_to_speak);
    await sleep(text_to_speak.length * 80);

    setPlaying(false);    

};


const [text, setText] = useState('');

const handleTextAreaChange = (e) => {
    setText(e.target?.value);
};

    return (
        <>
            <Stack className={styles.answerContainer} tabIndex={0}>
                <Stack.Item grow>
                    <ReactMarkdown
                        linkTarget="_blank"
                        remarkPlugins={[remarkGfm, supersub]}
                        children={parsedAnswer.markdownFormatText}
                        className={styles.answerText}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                       {isLiked? ( <MyLikeSolidButton />): (<MyLikeButton />) }
                       {isDisLiked? (<MyDislikeSolidButton />): (<MyDislikeButton />) }
                       {playing? (null): (<MyMicButton />)}
                    </div>
                </Stack.Item>
                <Stack horizontal className={styles.answerFooter}>
                {!!parsedAnswer.citations.length && (
                    <Stack.Item
                        onKeyDown={e => e.key === "Enter" || e.key === " " ? toggleIsRefAccordionOpen() : null}
                    >
                        <Stack style={{width: "100%"}} >
                            <Stack horizontal horizontalAlign='start' verticalAlign='center'>
                                <Text
                                    className={styles.accordionTitle}
                                    onClick={toggleIsRefAccordionOpen}
                                    aria-label="Open references"
                                    tabIndex={0}
                                    role="button"
                                >
                                <span>{parsedAnswer.citations.length > 1 ? parsedAnswer.citations.length + " references" : "1 reference"}</span>
                                </Text>
                                <FontIcon className={styles.accordionIcon}
                                onClick={handleChevronClick} iconName={chevronIsExpanded ? 'ChevronDown' : 'ChevronRight'}
                                />
                            </Stack>
                            
                        </Stack>
                    </Stack.Item>
                )}
                <Stack.Item className={styles.answerDisclaimerContainer}>
                    <span className={styles.answerDisclaimer}>AI-generated content may be incorrect</span>
                </Stack.Item>
                </Stack>
                {chevronIsExpanded && 
                    <div style={{ marginTop: 8, display: "flex", flexFlow: "wrap column", maxHeight: "150px", gap: "4px" }}>
                        {parsedAnswer.citations.map((citation, idx) => {
                            return (
                                <span 
                                    title={createCitationFilepath(citation, ++idx)} 
                                    tabIndex={0} 
                                    role="link" 
                                    key={idx} 
                                    onClick={() => onCitationClicked(citation)} 
                                    onKeyDown={e => e.key === "Enter" || e.key === " " ? onCitationClicked(citation) : null}
                                    className={styles.citationContainer}
                                    aria-label={createCitationFilepath(citation, idx)}
                                >
                                    <div className={styles.citation}>{idx}</div>
                                    {createCitationFilepath(citation, idx, true)}
                                </span>);
                        })}
                    </div>
                }
            </Stack>
            {modal && (
                <div className="modal">
                  <div onClick={toggleModal} className="overlay"></div>
                  <div className="modal-content">
                  <label>
                    <textarea value={text}
                    onChange={handleTextAreaChange} 
                    placeholder = "Please share your feedback to improve" 
                    rows={14}
                    cols={72}/>
                  </label>
                    <div><button onClick={() => sendFeedback(text)}>Send</button></div>
                    <button className="close-modal" onClick={toggleModal}>
                      x
                    </button>
                  </div>
                </div>
              )}
        </>
    );
};
