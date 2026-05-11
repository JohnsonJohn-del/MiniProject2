import { createWorker } from "tesseract.js";

export async function extractTextFromImage(imagePath) {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(imagePath);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
