/**
 * Word-level diff between two prompts, using a longest-common-subsequence
 * over word, punctuation and whitespace tokens (prompts are short, so
 * O(n·m) is fine). Adjacent changes separated only by whitespace are merged
 * into one phrase, so "soft window" -> "golden hour" reads as one edit
 * rather than two interleaved ones.
 *
 * diffWords("soft window light", "golden hour light")
 * -> [{ type: "removed", text: "soft window" },
 *     { type: "added", text: "golden hour" },
 *     { type: "same", text: " light" }]
 *
 * Joining every part except "removed" always reproduces `after` exactly.
 */
export function diffWords(before, after) {
  return groupChanges(tokenDiff(tokenize(before), tokenize(after)));
}

function tokenize(text) {
  return text.match(/\s+|[\p{L}\p{N}'’-]+|[^\s\p{L}\p{N}]/gu) ?? [];
}

const isWhitespace = (text) => /^\s+$/.test(text);

/** One op per token: "same" | "removed" | "added". */
function tokenDiff(a, b) {
  // lcs[i][j] = length of the LCS of a[i..] and b[j..]
  const lcs = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ type: "removed", text: a[i++] });
    } else {
      ops.push({ type: "added", text: b[j++] });
    }
  }
  while (i < a.length) ops.push({ type: "removed", text: a[i++] });
  while (j < b.length) ops.push({ type: "added", text: b[j++] });
  return ops;
}

function groupChanges(ops) {
  const parts = [];
  const push = (type, text) => {
    if (!text) return;
    const last = parts.at(-1);
    if (last?.type === type) last.text += text;
    else parts.push({ type, text });
  };

  let removed = "";
  let added = "";
  const flush = () => {
    push("removed", removed);
    // Whitespace-only "added" was shared whitespace: keep it as unchanged.
    push(isWhitespace(added) ? "same" : "added", added);
    removed = "";
    added = "";
  };
  const nextIsChange = (index) => {
    const next = ops.slice(index + 1).find((op) => !(op.type === "same" && isWhitespace(op.text)));
    return next !== undefined && next.type !== "same";
  };

  ops.forEach((op, index) => {
    const inRun = removed || added;
    if (op.type === "removed") removed += op.text;
    else if (op.type === "added") added += op.text;
    else if (inRun && isWhitespace(op.text) && nextIsChange(index)) {
      // Bridge whitespace between two changes. It exists in `after`, so it
      // always joins `added` (keeping the output exact); `removed` only
      // gets it to read naturally.
      added += op.text;
      if (removed) removed += op.text;
    } else {
      flush();
      push("same", op.text);
    }
  });
  flush();

  return parts;
}

/** Trims edge punctuation and spaces: ", golden hour light," -> "golden hour light". */
function clean(text) {
  return text.replace(/^[\s,.;:]+|[\s,.;:]+$/g, "");
}

/** The added and removed phrases between two prompts, ready to display. */
export function summarizeDiff(before, after) {
  const parts = diffWords(before, after);
  const pick = (type) =>
    parts.filter((part) => part.type === type).map((part) => clean(part.text)).filter(Boolean);
  return { added: pick("added"), removed: pick("removed") };
}
