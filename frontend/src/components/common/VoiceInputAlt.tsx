import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { IconButton } from '@fluentui/react/lib/Button';
import useSpeechToText from 'react-hook-speech-to-text';




export const VoiceInput = ({ onTranscriptChange }) => {

    initializeIcons();
    const {
      error,
      interimResult,
      isRecording,
      results,
      startSpeechToText,
      stopSpeechToText,
    } = useSpeechToText({
      continuous: true,
      useLegacyResults: false
    });
    const MyMicButton = () => <IconButton iconProps={{ iconName: 'Microphone' }} title="Say Loud" ariaLabel="Microphone" onClick={startSpeechToText} />;
    const StopButton = () => <IconButton iconProps={{ iconName: 'Stop' }} title="Stop" ariaLabel="Microphone" onClick={stopSpeechToText} />;


  
    return (
      <div>
            <button onClick={isRecording ? stopSpeechToText : startSpeechToText}>
    {isRecording ? 'Stop Recording' : 'Start Recording'}
  </button>
        {/* {isRecording ?<StopButton />: <MyMicButton/>} */}
        {results.map((result) => (
          <li key={result.timestamp}>{result.transcript}</li>
        ))}
        {interimResult && <li>{interimResult}</li>}
      </div>
    );
  };
  