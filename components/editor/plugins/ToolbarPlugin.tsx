/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from '@lexical/rich-text';
import TextToSpeechButton from '../../TextToSpeech';

import { $setBlocksType } from '@lexical/selection';
import { mergeRegister, $findMatchingParent } from '@lexical/utils';
import {
  $createParagraphNode,
  $isRootOrShadowRoot,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';



const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const activeBlock = useActiveBlock();

  // AI summarization states
  const [summaryText, setSummaryText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, $updateToolbar]);

  function toggleBlock(type: 'h1' | 'h2' | 'h3' | 'quote') {
    const selection = $getSelection();

    if (activeBlock === type) {
      return $setBlocksType(selection, () => $createParagraphNode());
    }
    if (type === 'h1') {
      return $setBlocksType(selection, () => $createHeadingNode('h1'));
    }
    if (type === 'h2') {
      return $setBlocksType(selection, () => $createHeadingNode('h2'));
    }
    if (type === 'h3') {
      return $setBlocksType(selection, () => $createHeadingNode('h3'));
    }
    if (type === 'quote') {
      return $setBlocksType(selection, () => $createQuoteNode());
    }
  }

  // Call backend API for AI summarization
  async function handleSummarize(textToSummarize: string) {
    setLoading(true);
    try {
      const response = await fetch('/api/openai/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: textToSummarize }),
});


      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();
      setSummaryText(data.summary || 'No summary generated');
      setShowSummary(true);
    } catch {
      setSummaryText('Failed to generate summary.');
      setShowSummary(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="toolbar" ref={toolbarRef}>
        <button
          disabled={!canUndo}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          className="toolbar-item spaced"
          aria-label="Undo"
        >
          <i className="format undo" />
        </button>
        <button
          disabled={!canRedo}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          className="toolbar-item"
          aria-label="Redo"
        >
          <i className="format redo" />
        </button>
        <Divider />
        <button
          onClick={() => editor.update(() => toggleBlock('h1'))}
          data-active={activeBlock === 'h1' ? '' : undefined}
          className={'toolbar-item spaced ' + (activeBlock === 'h1' ? 'active' : '')}
        >
          <i className="format h1" />
        </button>
        <button
          onClick={() => editor.update(() => toggleBlock('h2'))}
          data-active={activeBlock === 'h2' ? '' : undefined}
          className={'toolbar-item spaced ' + (activeBlock === 'h2' ? 'active' : '')}
        >
          <i className="format h2" />
        </button>
        <button
          onClick={() => editor.update(() => toggleBlock('h3'))}
          data-active={activeBlock === 'h3' ? '' : undefined}
          className={'toolbar-item spaced ' + (activeBlock === 'h3' ? 'active' : '')}
        >
          <i className="format h3" />
        </button>
        <Divider />
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
          aria-label="Format Bold"
        >
          <i className="format bold" />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
          aria-label="Format Italics"
        >
          <i className="format italic" />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
          aria-label="Format Underline"
        >
          <i className="format underline" />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
          className={'toolbar-item spaced ' + (isStrikethrough ? 'active' : '')}
          aria-label="Format Strikethrough"
        >
          <i className="format strikethrough" />
        </button>
        <Divider />
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
          className="toolbar-item spaced"
          aria-label="Left Align"
        >
          <i className="format left-align" />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
          className="toolbar-item spaced"
          aria-label="Center Align"
        >
          <i className="format center-align" />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
          className="toolbar-item spaced"
          aria-label="Right Align"
        >
          <i className="format right-align" />
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
          className="toolbar-item"
          aria-label="Justify Align"
        >
          <i className="format justify-align" />
        </button>

        {/* Summarize Button */}
        <button
  type="button"
  onClick={() => {
    editor.getEditorState().read(() => {
      const root = editor.getRootElement();
      if (!root) return;
      const fullText = root.innerText || '';
      handleSummarize(fullText);
    });
  }}
  className="toolbar-item spaced"
  aria-label="Summarize Document"
  title="Summarize Document"
  style={{
    color: '#ffffff',
    fontWeight: 'bold',
    padding: '8px 16px',
    backgroundColor: '#007BFF',    // Blue background
    border: 'none',
    borderRadius: '6px',            // Rounded corners
    boxShadow: '0 2px 6px rgba(0, 123, 255, 0.4)', // Subtle shadow
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.3s ease',
  }}
  disabled={loading}
  onMouseEnter={e => {
    if (!loading) e.currentTarget.style.backgroundColor = '#0056b3'; // Darker blue on hover
  }}
  onMouseLeave={e => {
    if (!loading) e.currentTarget.style.backgroundColor = '#007BFF'; // Original blue
  }}
>
  {loading ? 'Summarizing...' : 'Summarize'}
</button>
  <TextToSpeechButton />


      </div>

      {/* Summary Modal */}
      {showSummary && (
        <div
          className="summary-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="summary-modal"
            style={{
              backgroundColor: '#121212',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '400px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
            }}
          >
            <h3 style={{ marginBottom: '10px' }}>Summary</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{summaryText}</p>
            <button
              type="button"
              onClick={() => setShowSummary(false)}
              style={{
                marginTop: '15px',
                padding: '8px 12px',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '4px',
                background: '#3371FF',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function useActiveBlock() {
  const [editor] = useLexicalComposerContext();

  const subscribe = useCallback((onStoreChange: () => void) => {
    return editor.registerUpdateListener(onStoreChange);
  }, [editor]);

  const getSnapshot = useCallback(() => {
    return editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return null;

      const anchor = selection.anchor.getNode();
      let element =
        anchor.getKey() === 'root'
          ? anchor
          : $findMatchingParent(anchor, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchor.getTopLevelElementOrThrow();
      }

      if ($isHeadingNode(element)) {
        return element.getTag();
      }
      return element.getType();
    });
  }, [editor]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}



