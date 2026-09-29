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
    file: "doc-portrait.jpg",
    aspect_ratio: "3:4",
    prompt: `Neo-brutalist flat vector illustration of ONE single veterinarian — a kind woman in her mid-30s wearing coral scrubs with a stethoscope, hair in a tidy bun, warm confident smile, arms gently holding one small tabby cat.
IMPORTANT: only one person in the image, no other humans, no background people.
Style: bold flat vector, very thick black outlines, hard-edged geometric shapes, risograph print grain with subtle paper texture.
Limited warm palette only: cream #FDF0DC background, peach #F7C59F, warm coral #EF7D5B, mustard #F2B705, mint green #A8C88A accent, deep espresso brown #2B1B12 for all outlines.
Composition: single centered half-body portrait, flat solid warm cream background, two or three simple geometric decorative shapes (circle, triangle) in the corners, generous empty space above the head.
No text, no letters, no words, no logos, no signage. Friendly, professional, high-contrast screen-print poster quality.`,
  },
  {
    file: "care-room.jpg",
    aspect_ratio: "4:3",
    prompt: `Neo-brutalist flat vector illustration: a veterinarian's hands gently examining a calm golden retriever on a peach examination table, with a syringe and a small potted plant on the table.
IMPORTANT: no visible faces of any people, focus only on hands, the dog and the clinic objects.
Style: bold flat vector, very thick black outlines, hard-edged geometric shapes, risograph print grain.
Limited warm palette only: cream #FDF0DC, peach #F7C59F, warm coral #EF7D5B, mustard #F2B705, mint green #A8C88A, deep espresso brown #2B1B12 outlines.
Composition: single centered subject, flat solid warm background, simple geometric shapes, clear empty space at the top.
No text, no letters, no words, no logos. Clean, friendly, screen-print poster quality.`,
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

async function run(job) {
  const { taskId } = await post("/api/v1/jobs/createTask", {
    model: "seedream/4.5-text-to-image",
    input: {
      prompt: job.prompt,
      aspect_ratio: job.aspect_ratio,
      quality: "basic",
    },
  });
  console.log(`[${job.file}] task ${taskId}`);
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const j = await (
      await fetch(`${BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
        headers: { Authorization: `Bearer ${KEY}` },
      })
    ).json();
    const state = j?.data?.state;
    if (state === "success" || state === "fail") {
      const urls = JSON.parse(j.data.resultJson || "{}").resultUrls || [];
      if (!urls.length) throw new Error(`[${job.file}] ${j.data.failInfo || "no url"}`);
      const img = await fetch(urls[0]);
      await writeFile(new URL(job.file, OUT), Buffer.from(await img.arrayBuffer()));
      console.log(`[${job.file}] ok`);
      return;
    }
  }
  throw new Error(`[${job.file}] timeout`);
}

await mkdir(OUT, { recursive: true });
await Promise.all(JOBS.map(run));
