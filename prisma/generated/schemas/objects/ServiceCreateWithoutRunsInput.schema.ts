import { z } from 'zod';
import { PipelineCreateNestedOneWithoutServicesInputObjectSchema } from './PipelineCreateNestedOneWithoutServicesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.ServiceCreateWithoutRunsInput> = z
  .object({
    id: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    name: z.string().optional().nullable(),
    lastRunAt: z.date().optional().nullable(),
    triggerOnMain: z.boolean().optional(),
    triggerOnPrOpen: z.boolean().optional(),
    triggerOnPrSync: z.boolean().optional(),
    useStaging: z.boolean().optional(),
    autoDeploy: z.boolean().optional(),
    githubRepoUrl: z.string(),
    unitTestCommand: z.string().optional().nullable(),
    integrationTestCommand: z.string().optional().nullable(),
    codeQualityCommand: z.string().optional().nullable(),
    dockerfilePath: z.string().optional(),
    dockerComposeFilePath: z.string().optional().nullable(),
    Pipeline: z
      .lazy(() => PipelineCreateNestedOneWithoutServicesInputObjectSchema)
      .optional(),
  })
  .strict();

export const ServiceCreateWithoutRunsInputObjectSchema = Schema;
