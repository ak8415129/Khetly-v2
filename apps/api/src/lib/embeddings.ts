import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers'

// Lazily-loaded singleton — the model (~90MB) downloads once on first use and is cached
// on disk (default: ./node_modules/@xenova/transformers/.cache, override with TRANSFORMERS_CACHE).
let embedderPromise: Promise<FeatureExtractionPipeline> | null = null

function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedderPromise) {
    // all-MiniLM-L6-v2: 384-dim embeddings, small and fast, good enough for a
    // few hundred FAQ-sized chunks. Swap for a larger model only if retrieval
    // quality becomes a real problem at a much bigger KB size.
    embedderPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2') as Promise<FeatureExtractionPipeline>
  }
  return embedderPromise
}

/** Embeds a single piece of text into a 384-dimension vector. */
export async function embedText(text: string): Promise<number[]> {
  const embedder = await getEmbedder()
  const output = await embedder(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}

/** Embeds many texts — used by the seed script, runs sequentially to keep memory low. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const out: number[][] = []
  for (const t of texts) {
    out.push(await embedText(t))
  }
  return out
}

/** Formats a vector for a raw Postgres pgvector query, e.g. '[0.1,0.2,...]' */
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(',')}]`
}
