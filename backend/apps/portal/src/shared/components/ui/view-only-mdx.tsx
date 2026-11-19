import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
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
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

interface ViewOnlyMDXProps {
  value: string;
  className?: string;
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

export function ViewOnlyMDX({ value, className = "" }: ViewOnlyMDXProps) {
  return (
    <div className={`rich-text-editor-wrapper view-only-mdx ${className}`}>
      <MDXEditor
        markdown={value}
        readOnly
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
            imageUploadHandler: async () => {
              return Promise.resolve("https://picsum.photos/800/400");
            },
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
        ]}
      />
    </div>
  );
}
