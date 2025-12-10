"use client";

import { useState } from "react";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { useThreads } from "@liveblocks/react/suspense";
import {
  liveblocksConfig,
  LiveblocksPlugin,
  FloatingComposer,
  useEditorStatus,
  FloatingThreads,
} from "@liveblocks/react-lexical";

import { Loader } from "@/components/Loader";

import FloatingToolbarPlugin from "./plugins/FloatingToolbarPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import Theme from "./Theme";
import { Comments } from "../Comments";
import { DeleteModal } from "../DeleteModal";
import { SaveModal } from "../SaveModal";

function Placeholder() {
  return <div className="editor-placeholder">Start writing here...</div>;
}

export function Editor({
  roomId,
  currentUserType,
  creatorId,
  email,
  title,
}: {
  roomId: string;
  currentUserType: UserType;
  creatorId: string;
  email: string;
  title: string;
}) {
  const status = useEditorStatus();
  const { threads } = useThreads();

  const initialConfig = liveblocksConfig({
    namespace: "Editor",
    nodes: [HeadingNode],
    onError: (error: unknown) => {
      console.error(error);
      throw error;
    },
    theme: Theme,
    editable: currentUserType === "editor",
  });

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container size-full">
        <div className="toolbar-wrapper flex min-w-full justify-between">
          <ToolbarPlugin />
          {currentUserType === "editor" && (
            <div className="flex items-center gap-0">
              <SaveModal
                roomId={roomId}
                title={title}
                creatorId={creatorId}
                email={email}
                content="Saved from editor"
              />
              <DeleteModal roomId={roomId} />
            </div>
          )}
        </div>

        <div className="editor-wrapper flex flex-col items-center justify-start">
          {status === "not-loaded" || status === "loading" ? (
            <Loader />
          ) : (
            <div className="editor-inner relative mb-5 h-fit min-h-[1100px] w-full max-w-[800px] shadow-md lg:mb-10">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="editor-input h-full " />
                }
                placeholder={<Placeholder />}
                ErrorBoundary={LexicalErrorBoundary}
              />

              {currentUserType === "editor" && <FloatingToolbarPlugin />}

              <HistoryPlugin />
              <AutoFocusPlugin />
            </div>
          )}
          <LiveblocksPlugin>
            <FloatingComposer className="w-[350px]" />
            <Comments />
            <FloatingThreads threads={threads} className="top-20 block" />
          </LiveblocksPlugin>
        </div>
      </div>
    </LexicalComposer>
  );
}
