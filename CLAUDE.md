# ARC

ARC is a free learning app for finance, investing, banking and business at MBA depth, built for women without business backgrounds. It is a single static page (`index.html`) hosted on Vercel at https://arclearn-beta.vercel.app, deployed automatically from `main`.

## Live content

Daily content lives in two JSON files that `index.html` loads at startup. Never edit lessons or signals inside `index.html` for daily updates; add to these files.

### `content/signals.json`
An array, newest first. Each signal:

```json
{
  "id": "YYYY-MM-DD-short-slug",
  "date": "YYYY-MM-DD",
  "kind": "Signal",
  "m": "wealth | business | economy | world | future | legacy | create",
  "title": "One plain sentence, max 12 words",
  "stat": "One striking number from a source, e.g. 5.22%",
  "statLabel": "What the number is and its date",
  "body": "3-4 sentences: what happened and how it works, with sourced numbers",
  "why": "2-3 sentences: what it means for the reader's money or business",
  "lessons": ["ids of existing or newly added lessons"],
  "sources": [{"name": "Publisher, date", "url": "https://..."}]
}
```

### `content/lessons.json`
An array of lessons in the five-layer format. `layers` has exactly 5 items: What, How, Why, The lesson (strings), then an array of 2-4 questions to ask.

```json
{
  "id": "unique-slug (must not exist in index.html or this file)",
  "m": "mission id as above",
  "mod": "module name, existing or new",
  "title": "Lesson title",
  "added": "YYYY-MM-DD",
  "layers": ["What", "How", "Why", "The lesson", ["Question 1", "Question 2"]],
  "sources": [{"name": "...", "url": "..."}]
}
```

## Rules for content
- Every number and current fact comes from a page that was opened and read, and is cited in `sources`. Never invent figures.
- Teach how to evaluate. Never tell the reader to buy or sell a specific investment.
- Plain, direct sentences. No meta explanations of the app itself.
- Never repeat a topic already covered: check existing titles in `index.html` (`add('id',...)` calls) and both JSON files first.
- Validate both files with `python3 -c "import json;json.load(open('content/signals.json'));json.load(open('content/lessons.json'))"` before committing.

## Design
Typography: EB Garamond (headlines), DM Sans (body, UI), Manrope (stats, labels, callouts). Dark glowing glass cards on a faint grid.
