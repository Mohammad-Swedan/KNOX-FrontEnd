import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileJson2,
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { parseQuizJson, isParseError } from "../utils/parseQuizJson";
import type { Question } from "../types";

// ─── Sample JSON template ─────────────────────────────────────────────────

const SAMPLE_JSON = JSON.stringify(
  {
    title: "My Quiz Title",
    description: "Optional description",
    tags: ["math", "algebra"],
    questions: [
      {
        text: "What is 2 + 2?",
        type: 1,
        choices: [
          { text: "3", isCorrect: false },
          { text: "4", isCorrect: true },
          { text: "5", isCorrect: false },
        ],
      },
      {
        text: "Select all prime numbers.",
        type: 2,
        choices: [
          { text: "2", isCorrect: true },
          { text: "3", isCorrect: true },
          { text: "4", isCorrect: false },
          { text: "5", isCorrect: true },
        ],
      },
      {
        text: "The Earth orbits the Sun.",
        type: 3,
        choices: [
          { text: "True", isCorrect: true },
          { text: "False", isCorrect: false },
        ],
      },
      {
        text: "What is the capital of France?",
        type: 4,
        choices: [{ text: "Paris", isCorrect: true }],
      },
    ],
  },
  null,
  2,
);

// ─── Props ────────────────────────────────────────────────────────────────

interface JsonQuizImporterProps {
  hasExistingQuestions: boolean;
  onImport: (data: {
    questions: Question[];
    title?: string;
    description?: string;
    tags?: string[];
  }) => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function JsonQuizImporter({
  hasExistingQuestions,
  onImport,
}: JsonQuizImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    questions: Question[];
    title?: string;
    description?: string;
    tags?: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────

  const handleLoadJson = () => {
    setParseError(null);
    setParseSuccess(null);

    if (!jsonText.trim()) {
      setParseError("Please paste your JSON first.");
      return;
    }

    setIsParsing(true);

    // Use setTimeout to allow React to re-render loading state
    setTimeout(() => {
      const result = parseQuizJson(jsonText);
      setIsParsing(false);

      if (isParseError(result)) {
        setParseError(result.error);
        return;
      }

      const importData = {
        questions: result.questions,
        ...(result.title ? { title: result.title } : {}),
        ...(result.description ? { description: result.description } : {}),
        ...(result.tags ? { tags: result.tags } : {}),
      };

      if (hasExistingQuestions) {
        // Ask for confirmation before replacing
        setPendingImport(importData);
        setConfirmOpen(true);
      } else {
        applyImport(importData);
      }
    }, 0);
  };

  const applyImport = (data: {
    questions: Question[];
    title?: string;
    description?: string;
    tags?: string[];
  }) => {
    onImport(data);
    setParseSuccess(
      `Successfully imported ${data.questions.length} question${data.questions.length !== 1 ? "s" : ""}.${
        data.title ? ` Quiz title set to "${data.title}".` : ""
      }`,
    );
    setParseError(null);
    setJsonText("");
  };

  const handleConfirmImport = () => {
    if (pendingImport) {
      applyImport(pendingImport);
      setPendingImport(null);
    }
    setConfirmOpen(false);
  };

  const handleShowExample = () => {
    setJsonText(SAMPLE_JSON);
    setParseError(null);
    setParseSuccess(null);
  };

  const handleCopySample = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_JSON);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setJsonText(SAMPLE_JSON);
    }
  };

  const AI_PROMPT = `Generate a quiz in the following JSON format.

IMPORTANT RULES:
- Always set "imageUrl" to null (images are not supported in JSON import).
- Use only these question types:
    type 1 = SingleChoice  — multiple options, exactly 1 correct answer
    type 2 = MultipleChoice — multiple options, 1 or more correct answers
    type 3 = TrueFalse      — exactly 2 choices ("True" and "False"), exactly 1 correct
    type 4 = ShortAnswer    — 1 choice only, which is the correct answer text
- Return ONLY valid JSON — no markdown code blocks, no explanation, no extra text.

JSON FORMAT:
${SAMPLE_JSON}

Now generate a quiz about: [REPLACE THIS WITH YOUR TOPIC]`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // silently ignore
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Collapsible trigger ──────────────────────────────────────── */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => {
            setIsOpen((v) => !v);
            setParseError(null);
            setParseSuccess(null);
          }}
          className="flex items-center gap-2 w-full text-left group"
        >
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-amber-400/60 dark:border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors w-full">
            <FileJson2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Advanced: Import from JSON
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-200/80 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Advanced
                </span>
              </div>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5 hidden sm:block">
                Paste a JSON object to bulk-import questions — for advanced
                users and programmatic quiz generation
              </p>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
          </div>
        </button>

        {/* ── Expanded panel ──────────────────────────────────────────── */}
        {isOpen && (
          <div className="mt-2 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-card p-5 space-y-4">
            {/* Info note */}
            <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-semibold">For advanced users</p>
                <p>
                  Paste a JSON object below to bulk-import questions. If any
                  value is present in the JSON (title, description, tags), it
                  will <strong>overwrite</strong> the current form values.
                  Existing questions will be <strong>replaced</strong>.
                </p>
              </div>
            </div>

            {/* Schema reference */}
            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground select-none flex items-center gap-1">
                <ChevronDown className="h-3 w-3 group-open:rotate-180 transition-transform" />
                View JSON schema &amp; type reference
              </summary>

              <div className="mt-3 space-y-3">
                {/* Type reference table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="px-3 py-1.5 bg-muted/60 border-b border-border">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Question types
                    </span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-3 py-1.5 text-left font-medium text-muted-foreground w-12">
                          type
                        </th>
                        <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">
                          Name
                        </th>
                        <th className="px-3 py-1.5 text-left font-medium text-muted-foreground hidden sm:table-cell">
                          Choices rule
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-3 py-1.5 font-mono font-bold text-primary">
                          1
                        </td>
                        <td className="px-3 py-1.5">Single Choice</td>
                        <td className="px-3 py-1.5 text-muted-foreground hidden sm:table-cell">
                          2–10 choices, exactly 1{" "}
                          <code className="bg-muted px-0.5 rounded">
                            isCorrect: true
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono font-bold text-primary">
                          2
                        </td>
                        <td className="px-3 py-1.5">Multiple Choice</td>
                        <td className="px-3 py-1.5 text-muted-foreground hidden sm:table-cell">
                          2–10 choices, 1 or more{" "}
                          <code className="bg-muted px-0.5 rounded">
                            isCorrect: true
                          </code>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono font-bold text-primary">
                          3
                        </td>
                        <td className="px-3 py-1.5">True / False</td>
                        <td className="px-3 py-1.5 text-muted-foreground hidden sm:table-cell">
                          Exactly 2 choices ("True", "False"), exactly 1 correct
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono font-bold text-primary">
                          4
                        </td>
                        <td className="px-3 py-1.5">Short Answer</td>
                        <td className="px-3 py-1.5 text-muted-foreground hidden sm:table-cell">
                          Exactly 1 choice — the correct answer text
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* imageUrl note */}
                <div className="flex gap-2 px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40 text-xs text-sky-800 dark:text-sky-300">
                  <span className="font-semibold shrink-0">imageUrl:</span>
                  <span>
                    Always set to{" "}
                    <code className="bg-sky-100 dark:bg-sky-900/40 px-1 rounded font-mono">
                      null
                    </code>{" "}
                    when generating JSON. If you want to add images to questions
                    or choices, do it <strong>after importing</strong> using the
                    visual editor.
                  </span>
                </div>

                {/* JSON example */}
                <div className="rounded-lg overflow-hidden border border-border">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b border-border">
                    <span className="text-xs font-mono text-muted-foreground">
                      example.json
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySample}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ClipboardCopy className="h-3 w-3" />
                      {copied ? "Copied!" : "Copy JSON"}
                    </button>
                  </div>
                  <pre className="text-xs p-3 bg-muted/30 overflow-x-auto text-foreground/80 leading-relaxed">{`{
  "title": "Quiz title (optional)",
  "description": "Optional description",
  "tags": ["tag1", "tag2"],
  "questions": [
    {
      "text": "What is 2 + 2?",
      "type": 1,
      "imageUrl": null,
      "choices": [
        { "text": "3", "isCorrect": false },
        { "text": "4", "isCorrect": true  },
        { "text": "5", "isCorrect": false }
      ]
    },
    {
      "text": "Select all prime numbers.",
      "type": 2,
      "imageUrl": null,
      "choices": [
        { "text": "2", "isCorrect": true  },
        { "text": "3", "isCorrect": true  },
        { "text": "4", "isCorrect": false },
        { "text": "5", "isCorrect": true  }
      ]
    },
    {
      "text": "The Earth orbits the Sun.",
      "type": 3,
      "imageUrl": null,
      "choices": [
        { "text": "True",  "isCorrect": true  },
        { "text": "False", "isCorrect": false }
      ]
    },
    {
      "text": "What is the capital of France?",
      "type": 4,
      "imageUrl": null,
      "choices": [
        { "text": "Paris", "isCorrect": true }
      ]
    }
  ]
}`}</pre>
                </div>

                {/* AI prompt copy */}
                <div className="rounded-lg overflow-hidden border border-border">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b border-border">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground">
                        Using AI to generate your quiz?
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      <ClipboardCopy className="h-3 w-3" />
                      {copiedPrompt ? "Prompt copied!" : "Copy AI prompt"}
                    </button>
                  </div>
                  <div className="px-3 py-2.5 bg-muted/20 text-xs text-muted-foreground space-y-1">
                    <p>
                      Copy the ready-made prompt above and paste it into
                      ChatGPT, Claude, or any AI assistant.
                    </p>
                    <p>
                      Replace <strong>[REPLACE THIS WITH YOUR TOPIC]</strong>{" "}
                      with your subject (e.g. <em>"Python basics"</em>,{" "}
                      <em>"World War II"</em>), then paste the AI's JSON output
                      directly into the textarea below.
                    </p>
                  </div>
                </div>
              </div>
            </details>

            {/* Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">
                  Paste JSON here
                </label>
                <button
                  type="button"
                  onClick={handleShowExample}
                  className="text-xs text-primary hover:underline"
                >
                  Insert example
                </button>
              </div>
              <Textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setParseError(null);
                  setParseSuccess(null);
                }}
                placeholder={`{\n  "questions": [\n    {\n      "text": "What is 2+2?",\n      "type": 1,\n      "choices": [\n        { "text": "3", "isCorrect": false },\n        { "text": "4", "isCorrect": true }\n      ]\n    }\n  ]\n}`}
                className="font-mono text-xs h-52 resize-y"
                spellCheck={false}
              />
            </div>

            {/* Parse error */}
            {parseError && (
              <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Parse success */}
            {parseSuccess && (
              <div className="flex gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 text-green-800 dark:text-green-300 text-xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{parseSuccess}</span>
              </div>
            )}

            {/* Action */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleLoadJson}
                disabled={isParsing || !jsonText.trim()}
                className="gap-2"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Parsing…
                  </>
                ) : (
                  <>
                    <FileJson2 className="h-4 w-4" />
                    Load from JSON
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirmation dialog ──────────────────────────────────────── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Replace existing questions?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will <strong>replace all current questions</strong> with the{" "}
              {pendingImport?.questions.length ?? 0} question
              {(pendingImport?.questions.length ?? 0) !== 1 ? "s" : ""} from
              your JSON.
              {pendingImport?.title && (
                <>
                  {" "}
                  The quiz title will also be updated to{" "}
                  <strong>"{pendingImport.title}"</strong>.
                </>
              )}{" "}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingImport(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmImport}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Yes, replace questions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
