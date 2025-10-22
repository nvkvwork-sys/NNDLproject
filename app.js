/* global window, document, console */

// Configurable thresholds for neutral decisioning
const NEUTRAL_MARGIN = 0.1; // if |pos - neg| < margin => neutral
const MIN_CONFIDENCE = 0.6; // if max(prob) < min => neutral

// Model identifier (served by Hugging Face via Transformers.js CDN cache)
const MODEL_ID = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const ui = {
  input: $('#review-input'),
  analyze: $('#analyze-btn'),
  clear: $('#clear-btn'),
  loading: $('#loading'),
  result: $('#result'),
  exampleChips: $('#example-chips')
};

/**
 * Lazy-load the Transformers pipeline once. It will cache model weights.
 */
let pipelineSingleton = null;
async function getPipeline() {
  if (pipelineSingleton) return pipelineSingleton;
  ui.loading.classList.remove('hidden');
  try {
    // transformers.min.js exposes a global `transformers` object
    const { pipeline } = window.transformers;
    pipelineSingleton = await pipeline('sentiment-analysis', MODEL_ID);
    return pipelineSingleton;
  } finally {
    // keep the loading visible until first inference below
  }
}

function formatOutput(label, confidence) {
  const rounded = Math.round(confidence * 100) / 100;
  if (label === 'POSITIVE') {
    return { text: `😃 Positive (confidence: ${rounded.toFixed(2)})`, cls: 'positive' };
  }
  if (label === 'NEGATIVE') {
    return { text: `😡 Negative (confidence: ${rounded.toFixed(2)})`, cls: 'negative' };
  }
  return { text: `😐 Neutral (confidence: ${rounded.toFixed(2)})`, cls: 'neutral' };
}

function decideWithNeutral(logits) {
  // transformers.js returns array of { label, score }
  const pos = logits.find((x) => x.label.toUpperCase().includes('POS'))?.score ?? 0;
  const neg = logits.find((x) => x.label.toUpperCase().includes('NEG'))?.score ?? 0;
  const diff = Math.abs(pos - neg);
  const maxProb = Math.max(pos, neg);
  if (diff < NEUTRAL_MARGIN || maxProb < MIN_CONFIDENCE) {
    return { label: 'NEUTRAL', confidence: 1 - diff }; // heuristic confidence proxy
  }
  return pos >= neg
    ? { label: 'POSITIVE', confidence: pos }
    : { label: 'NEGATIVE', confidence: neg };
}

async function analyzeText() {
  const text = (ui.input.value || '').trim();
  if (!text) {
    ui.result.classList.remove('hidden');
    ui.result.innerHTML = '<span class="muted">Please enter some text.</span>';
    return;
  }

  ui.analyze.disabled = true;
  ui.clear.disabled = true;
  ui.loading.classList.remove('hidden');
  ui.result.classList.add('hidden');
  ui.result.textContent = '';

  try {
    const pipe = await getPipeline();
    const raw = await pipe(text, { topk: null });
    // Normalize shapes:
    // - Top-1: [{ label, score }]
    // - All scores: [[ { label, score }, ... ]]
    // - Some versions might return a single object for top-1
    const logits = Array.isArray(raw)
      ? (Array.isArray(raw[0]) ? raw[0] : raw)
      : [raw];
    const decision = decideWithNeutral(logits);
    const fmt = formatOutput(decision.label, decision.confidence);
    ui.result.className = 'result';
    ui.result.classList.remove('hidden');
    ui.result.innerHTML = `<span class="badge ${fmt.cls}">${fmt.text}</span>`;
  } catch (err) {
    console.error(err);
    ui.result.classList.remove('hidden');
    ui.result.innerHTML = `<span class="badge neutral">⚠️ Error: ${String(err.message || err)}</span>`;
  } finally {
    ui.loading.classList.add('hidden');
    ui.analyze.disabled = false;
    ui.clear.disabled = false;
  }
}

function wireEvents() {
  ui.analyze.addEventListener('click', analyzeText);
  ui.clear.addEventListener('click', () => {
    ui.input.value = '';
    ui.result.textContent = '';
    ui.result.classList.add('hidden');
  });
  ui.input.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'enter') {
      analyzeText();
    }
  });
  if (ui.exampleChips) {
    $$('#example-chips .chip').forEach((chip) =>
      chip.addEventListener('click', () => {
        ui.input.value = chip.getAttribute('data-text') || '';
      })
    );
  }
}

document.addEventListener('DOMContentLoaded', wireEvents);


