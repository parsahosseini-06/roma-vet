import { writeFile, mkdir } from "node:fs/promises";

const KEY = process.env.KIE_API_KEY;
if (!KEY) {
  console.error("Missing KIE_API_KEY. Copy .env.example to .env and set your key.");
  process.exit(1);
}

const BASE = "https://api.kie.ai";
const OUT = new URL("./assets/", import.meta.url);

const JOBS = [
  {
    file: "hero-dog.png",
    model: "seedream/4.5-text-to-image",
    aspect_ratio: "4:3",
    quality: "basic",
    prompt: `Neo-brutalist vector illustration poster of a happy golden retriever dog and a friendly smiling veterinarian in a warm cream-and-peach exam room.
Style: bold flat vector, thick heavy black outlines (6px), hard-edged geometric shapes, risograph print texture with subtle grain, limited warm palette only: cream #FDF0DC, peach #F7C59F, warm coral #EF7D5B, mustard #F2B705, deep espresso brown #2B1B12 outlines.
Subject: chunky friendly cartoon dog with floppy ears sitting on a peach examination table, and a kind vet in coral scrubs gently holding the dog's paw, both laughing.
Composition: single centered subject, flat solid warm background, a few simple geometric decorative shapes (circle, triangle, rounded rectangle) floating around, clear empty space at top.
No text, no letters, no words, no logos. Friendly, playful, high contrast, screen-print poster quality.`,
  },
  {
    file: "hero-cat.png",
    model: "seedream/4.5-text-to-image",
    aspect_ratio: "1:1",
    quality: "basic",
    prompt: `Neo-brutalist vector sticker illustration of a chubby orange tabby cat sitting and looking up happily.
Style: bold flat vector, very thick black outlines, hard geometric shapes, risograph print grain, limited warm palette: cream #FDF0DC, peach #F7C59F, warm coral #EF7D5B, mustard #F2B705, deep espresso brown outlines.
Composition: single centered cat, simple flat warm peach background, playful minimal shapes. No text, no letters, no words. Cute, friendly, screen-print sticker quality.`,
  },
  {
    file: "paw-pattern.png",
    model: "seedream/4.5-text-to-image",
    aspect_ratio: "1:1",
    quality: "basic",
    prompt: `Seamless tileable neo-brutalist pattern of simple dog paws, bones and hearts scattered evenly.
Style: bold flat vector, thick black outlines, hard-edged geometric shapes, risograph grain, limited warm palette: cream #FDF0DC, peach #F7C59F, warm coral #EF7D5B, mustard #F2B705, deep espresso brown outlines on a cream background.
Repeating pattern, evenly spaced, no clustering, no text, no letters. Flat, minimal, friendly.`,
  },
];

async function post(path, body) {
  const r = await fetch(BASE + path, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (j.code !== 200) throw new Error(`${path}: ${j.code} ${j.msg}`);
  return j.data;
}

async function task(id) {
  const r = await fetch(`${BASE}/api/v1/jobs/recordInfo?taskId=${id}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  return r.json();
}

async function run(job) {
  const { taskId } = await post("/api/v1/jobs/createTask", {
    model: job.model,
    input: { prompt: job.prompt, aspect_ratio: job.aspect_ratio, quality: job.quality },
  });
  console.log(`[${job.file}] task ${taskId}`);
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const j = await task(taskId);
    const state = j?.data?.state;
    if (state === "success" || state === "fail") {
      const urls = JSON.parse(j.data.resultJson || "{}").resultUrls || [];
      if (!urls.length) throw new Error(`[${job.file}] no urls: ${j.data.failInfo || ""}`);
      const img = await fetch(urls[0]);
      await writeFile(new URL(job.file, OUT), Buffer.from(await img.arrayBuffer()));
      console.log(`[${job.file}] saved ${urls[0]}`);
      return;
    }
  }
  throw new Error(`[${job.file}] timeout`);
}

await mkdir(OUT, { recursive: true });
await Promise.all(JOBS.map(run));
