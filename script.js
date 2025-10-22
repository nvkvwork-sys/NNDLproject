import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@3.0.1';

// Prefer WASM backend for broad GitHub Pages compatibility
env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency || 4;
env.backends.onnx.wasm.simd = true;

const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const resultEmojiEl = document.getElementById('result-emoji');
const resultLabelEl = document.getElementById('result-label');
const resultConfEl = document.getElementById('result-confidence');
const inputEl = document.getElementById('input-text');
const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');

let classifier = null;

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle('error', Boolean(isError));
}

function setLoading(isLoading) {
  analyzeBtn.disabled = isLoading;
}

function labelToEmoji(label) {
  const normalized = String(label).toLowerCase();
  if (normalized.includes('pos')) return '😃';
  if (normalized.includes('neg')) return '😡';
  return '😐';
}

async function ensurePipelineLoaded() {
  if (classifier) return;
  setStatus('Loading model…');

  classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
    // Force WASM for GitHub Pages; will fallback automatically if needed
    device: 'wasm',
    quantized: true,
    progress_callback: (data) => {
      if (!data || !data.status) return;
      const name = data.name ? ` ${data.name}` : '';
      setStatus(`${data.status}${name}`);
    },
  });

  setStatus('Model ready.');
}

async function analyze() {
  const text = inputEl.value.trim();
  if (!text) {
    setStatus('Please enter a review to analyze.', true);
    resultEl.classList.add('hidden');
    return;
  }

  try {
    setLoading(true);
    setStatus('Analyzing…');
    await ensurePipelineLoaded();
    const outputs = await classifier(text);
    const { label, score } = Array.isArray(outputs) ? outputs[0] : outputs;
    const emoji = labelToEmoji(label);
    const confidence = Math.round(score * 100) / 100; // 0.97

    resultEmojiEl.textContent = emoji;
    resultLabelEl.textContent = label?.toLowerCase() === 'positive' || label?.toUpperCase() === 'POSITIVE' ? 'Positive' : 'Negative';
    resultConfEl.textContent = `confidence: ${confidence.toFixed(2)}`;
    resultEl.classList.remove('hidden');
    setStatus('');
  } catch (err) {
    console.error(err);
    setStatus('Failed to analyze sentiment. Please try again.', true);
  } finally {
    setLoading(false);
  }
}

analyzeBtn.addEventListener('click', analyze);
clearBtn.addEventListener('click', () => {
  inputEl.value = '';
  resultEl.classList.add('hidden');
  setStatus('');
  inputEl.focus();
});

// Convenience: analyze with Cmd/Ctrl+Enter
inputEl.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    analyze();
  }
});

// Start loading immediately
ensurePipelineLoaded().catch(() => setStatus('Failed to load model.', true));


