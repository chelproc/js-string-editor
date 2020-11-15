import React, { useState } from "react";
import Editor from "@monaco-editor/react";

export function MonacoEditor(props: {
  language: string;
  value?: string;
  onChange?: (value: string) => void;
  minHeight?: number;
  enableLineNumbers?: boolean;
  disableTabKey?: boolean;
}) {
  const [editorHeight, setEditorHeight] = useState(0);
  return (
    <div
      onWheelCapture={(e) => e.stopPropagation()}
      onKeyDownCapture={(e) => {
        if (props.disableTabKey && e.key === "Tab") e.stopPropagation();
      }}
    >
      <Editor
        height={`${Math.max(editorHeight, props.minHeight ?? 0)}px`}
        theme="vs-dark"
        language={props.language}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: props.enableLineNumbers ? "on" : "off",
        }}
        value={props.value}
        editorDidMount={(_, editor) => {
          editor.onDidContentSizeChange((e) => {
            setEditorHeight(e.contentHeight);
            editor.layout();
          });
          editor.onDidChangeModelContent(() => {
            props.onChange?.(editor.getValue().replaceAll("\r\n", "\n"));
          });
        }}
      />
    </div>
  );
}
