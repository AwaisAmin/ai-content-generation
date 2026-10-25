# Fomi Studio — Product Thinking

**Workspace redesigned:** Image Generation
**Live:** [ai-content-generation-xi.vercel.app/studio](https://ai-content-generation-xi.vercel.app/studio)

Fomi Studio treats image generation like version control. Every result is a
version with a parent, the operation that produced it, and a visible diff.
You explore by **branching**, not by scrolling.

---

## 1. What problem were you trying to solve?

Professional creators don't generate once. They iterate dozens of times
towards a brief, usually with a client or art director in the loop. Today's
generators show that work as one long chronological feed, so:

- **Causality is lost.** Which change in the prompt made the light better?
  The feed can't tell you, because every result is just "newer".
- **Going back is costly.** Returning to a promising direction from
  yesterday means scrolling, then copying and pasting the old prompt.
- **Results feel random.** Changing words also changes the seed, so you
  can't tell if the improvement came from your edit or from luck.
- **Decisions aren't recorded.** Why was a version chosen, and what did the
  client say? That lives in someone's head or in Slack.

**Who it's for:** a professional — designer, art director, agency creative —
who spends hours a day in the tool, returns to ongoing projects, and has to
explain their choices to someone else.

## 2. What are the three most important UX decisions you made?

**1. Versions form a tree, not a feed.**
Each version records its parent and how it was made, and the tree in the
sidebar shows the whole exploration at a glance, with one-line summaries such
as "+ golden hour, warm autumn tones". Returning users see exactly where they
left off, which branches they abandoned, and which they starred, with a note
explaining why. _Why:_ a creative process naturally branches, and a linear
feed throws that structure away.

**2. Three explicit operations with predictable rules.**
- **Vary** — same prompt and settings, new seed: explore alternatives.
- **Refine** — edit the prompt, **keep the seed**: only your words change
  the image.
- **Remix** — change style, model or ratio with a new seed.

_Why:_ separating "try again" from "change what I asked for" makes iterating
deliberate instead of a slot machine. Keeping the seed on Refine is the key
detail: it isolates the effect of the words you changed.

**3. Show the diff everywhere.**
- The composer shows a **live diff before you generate**, so you see what you
  are about to change before spending a credit.
- The tree summarises each version's change in one line.
- The inspector highlights the prompt diff and any changed settings.
- **Compare** puts two versions side by side, or under a reveal slider, with
  the prompt and settings differences listed below.

_Why:_ seeing cause next to effect is how professionals build intuition about
prompts.

Supporting these: a **keyboard-first flow** (J/K to move, V/R/X to branch,
C to compare, S to select, ? for help), and drawers on tablet and mobile so
the same model works on any screen.

## 3. Which features did you intentionally leave out?

| Left out | Why |
| --- | --- |
| A community / inspiration feed in the workspace | It competes for attention with the user's own work. Inspiration has its place (Gallery); the workspace is for producing. |
| A one-click "enhance my prompt" button | It rewrites the prompt invisibly, which breaks the core promise that you can see exactly what changed. It could return later as a suggestion shown as a diff. |
| A free-form node canvas | Powerful, but heavy to learn and maintain. A tree covers most real iteration with far less complexity. |
| A chat interface | Conversation loses structure: you can't branch from message 7 and compare it with message 12. |
| Collaboration, comments and sharing | Important for agencies, but it multiplies scope. Notes and selects cover the solo workflow first. |
| Credits, billing and model marketplaces | Not part of the core creative loop being tested here. |

## 4. Which existing products inspired your thinking?

| Product | What I liked | What I'd improve |
| --- | --- | --- |
| **Git / GitHub** | Commits, branches and diffs make history understandable. | Too abstract for visual work, so I kept the ideas (parent, operation, diff) and dropped the jargon. |
| **Cursor** | The inline composer, diffs before applying changes, and a keyboard-first flow. | Its diffs are text-only. For images, the words need to sit next to the pictures they produced, which is what Compare does. |
| **Figma** | Version history and a calm, panel-based workspace. | Its history is linear and built for recovery rather than exploration. |
| **Lightroom** | Picks and stars, compare/survey views, and virtual copies. | Copies don't record *why* they differ. |
| **Midjourney / Higgsfield** | Fast Vary/Upscale actions on every result. | Lineage disappears into the feed after a few rounds. |
| **Krea** | Real-time feedback while you type. | No structure for the history behind a result. |

## 5. If you had another month, what would you improve?

1. **Real model semantics:** true seed-locked Refine and image-to-image
   refinement of a masked region ("refine just the hair").
2. **Merging branches:** combine the lighting of v3 with the styling of v5,
   shown as a three-way diff.
3. **Scale:** collapsible subtrees, search and a minimap for projects with
   hundreds of versions, plus a virtualised tree.
4. **Review workflow:** share a read-only branch link, let clients comment on
   a version, and export selects to Assets.
5. **Persistence and safety:** a real database, undo, and archiving abandoned
   branches.
6. **Quality:** unit tests for the diff and tree logic, Playwright end-to-end
   tests for branching and compare, and usability sessions with working
   designers.

## 6. What single feature or workflow differentiates your workspace?

**Prompt lineage with diffs.** You can branch from any version with a
predictable operation and see exactly what changed: live before you generate,
and side by side afterwards. Other tools show you results. Fomi Studio shows
you **why** a result is better, which turns prompting into a craft you can
learn, repeat and explain to a client.

---

## Trade-offs

- **Prioritised:** the core loop of select → branch → compare → select, and
  making it fast from the keyboard.
- **Simplified:** an indented tree instead of a free-form graph; one project;
  a mocked backend that picks images by prompt keywords.
- **Removed:** chat, a canvas, an inspiration feed and prompt auto-enhance.
  Each one added surface area without strengthening the core idea.
