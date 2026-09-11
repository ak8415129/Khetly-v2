import type { Request, Response, NextFunction } from 'express'
import { type ZodIssue, type ZodSchema } from 'zod'

interface ValidateSchemas { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }

export function validate(schemas: ValidateSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, string[]> = {}
    for (const [key, schema] of Object.entries(schemas)) {
      if (!schema) continue
      const result = schema.safeParse(req[key as keyof Request])
      if (!result.success) {
        result.error.issues.forEach((issue: ZodIssue) => {
          const path = issue.path.join('.') || key
          if (!errors[path]) errors[path] = []
          errors[path]!.push(issue.message)
        })
      } else {
        ;(req as unknown as Record<string, unknown>)[key] = result.data
      }
    }
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ success: false, error: 'Validation failed', code: 'VALIDATION_ERROR', statusCode: 422, details: errors })
    }
    return next()
  }
}
