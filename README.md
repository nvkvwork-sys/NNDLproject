# Sentiment Analysis (DistilBERT) — GitHub Pages

A static, client-side web app that performs sentiment analysis (Positive / Negative / Neutral) entirely in the browser using DistilBERT via Transformers.js. Perfect for GitHub Pages — no backend servers required.

## Features
- DistilBERT (`Xenova/distilbert-base-uncased-finetuned-sst-2-english`) runs in the browser
- Neutral class inferred via adjustable thresholds
- Emoji + confidence formatting
- Examples and loading/error states
- Single-page app: `index.html`, `style.css`, `app.js`

## Local usage
Just open `index.html` in your browser. The first run downloads model weights from a CDN and caches them.

If your browser blocks local file access for some resources, use a simple local server, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## GitHub Pages deployment
1. Create a new GitHub repository and push these files.
2. Commit files at the repository root (or within a folder and set Pages source accordingly).
3. In GitHub: Settings → Pages → Build and deployment → Source: `Deploy from a branch`.
4. Select branch (e.g., `main`) and the root directory `/`.
5. Save. Wait for the site to go live at `https://<your-username>.github.io/<repo-name>/`.

If you use a project subdirectory, ensure the Pages source is set to that folder, or move the files to the repository root.

## Model and library
- Library: `@xenova/transformers`
- Model: `Xenova/distilbert-base-uncased-finetuned-sst-2-english`

The app loads the library from a CDN and fetches model weights on first use. Subsequent loads should be fast due to caching.

## Thresholds
Neutral is produced when either condition is met:
- `abs(pos - neg) < NEUTRAL_MARGIN` (default 0.10)
- `max(pos, neg) < MIN_CONFIDENCE` (default 0.60)

You can tune these in `app.js`:
```js
const NEUTRAL_MARGIN = 0.1;
const MIN_CONFIDENCE = 0.6;
```

## Notes on the bundled dataset
`IMDB Dataset.csv` is included for reference. This web app infers on any text you type/paste; it does not train in the browser. If you want to fine-tune a model on the dataset, do that offline (Python/HF) and then host the converted model for Transformers.js.

## Keyboard shortcut
- Press `Cmd/Ctrl + Enter` to analyze.

## Privacy
All processing happens locally in your browser. Text is not sent to a server.
