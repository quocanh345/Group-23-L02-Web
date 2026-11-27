import * as z from 'zod'

export const idSchema = z.coerce
  .number({ error: 'Phải là số' })
  .int('Phải là số nguyên')
  .positive('Phải là số dương')

export const idParamSchema = z.object({ id: idSchema })

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})
