import { QuestionType } from "../types";
import type { Choice, Question, QuestionTypeValue } from "../types";

// ─── JSON input shape (what the user pastes) ──────────────────────────────

interface RawChoice {
  text?: unknown;
  isCorrect?: unknown;
  imageUrl?: unknown;
}

interface RawQuestion {
  text?: unknown;
  type?: unknown;
  choices?: unknown;
  imageUrl?: unknown;
}

interface RawQuizJson {
  title?: unknown;
  description?: unknown;
  tags?: unknown;
  questions?: unknown;
}

// ─── Output types ─────────────────────────────────────────────────────────

export interface ParsedQuizJson {
  questions: Question[];
  title?: string;
  description?: string;
  tags?: string[];
}

export interface ParseJsonError {
  error: string;
}

export type ParseQuizJsonResult = ParsedQuizJson | ParseJsonError;

export const isParseError = (r: ParseQuizJsonResult): r is ParseJsonError =>
  "error" in r;

// ─── Type resolution ──────────────────────────────────────────────────────

const TYPE_STRING_MAP: Record<string, QuestionTypeValue> = {
  singlechoice: QuestionType.SingleChoice,
  multiplechoice: QuestionType.MultipleChoice,
  truefalse: QuestionType.TrueFalse,
  shortanswer: QuestionType.ShortAnswer,
};

function resolveType(raw: unknown): QuestionTypeValue | null {
  if (typeof raw === "number") {
    if (raw === 1 || raw === 2 || raw === 3 || raw === 4)
      return raw as QuestionTypeValue;
    return null;
  }
  if (typeof raw === "string") {
    const key = raw.toLowerCase().replace(/[^a-z]/g, "");
    return TYPE_STRING_MAP[key] ?? null;
  }
  return null;
}

// ─── Main parser ──────────────────────────────────────────────────────────

let _idCounter = 0;
const uid = () => `json-${Date.now()}-${_idCounter++}`;

export function parseQuizJson(raw: string): ParseQuizJsonResult {
  // ── 1. Parse JSON ────────────────────────────────────────────────
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Invalid JSON — please check your syntax and try again." };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {
      error: 'JSON must be an object with a "questions" array at the root.',
    };
  }

  const root = parsed as RawQuizJson;

  // ── 2. Validate questions array ──────────────────────────────────
  if (!Array.isArray(root.questions)) {
    return { error: 'Missing required field: "questions" must be an array.' };
  }

  if (root.questions.length === 0) {
    return { error: '"questions" array is empty — add at least one question.' };
  }

  if (root.questions.length > 100) {
    return {
      error: `Too many questions: ${root.questions.length} provided, maximum is 100.`,
    };
  }

  // ── 3. Parse each question ───────────────────────────────────────
  const questions: Question[] = [];

  for (let i = 0; i < root.questions.length; i++) {
    const qRaw = root.questions[i] as RawQuestion;
    const qNum = i + 1;

    if (typeof qRaw !== "object" || qRaw === null) {
      return { error: `Question ${qNum}: must be an object.` };
    }

    // text
    if (typeof qRaw.text !== "string" || !qRaw.text.trim()) {
      return {
        error: `Question ${qNum}: "text" is required and must be a non-empty string.`,
      };
    }
    if (qRaw.text.length > 1000) {
      return { error: `Question ${qNum}: "text" exceeds 1000 characters.` };
    }

    // type
    if (qRaw.type === undefined || qRaw.type === null) {
      return {
        error: `Question ${qNum}: "type" is required. Use 1 (SingleChoice), 2 (MultipleChoice), 3 (TrueFalse), or 4 (ShortAnswer).`,
      };
    }
    const qType = resolveType(qRaw.type);
    if (qType === null) {
      return {
        error: `Question ${qNum}: unrecognized type "${qRaw.type}". Valid values: 1 (SingleChoice), 2 (MultipleChoice), 3 (TrueFalse), 4 (ShortAnswer) — or their string names.`,
      };
    }

    // imageUrl
    const qImageUrl = typeof qRaw.imageUrl === "string" ? qRaw.imageUrl : null;

    // choices
    if (!Array.isArray(qRaw.choices)) {
      return { error: `Question ${qNum}: "choices" must be an array.` };
    }

    // ShortAnswer validation
    if (qType === QuestionType.ShortAnswer) {
      if (qRaw.choices.length === 0) {
        return {
          error: `Question ${qNum} (ShortAnswer): "choices" must have exactly 1 entry — the correct answer text.`,
        };
      }
      const answerRaw = qRaw.choices[0] as RawChoice;
      if (typeof answerRaw.text !== "string" || !answerRaw.text.trim()) {
        return {
          error: `Question ${qNum} (ShortAnswer): choices[0].text must be a non-empty string (the correct answer).`,
        };
      }

      const choices: Choice[] = [
        {
          id: uid(),
          text: answerRaw.text.trim(),
          imageUrl:
            typeof answerRaw.imageUrl === "string" ? answerRaw.imageUrl : null,
          isCorrect: true,
          uploadingImage: false,
        },
      ];

      questions.push({
        id: uid(),
        text: qRaw.text.trim(),
        imageUrl: qImageUrl,
        type: qType,
        choices,
        uploadingImage: false,
      });
      continue;
    }

    // TrueFalse validation
    if (qType === QuestionType.TrueFalse) {
      // Accept either an empty choices array (auto-build) or a 2-element array
      let trueIsCorrect = false;
      let falseIsCorrect = false;

      if (qRaw.choices.length === 0) {
        // No choices provided — require user to specify at least which is correct via a 2-element array
        return {
          error: `Question ${qNum} (TrueFalse): provide exactly 2 choices: [{ "text": "True", "isCorrect": true/false }, { "text": "False", "isCorrect": true/false }].`,
        };
      }

      if (qRaw.choices.length !== 2) {
        return {
          error: `Question ${qNum} (TrueFalse): must have exactly 2 choices.`,
        };
      }

      const cRaw0 = qRaw.choices[0] as RawChoice;
      const cRaw1 = qRaw.choices[1] as RawChoice;

      trueIsCorrect = cRaw0.isCorrect === true;
      falseIsCorrect = cRaw1.isCorrect === true;

      const correctCount = [trueIsCorrect, falseIsCorrect].filter(
        Boolean,
      ).length;
      if (correctCount !== 1) {
        return {
          error: `Question ${qNum} (TrueFalse): exactly 1 of the 2 choices must have "isCorrect": true.`,
        };
      }

      const choices: Choice[] = [
        {
          id: uid(),
          text: "True",
          imageUrl: null,
          isCorrect: trueIsCorrect,
          uploadingImage: false,
        },
        {
          id: uid(),
          text: "False",
          imageUrl: null,
          isCorrect: falseIsCorrect,
          uploadingImage: false,
        },
      ];

      questions.push({
        id: uid(),
        text: qRaw.text.trim(),
        imageUrl: qImageUrl,
        type: qType,
        choices,
        uploadingImage: false,
      });
      continue;
    }

    // SingleChoice / MultipleChoice validation
    if (qRaw.choices.length < 2) {
      return { error: `Question ${qNum}: at least 2 choices are required.` };
    }
    if (qRaw.choices.length > 10) {
      return {
        error: `Question ${qNum}: maximum 10 choices allowed (got ${qRaw.choices.length}).`,
      };
    }

    const choices: Choice[] = [];
    let correctCount = 0;

    for (let j = 0; j < qRaw.choices.length; j++) {
      const cRaw = qRaw.choices[j] as RawChoice;
      const cNum = j + 1;

      if (typeof cRaw !== "object" || cRaw === null) {
        return {
          error: `Question ${qNum}, Choice ${cNum}: must be an object.`,
        };
      }

      const cText = typeof cRaw.text === "string" ? cRaw.text.trim() : "";
      const cImageUrl =
        typeof cRaw.imageUrl === "string" ? cRaw.imageUrl : null;

      if (!cText && !cImageUrl) {
        return {
          error: `Question ${qNum}, Choice ${cNum}: either "text" or "imageUrl" is required.`,
        };
      }

      if (cText.length > 500) {
        return {
          error: `Question ${qNum}, Choice ${cNum}: "text" exceeds 500 characters.`,
        };
      }

      const isCorrect = cRaw.isCorrect === true;
      if (isCorrect) correctCount++;

      choices.push({
        id: uid(),
        text: cText,
        imageUrl: cImageUrl,
        isCorrect,
        uploadingImage: false,
      });
    }

    if (correctCount === 0) {
      return {
        error: `Question ${qNum}: at least one choice must have "isCorrect": true.`,
      };
    }

    if (qType === QuestionType.SingleChoice && correctCount > 1) {
      return {
        error: `Question ${qNum} (SingleChoice): only one choice can have "isCorrect": true.`,
      };
    }

    questions.push({
      id: uid(),
      text: qRaw.text.trim(),
      imageUrl: qImageUrl,
      type: qType,
      choices,
      uploadingImage: false,
    });
  }

  // ── 4. Extract optional root fields ─────────────────────────────
  const result: ParsedQuizJson = { questions };

  if (typeof root.title === "string" && root.title.trim()) {
    result.title = root.title.trim();
  }
  if (typeof root.description === "string" && root.description.trim()) {
    result.description = root.description.trim();
  }
  if (Array.isArray(root.tags)) {
    const tags = root.tags
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.trim().toLowerCase());
    if (tags.length > 0) result.tags = tags;
  }

  return result;
}
