import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  StrikeThroughSupSubToggles,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  UndoRedo,
  CodeToggle,
  InsertCodeBlock,
  InsertAdmonition,
  ChangeCodeMirrorLanguage,
  ConditionalContents,
  DiffSourceToggleWrapper,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  sandpackPlugin,
  type SandpackConfig,
  ShowSandpackInfo,
  InsertSandpack,
  Separator,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { forwardRef } from "react";
import { uploadFile } from "@/services/api/files";

interface RichTextEditorProps {
  /** Markdown content */
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

const defaultSandpackConfig: SandpackConfig = {
  defaultPreset: "react",
  presets: [
    {
      label: "React",
      name: "react",
      meta: "live",
      sandpackTemplate: "react",
      sandpackTheme: "light",
      snippetLanguage: "jsx",
      snippetFileName: "/App.js",
      initialSnippetContent:
        "export default function App() { return <h1>Hello</h1> }",
    },
  ],
};

const RichTextEditor = forwardRef<MDXEditorMethods, RichTextEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = "Nhập nội dung tại đây...",
      className = "",
      readOnly = false,
    },
    ref,
  ) => {
    return (
      <div className={`rich-text-editor-wrapper ${className}`}>
        <MDXEditor
          ref={ref}
          markdown={value ?? ""}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          contentEditableClassName="mdx-editor-content"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin({
              imageUploadHandler: (file: File) => uploadFile(file),
            }),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                js: "JavaScript",
                ts: "TypeScript",
                tsx: "TSX",
                jsx: "JSX",
                css: "CSS",
                html: "HTML",
                python: "Python",
                json: "JSON",
                sql: "SQL",
                bash: "Bash",
                markdown: "Markdown",
              },
            }),
            directivesPlugin({
              directiveDescriptors: [AdmonitionDirectiveDescriptor],
            }),
            diffSourcePlugin({ viewMode: "rich-text" }),
            frontmatterPlugin(),
            sandpackPlugin({ sandpackConfig: defaultSandpackConfig }),
            toolbarPlugin({
              toolbarContents: () => (
                <DiffSourceToggleWrapper>
                  <ConditionalContents
                    options={[
                      {
                        when: (editor) => editor?.editorType === "codeblock",
                        contents: () => <ChangeCodeMirrorLanguage />,
                      },
                      {
                        when: (editor) => editor?.editorType === "sandpack",
                        contents: () => <ShowSandpackInfo />,
                      },
                      {
                        fallback: () => (
                          <>
                            <UndoRedo />
                            <Separator />

                            <BoldItalicUnderlineToggles />
                            <CodeToggle />
                            <Separator />

                            <StrikeThroughSupSubToggles />
                            <Separator />

                            <ListsToggle
                              options={["bullet", "number", "check"]}
                            />
                            <Separator />

                            <BlockTypeSelect />
                            <Separator />

                            <CreateLink />
                            <InsertImage />
                            <Separator />

                            <InsertTable />
                            <InsertThematicBreak />
                            <Separator />

                            <InsertCodeBlock />
                            <InsertSandpack />
                            <InsertAdmonition />
                          </>
                        ),
                      },
                    ]}
                  />
                </DiffSourceToggleWrapper>
              ),
            }),
          ]}
        />
      </div>
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };
export type { RichTextEditorProps };
