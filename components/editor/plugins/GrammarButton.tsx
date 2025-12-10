// 'use client';

// import { useState } from 'react';
// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
// import { $getSelection, $isRangeSelection } from 'lexical';

// const GrammarButton = () => {
//   const [editor] = useLexicalComposerContext();
//   const [loading, setLoading] = useState(false);

//   const handleClick = async () => {
//     if (loading) return;

//     let selectedText = '';

//     // 1️⃣ Get selected text from Lexical
//     editor.getEditorState().read(() => {
//       const selection = $getSelection();
//       if ($isRangeSelection(selection) && !selection.isCollapsed()) {
//         selectedText = selection.getTextContent();
//       }
//     });

//     if (!selectedText.trim()) {
//       alert('Please select some text first.');
//       return;
//     }

//     setLoading(true);

//     try {
//       // 2️⃣ Send selected text to your AI endpoint
//       const res = await fetch('/api/openai/grammar', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: selectedText }),
//       });

//       if (!res.ok) {
//         console.error('Grammar API error', await res.text());
//         alert('Error checking grammar.');
//         return;
//       }

//       const data = (await res.json()) as { improvedText: string };

//       // 3️⃣ Optionally copy to clipboard
//       try {
//         await navigator.clipboard.writeText(data.improvedText);
//       } catch (e) {
//         // ignore if clipboard fails
//       }

//       // 4️⃣ Show result in a simple prompt so user can copy–paste
//       window.prompt(
//         'Improved text (also copied to clipboard if allowed):',
//         data.improvedText,
//       );
//     } catch (err) {
//       console.error('Grammar request failed', err);
//       alert('Something went wrong.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button
//       type="button"
//       onClick={handleClick}
//       className="toolbar-item spaced text-white bg-green-800"
//       disabled={loading}
//       title="Check grammar of selected text"
//     >
//       {loading ? 'Checking…' : 'Check Grammar'}
//     </button>
//   );
// };

// export default GrammarButton;



'use client';

import { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';

const GrammarButton = () => {
  const [editor] = useLexicalComposerContext();

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [improvedText, setImprovedText] = useState('');

  const handleClick = async () => {
    if (loading) return;

    let selectedText = '';

    // 1️⃣ Get selected text
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        selectedText = selection.getTextContent();
      }
    });

    if (!selectedText.trim()) {
      alert('Please select some text first.');
      return;
    }

    setLoading(true);

    try {
      // 2️⃣ Call grammar API
      const res = await fetch('/api/openai/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText }),
      });

      if (!res.ok) {
        console.error('Grammar API error', await res.text());
        alert('Error checking grammar. Please try again.');
        return;
      }

      const data = (await res.json()) as { improvedText: string };

      setOriginalText(selectedText);
      setImprovedText(data.improvedText || '');
      setIsOpen(true);

      // optional auto-copy
      try {
        await navigator.clipboard.writeText(data.improvedText);
      } catch {
        // ignore clipboard failure
      }
    } catch (err) {
      console.error('Grammar request failed', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(improvedText);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Toolbar button */}
      <button
  type="button"
  onClick={handleClick}
  className="toolbar-item spaced"
  aria-label="Check Grammar"
  title="Improve grammar & tone of selected text"
  style={{
    color: "#ffffff",
    fontWeight: "bold",
    padding: "8px 16px",
    backgroundColor: "#6f42c1", // Purple (distinct, elegant)
    border: "none",
    borderRadius: "6px",
    boxShadow: "0 2px 6px rgba(111, 66, 193, 0.4)", // Purple shadow
    cursor: loading ? "not-allowed" : "pointer",
    transition: "background-color 0.3s ease",
    marginLeft: "8px",
  }}
  disabled={loading}
  onMouseEnter={(e) => {
    if (!loading) e.currentTarget.style.backgroundColor = "#59329b"; // darker purple
  }}
  onMouseLeave={(e) => {
    if (!loading) e.currentTarget.style.backgroundColor = "#6f42c1"; // original
  }}
>
  {loading ? "Checking…" : "Check Grammar"}
</button>


      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog */}
          <div className="relative z-50 w-full max-w-xl rounded-lg bg-white shadow-xl border border-gray-200 p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-semibold text-gray-800">
                AI Grammar & Tone Suggestion
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Original
                </p>
                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 whitespace-pre-wrap">
                  {originalText}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Improved (AI suggestion)
                </p>
                <div className="rounded-md border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-gray-800 whitespace-pre-wrap">
                  {improvedText}
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  You can copy this and paste it back into the document.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs md:text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-md text-xs md:text-sm bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Copy suggestion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GrammarButton;
