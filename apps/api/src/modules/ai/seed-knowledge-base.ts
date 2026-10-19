import 'dotenv/config'
import prisma from '../../lib/prisma'
import { embedText, toVectorLiteral } from '../../lib/embeddings'
import { KNOWLEDGE_BASE } from './knowledge-base'

/**
 * Run with: pnpm --filter api seed:kb
 * Re-run any time knowledge-base.ts changes — this upserts by id, so it's safe to run repeatedly.
 */
async function main() {
  console.info(`🧠 Embedding ${KNOWLEDGE_BASE.length} knowledge base entries (first run downloads a small model, ~90MB)...`)

  for (const entry of KNOWLEDGE_BASE) {
    const vector = await embedText(`${entry.title}\n${entry.content}`)
    const literal = toVectorLiteral(vector)

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "knowledge_chunks" ("id", "title", "content", "category", "embedding", "updatedAt")
      VALUES ($1, $2, $3, $4, $5::vector, NOW())
      ON CONFLICT ("id") DO UPDATE SET
        "title" = EXCLUDED."title",
        "content" = EXCLUDED."content",
        "category" = EXCLUDED."category",
        "embedding" = EXCLUDED."embedding",
        "updatedAt" = NOW()
      `,
      entry.id,
      entry.title,
      entry.content,
      entry.category,
      literal
    )
    console.info(`  ✅ ${entry.id}`)
  }

  console.info('🌾 Knowledge base seeded successfully.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('❌ Failed to seed knowledge base:', err)
  process.exit(1)
})
