import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { IconButton } from '@fluentui/react/lib/Button';
import 'regenerator-runtime/runtime';




export const VoiceInput = ({ onTranscriptChange }) => {

    initializeIcons();
    const { transcript, listening, resetTranscript } = useSpeechRecognition();
    const MyMicButton = () => <IconButton iconProps={{ iconName: 'Microphone' }} title="Say Loud" ariaLabel="Microphone" onClick={handleStart} />;
    const StopButton = () => <IconButton iconProps={{ iconName: 'Stop' }} title="Stop" ariaLabel="Microphone" onClick={handleStop} />;

    const handleStart = () => {
      SpeechRecognition.startListening({ interimResults: true });
    };

    const handleStop = () => {
        SpeechRecognition.stopListening();
        onTranscriptChange(transcript);
    };

  
    return (
      <div>
        {listening? <StopButton />: <MyMicButton/>}
        <p>{transcript}</p>
      </div>
    );
  };
  