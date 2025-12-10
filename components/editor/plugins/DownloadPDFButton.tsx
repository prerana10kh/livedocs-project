'use client';

import { useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

const DownloadPdfButton = () => {
  const [editor] = useLexicalComposerContext();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (typeof window === 'undefined') return;

      const original = document.querySelector('.editor-inner') as HTMLElement | null;
      if (!original) {
        alert('Editor content not found.');
        return;
      }

      // 🔹 Clone the editor content
      const clone = original.cloneNode(true) as HTMLElement;
      clone.style.backgroundColor = '#ffffff';
      clone.style.color = '#000000';
      clone.style.padding = '40px';
      clone.style.maxWidth = '800px';
      clone.style.margin = '0 auto';

      // make all children use black text & no dark backgrounds
      clone.querySelectorAll<HTMLElement>('*').forEach((el) => {
        el.style.backgroundColor = 'transparent';
        el.style.color = '#000000';
      });

      // put clone off-screen so user doesn't see it
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // dynamic import in browser
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule as any).default || html2pdfModule;

      const opt = {
        margin: 10,
        filename: 'livedocs-document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      // @ts-ignore
      await html2pdf().set(opt).from(clone).save();

      // cleanup
      document.body.removeChild(wrapper);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="toolbar-item spaced"
      aria-label="Download as PDF"
      title="Download document as PDF"
      style={{
        color: '#ffffff',
        fontWeight: 'bold',
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        border: 'none',
        borderRadius: '6px',
        boxShadow: '0 2px 6px rgba(220, 53, 69, 0.4)',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.3s ease',
        marginLeft: '8px',
      }}
      disabled={loading}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.backgroundColor = '#b02a37';
      }}
      onMouseLeave={(e) => {
        if (!loading) e.currentTarget.style.backgroundColor = '#dc3545';
      }}
    >
      {loading ? 'Downloading…' : 'Download PDF'}
    </button>
  );
};

export default DownloadPdfButton;
