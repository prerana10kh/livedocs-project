// import React, { useState, useRef, useEffect } from 'react';
// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// const TextToSpeechButton = () => {
//   const [editor] = useLexicalComposerContext();
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   // State to hold the chosen voice for a female/lady sound
//   const [ladyVoice, setLadyVoice] = useState(null); 
//   const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
//   const synth = window.speechSynthesis;

  
//   const findLadyVoice = (voices:any) => {
    
//     const keywords = ['female', 'woman', 'zira', 'samantha', 'heidi', 'anna'];
    
   
//     const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));

//     for (const voice of englishVoices) {
//       const nameLower = voice.name.toLowerCase();
//       if (keywords.some(keyword => nameLower.includes(keyword))) {
//         return voice; // Found a good candidate!
//       }
//     }
    
    
//     const maleKeywords = ['male', 'man', 'david', 'alex', 'daniel', 'peter'];
    
//     for (const voice of englishVoices) {
//       const nameLower = voice.name.toLowerCase();
//       if (!maleKeywords.some(keyword => nameLower.includes(keyword))) {
//         return voice;
//       }
//     }

     
//     return voices.length > 0 ? voices[0] : null;
//   };

//   useEffect(() => {
//     if (!('speechSynthesis' in window)) return;
    
//     const loadVoices = () => {
//       const voices = synth.getVoices();
//       const selectedVoice = findLadyVoice(voices);
//       setLadyVoice(selectedVoice);
      
      
//       synth.removeEventListener('voiceschanged', loadVoices);
//     };

//     // Chrome and some browsers load voices asynchronously, so we listen for the event
//     if (synth.onvoiceschanged !== undefined) {
//       synth.addEventListener('voiceschanged', loadVoices);
//     }
    
    
//     loadVoices();
    
//     // Cleanup listener on unmount
//     return () => {
//         if (synth.onvoiceschanged !== undefined) {
//             synth.removeEventListener('voiceschanged', loadVoices);
//         }
//     };
//   }, [synth]); // Depend on synth, which is constant here

//   // Handle single click (toggle speak/pause/resume)
//   const handleClick = () => {
//     if (!('speechSynthesis' in window)) {
//       alert('Text-to-Speech is not supported in this browser.');
//       return;
//     }

//     if (!isSpeaking && !isPaused) {
//       // --- Start speaking ---
//       editor.getEditorState().read(() => {
//         const root = editor.getRootElement();
//         if (!root) return;
//         const textToSpeak = root.innerText || '';
        
//         window.speechSynthesis.cancel();
//         const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
//         //slow down speed
//         utterance.rate = 0.9;

//         // --- Apply the Lady Voice ---
//         if (ladyVoice) {
//           utterance.voice = ladyVoice;
//         }

//         utterance.onstart = () => {
//           setIsSpeaking(true);
//           setIsPaused(false);
//         };
//         utterance.onend = () => {
//           setIsSpeaking(false);
//           setIsPaused(false);
//           utteranceRef.current = null;
//         };
//         utterance.onerror = (event) => {
//           console.error("Speech Synthesis Error:", event);
//           setIsSpeaking(false);
//           setIsPaused(false);
//           utteranceRef.current = null;
//         };
        
//         utteranceRef.current = utterance;
//         window.speechSynthesis.speak(utterance);
//       });
//     } else if (isSpeaking) {
//       // --- Pause speaking ---
//       window.speechSynthesis.pause();
//       setIsPaused(true);
//       setIsSpeaking(false);
//     } else if (isPaused) {
//       // --- Resume speaking ---
//       window.speechSynthesis.resume();
//       setIsPaused(false);
//       setIsSpeaking(true);
//     }
//   };

//   // Handle double click (stop/reset)
//   const handleDoubleClick = () => {
//     window.speechSynthesis.cancel();
//     setIsSpeaking(false);
//     setIsPaused(false);
//     utteranceRef.current = null;
//   };

//   // Determine button label dynamically
//   let label = 'Speak';
//   if (isSpeaking) label = 'Pause';
//   else if (isPaused) label = 'Resume';
  
//   // Optional: Add a visual indicator if a voice couldn't be found
//   const buttonColor = ladyVoice ? '#28a745' : '#ffc107'; // Green if voice found, Yellow if not

//   return (
//     <button
//       type="button"
//       onClick={handleClick}
//       onDoubleClick={handleDoubleClick}
//       className="toolbar-item spaced"
//       aria-label="Text to Speech"
//       title={ladyVoice ? "Click: Speak/Pause/Resume; Double-click: Stop" : "Voice not fully loaded or supported."}
//       style={{
//         color: '#ffffff',
//         fontWeight: 'bold',
//         padding: '8px 16px',
//         backgroundColor: buttonColor,
//         border: 'none',
//         borderRadius: '6px',
//         boxShadow: `0 2px 6px rgba(40, 167, 69, 0.4)`,
//         cursor: 'pointer',
//         transition: 'background-color 0.3s ease',
//         marginLeft: '8px',
//       }}
//       onMouseEnter={e => (e.currentTarget.style.backgroundColor = ladyVoice ? '#1e7e34' : '#e0a800')}
//       onMouseLeave={e => (e.currentTarget.style.backgroundColor = buttonColor)}
//       disabled={!('speechSynthesis' in window)}
//     >
//       {label}
//       {!ladyVoice && <span style={{ marginLeft: '4px' }}> (Finding Voice...)</span>}
//     </button>
//   );
// };

// export default TextToSpeechButton;



//2

// import React, { useState, useRef, useEffect } from 'react';
// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// const TextToSpeechButton = () => {
//   const [editor] = useLexicalComposerContext();
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [ladyVoice, setLadyVoice] = useState<SpeechSynthesisVoice | null>(null);
//   const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
//   const textRef = useRef<string>(''); // store text that is being spoken
//   const synth = window.speechSynthesis;

//   // --- helper: find "lady" voice ---
//   const findLadyVoice = (voices: SpeechSynthesisVoice[]) => {
//     const keywords = ['female', 'woman', 'zira', 'samantha', 'heidi', 'anna'];
//     const englishVoices = voices.filter((voice) => voice.lang.startsWith('en'));

//     for (const voice of englishVoices) {
//       const nameLower = voice.name.toLowerCase();
//       if (keywords.some((keyword) => nameLower.includes(keyword))) {
//         return voice;
//       }
//     }

//     const maleKeywords = ['male', 'man', 'david', 'alex', 'daniel', 'peter'];
//     for (const voice of englishVoices) {
//       const nameLower = voice.name.toLowerCase();
//       if (!maleKeywords.some((keyword) => nameLower.includes(keyword))) {
//         return voice;
//       }
//     }

//     return voices.length > 0 ? voices[0] : null;
//   };

//   // --- helper: map [start, end) text offsets to a DOM Range inside Lexical root ---
//   const getRangeForTextOffset = (
//     root: HTMLElement,
//     start: number,
//     end: number
//   ): Range | null => {
//     const range = document.createRange();
//     let currentOffset = 0;
//     const stack: Node[] = [root];

//     let startNode: Node | null = null;
//     let startOffsetInNode = 0;
//     let endNode: Node | null = null;
//     let endOffsetInNode = 0;

//     while (stack.length > 0 && (!endNode || !startNode)) {
//       const node = stack.pop() as Node;

//       if (node.nodeType === Node.TEXT_NODE) {
//         const text = node.textContent || '';
//         const textLength = text.length;

//         if (!startNode && currentOffset + textLength >= start) {
//           startNode = node;
//           startOffsetInNode = start - currentOffset;
//         }

//         if (!endNode && currentOffset + textLength >= end) {
//           endNode = node;
//           endOffsetInNode = end - currentOffset;
//         }

//         currentOffset += textLength;
//       } else {
//         const children = Array.from(node.childNodes);
//         // push in reverse so we traverse in DOM order
//         for (let i = children.length - 1; i >= 0; i--) {
//           stack.push(children[i]);
//         }
//       }
//     }

//     if (startNode && endNode) {
//       range.setStart(startNode, startOffsetInNode);
//       range.setEnd(endNode, endOffsetInNode);
//       return range;
//     }

//     return null;
//   };

//   // --- helper: highlight current word by charIndex from onboundary ---
//   const highlightCurrentWord = (charIndex: number) => {
//     const root = editor.getRootElement();
//     if (!root || !textRef.current) return;

//     const text = textRef.current;
//     if (charIndex < 0 || charIndex >= text.length) return;

//     // Expand charIndex to full word [start, end)
//     let start = charIndex;
//     let end = charIndex;

//     // move start backwards to previous whitespace
//     while (start > 0 && !/\s/.test(text[start - 1])) {
//       start--;
//     }
//     // move end forwards to next whitespace
//     while (end < text.length && !/\s/.test(text[end])) {
//       end++;
//     }

//     const range = getRangeForTextOffset(root, start, end);
//     if (!range) return;

//     const selection = window.getSelection();
//     if (!selection) return;
//     selection.removeAllRanges();
//     selection.addRange(range);
//   };

//   const clearHighlight = () => {
//     const selection = window.getSelection();
//     if (selection) {
//       selection.removeAllRanges();
//     }
//   };

//   // --- load voices once ---
//   useEffect(() => {
//     if (!('speechSynthesis' in window)) return;

//     const loadVoices = () => {
//       const voices = synth.getVoices();
//       const selectedVoice = findLadyVoice(voices);
//       setLadyVoice(selectedVoice);
//       synth.removeEventListener('voiceschanged', loadVoices);
//     };

//     if (synth.onvoiceschanged !== undefined) {
//       synth.addEventListener('voiceschanged', loadVoices);
//     }

//     loadVoices();

//     return () => {
//       if (synth.onvoiceschanged !== undefined) {
//         synth.removeEventListener('voiceschanged', loadVoices);
//       }
//     };
//   }, [synth]);

//   // --- main click handler ---
//   const handleClick = () => {
//     if (!('speechSynthesis' in window)) {
//       alert('Text-to-Speech is not supported in this browser.');
//       return;
//     }

//     if (!isSpeaking && !isPaused) {
//       // Start speaking
//       editor.getEditorState().read(() => {
//         const root = editor.getRootElement();
//         if (!root) return;
//         const textToSpeak = root.innerText || '';

//         textRef.current = textToSpeak; // store for highlighting

//         window.speechSynthesis.cancel();
//         clearHighlight();

//         const utterance = new SpeechSynthesisUtterance(textToSpeak);
//         utterance.rate = 0.9;

//         if (ladyVoice) {
//           utterance.voice = ladyVoice;
//         }

//         utterance.onstart = () => {
//           setIsSpeaking(true);
//           setIsPaused(false);
//         };

//         // 🔥 highlight logic here
//         utterance.onboundary = (event: SpeechSynthesisEvent) => {
//           // type can be 'word', 'sentence', etc.
//           if (event.name === 'word' || event.charIndex !== undefined) {
//             highlightCurrentWord(event.charIndex);
//           }
//         };

//         utterance.onend = () => {
//           setIsSpeaking(false);
//           setIsPaused(false);
//           utteranceRef.current = null;
//           clearHighlight();
//         };

//         utterance.onerror = (event) => {
//           console.error('Speech Synthesis Error:', event);
//           setIsSpeaking(false);
//           setIsPaused(false);
//           utteranceRef.current = null;
//           clearHighlight();
//         };

//         utteranceRef.current = utterance;
//         window.speechSynthesis.speak(utterance);
//       });
//     } else if (isSpeaking) {
//       // Pause
//       window.speechSynthesis.pause();
//       setIsPaused(true);
//       setIsSpeaking(false);
//     } else if (isPaused) {
//       // Resume
//       window.speechSynthesis.resume();
//       setIsPaused(false);
//       setIsSpeaking(true);
//     }
//   };

//   const handleDoubleClick = () => {
//     window.speechSynthesis.cancel();
//     setIsSpeaking(false);
//     setIsPaused(false);
//     utteranceRef.current = null;
//     clearHighlight();
//   };

//   let label = 'Speak';
//   if (isSpeaking) label = 'Pause';
//   else if (isPaused) label = 'Resume';

//   const buttonColor = ladyVoice ? '#28a745' : '#ffc107';

//   return (
//     <button
//       type="button"
//       onClick={handleClick}
//       onDoubleClick={handleDoubleClick}
//       className="toolbar-item spaced"
//       aria-label="Text to Speech"
//       title={
//         ladyVoice
//           ? 'Click: Speak/Pause/Resume; Double-click: Stop'
//           : 'Voice not fully loaded or supported.'
//       }
//       style={{
//         color: '#ffffff',
//         fontWeight: 'bold',
//         padding: '8px 16px',
//         backgroundColor: buttonColor,
//         border: 'none',
//         borderRadius: '6px',
//         boxShadow: `0 2px 6px rgba(40, 167, 69, 0.4)`,
//         cursor: 'pointer',
//         transition: 'background-color 0.3s ease',
//         marginLeft: '8px',
//       }}
//       onMouseEnter={(e) =>
//         (e.currentTarget.style.backgroundColor = ladyVoice
//           ? '#1e7e34'
//           : '#e0a800')
//       }
//       onMouseLeave={(e) =>
//         (e.currentTarget.style.backgroundColor = buttonColor)
//       }
//       disabled={!('speechSynthesis' in window)}
//     >
//       {label}
//       {!ladyVoice && <span style={{ marginLeft: '4px' }}> (Finding Voice...)</span>}
//     </button>
//   );
// };

// export default TextToSpeechButton;



//3
import React, { useState, useRef, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

type NodePosition = {
  node: Text;
  start: number;
  end: number;
};

type TextToSpeechButtonProps = {
  onReadingChange?: (isReading: boolean) => void;
};



const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ onReadingChange }) => {
  const [editor] = useLexicalComposerContext();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ladyVoice, setLadyVoice] = useState<SpeechSynthesisVoice | null>(null);


  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef<string>(''); // the exact text given to TTS
  const positionsRef = useRef<NodePosition[]>([]); // mapping text index -> DOM text nodes


   const setReading = (value: boolean) => {
    if (onReadingChange) onReadingChange(value);
  };


  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const findLadyVoice = (voices: SpeechSynthesisVoice[]) => {
    const keywords = ['female', 'woman', 'zira', 'samantha', 'heidi', 'anna'];
    const englishVoices = voices.filter((voice) => voice.lang.startsWith('en'));

    for (const voice of englishVoices) {
      const nameLower = voice.name.toLowerCase();
      if (keywords.some((keyword) => nameLower.includes(keyword))) {
        return voice;
      }
    }

    const maleKeywords = ['male', 'man', 'david', 'alex', 'daniel', 'peter'];
    for (const voice of englishVoices) {
      const nameLower = voice.name.toLowerCase();
      if (!maleKeywords.some((keyword) => nameLower.includes(keyword))) {
        return voice;
      }
    }

    return voices.length > 0 ? voices[0] : null;
  };

  // Build plain text + mapping from DOM
  const buildTextAndMapping = (root: HTMLElement) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let text = '';
    const positions: NodePosition[] = [];

    let currentNode: Node | null;
    while ((currentNode = walker.nextNode())) {
      const node = currentNode as Text;
      const nodeText = node.textContent || '';
      const start = text.length;
      const end = start + nodeText.length;
      text += nodeText;
      positions.push({ node, start, end });
    }

    textRef.current = text;
    positionsRef.current = positions;
    return text;
  };

  const findNodeOffset = (index: number) => {
    for (const pos of positionsRef.current) {
      if (index >= pos.start && index <= pos.end) {
        return {
          node: pos.node,
          offset: index - pos.start,
        };
      }
    }
    return null;
  };

  const highlightRange = (start: number, end: number) => {
    const root = editor.getRootElement();
    if (!root) return;
    if (start < 0 || end <= start) return;

    const startInfo = findNodeOffset(start);
    const endInfo = findNodeOffset(end);

    if (!startInfo || !endInfo) return;

    const range = document.createRange();
    range.setStart(startInfo.node, startInfo.offset);
    range.setEnd(endInfo.node, endInfo.offset);

    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const clearHighlight = () => {
    const selection = window.getSelection();
    if (selection) selection.removeAllRanges();
  };

  // Highlight current word based on charIndex from TTS
  const highlightCurrentWord = (charIndex: number) => {
    const text = textRef.current;
    if (!text || charIndex < 0 || charIndex >= text.length) return;

    let start = charIndex;
    let end = charIndex;

    // Move start backwards to whitespace
    while (start > 0 && !/\s/.test(text[start - 1])) {
      start--;
    }
    // Move end forward to whitespace
    while (end < text.length && !/\s/.test(text[end])) {
      end++;
    }

    highlightRange(start, end);
  };

  useEffect(() => {
    if (!synth) return;

    const loadVoices = () => {
      const voices = synth.getVoices();
      const selectedVoice = findLadyVoice(voices);
      setLadyVoice(selectedVoice);
      synth.removeEventListener('voiceschanged', loadVoices);
    };

    if (synth.onvoiceschanged !== undefined) {
      synth.addEventListener('voiceschanged', loadVoices);
    }

    loadVoices();

    return () => {
      if (synth.onvoiceschanged !== undefined) {
        synth.removeEventListener('voiceschanged', loadVoices);
      }
    };
  }, [synth]);

  const handleClick = () => {
    if (!synth || !('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (!isSpeaking && !isPaused) {
      // Start speaking
      editor.getEditorState().read(() => {
        const root = editor.getRootElement();
        if (!root) return;

        // Build text & mapping from DOM text nodes
        const plainText = buildTextAndMapping(root);
        if (!plainText.trim()) return;

        window.speechSynthesis.cancel();
        clearHighlight();

        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.rate = 0.9;

        if (ladyVoice) {
          utterance.voice = ladyVoice;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsPaused(false);
           setReading(true);
        };

        utterance.onboundary = (event: SpeechSynthesisEvent) => {
          // event.charIndex is the index into utterance.text (plainText)
          if (typeof event.charIndex === 'number') {
            highlightCurrentWord(event.charIndex);
          }
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          utteranceRef.current = null;
          clearHighlight();
           setReading(false); 
        };

        utterance.onerror = (event) => {
          console.error('Speech Synthesis Error:', event);
          setIsSpeaking(false);
          setIsPaused(false);
          utteranceRef.current = null;
          clearHighlight();
          setReading(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      });
    } else if (isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  };

  const handleDoubleClick = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
    clearHighlight();
    setReading(false);
  };

  let label = 'Speak';
  if (isSpeaking) label = 'Pause';
  else if (isPaused) label = 'Resume';

  const buttonColor = ladyVoice ? '#28a745' : '#ffc107';

  return (
    <button
      type="button"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className="toolbar-item spaced"
      aria-label="Text to Speech"
      title={
        ladyVoice
          ? 'Click: Speak/Pause/Resume; Double-click: Stop'
          : 'Voice not fully loaded or supported.'
      }
      style={{
        color: '#ffffff',
        fontWeight: 'bold',
        padding: '8px 16px',
        backgroundColor: buttonColor,
        border: 'none',
        borderRadius: '6px',
        boxShadow: `0 2px 6px rgba(40, 167, 69, 0.4)`,
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginLeft: '8px',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = ladyVoice
          ? '#1e7e34'
          : '#e0a800')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = buttonColor)
      }
      disabled={!('speechSynthesis' in window)}
    >
      {label}
      {!ladyVoice && <span style={{ marginLeft: '4px' }}> (Finding Voice...)</span>}
    </button>
  );
};

export default TextToSpeechButton;








