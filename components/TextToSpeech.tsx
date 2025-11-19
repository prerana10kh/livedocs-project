// import React from 'react';
// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// const TextToSpeechButton = () => {
//   const [editor] = useLexicalComposerContext();

//   const handleSpeak = () => {
//     editor.getEditorState().read(() => {
//       const root = editor.getRootElement();
//       if (!root) return;
//       const textToSpeak = root.innerText || '';

//       if ('speechSynthesis' in window) {
//         window.speechSynthesis.cancel(); // Cancel any ongoing speech
//         const utterance = new SpeechSynthesisUtterance(textToSpeak);
//         window.speechSynthesis.speak(utterance);
//       } else {
//         alert('Text-to-Speech is not supported in this browser.');
//       }
//     });
//   };

//   return (
//     <button
//       type="button"
//       onClick={handleSpeak}
//       className="toolbar-item spaced"
//       aria-label="Text to Speech"
//       title="Read Document Aloud"
//       style={{
//         color: '#ffffff',
//         fontWeight: 'bold',
//         padding: '8px 16px',
//         backgroundColor: '#28a745',
//         border: 'none',
//         borderRadius: '6px',
//         boxShadow: '0 2px 6px rgba(40, 167, 69, 0.4)',
//         cursor: 'pointer',
//         transition: 'background-color 0.3s ease',
//         marginLeft: '8px',
//       }}
//       onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e7e34')}
//       onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#28a745')}
//     >
//       Speak
//     </button>
//   );
// };

// export default TextToSpeechButton;







import React, { useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

const TextToSpeechButton = () => {
  const [editor] = useLexicalComposerContext();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Handle single click (toggle speak/pause/resume)
  const handleClick = () => {
    if (!isSpeaking && !isPaused) {
      // Start speaking
      editor.getEditorState().read(() => {
        const root = editor.getRootElement();
        if (!root) return;
        const textToSpeak = root.innerText || '';
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
          };
          utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            utteranceRef.current = null;
          };
          utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            utteranceRef.current = null;
          };
          utteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);
        } else {
          alert('Text-to-Speech is not supported in this browser.');
        }
      });
    } else if (isSpeaking) {
      // Pause speaking
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    } else if (isPaused) {
      // Resume speaking
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  };

  // Handle double click (stop/reset)
  const handleDoubleClick = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

  // Determine button label dynamically
  let label = 'Speak';
  if (isSpeaking) label = 'Pause';
  else if (isPaused) label = 'Resume';

  return (
    <button
      type="button"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className="toolbar-item spaced"
      aria-label="Text to Speech"
      title="Click: Speak/Pause/Resume; Double-click: Stop"
      style={{
        color: '#ffffff',
        fontWeight: 'bold',
        padding: '8px 16px',
        backgroundColor: '#28a745',
        border: 'none',
        borderRadius: '6px',
        boxShadow: '0 2px 6px rgba(40, 167, 69, 0.4)',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginLeft: '8px',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e7e34')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#28a745')}
    >
      {label}
    </button>
  );
};

export default TextToSpeechButton;



