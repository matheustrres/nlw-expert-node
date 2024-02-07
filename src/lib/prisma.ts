import { PrismaClient } from '@prisma/client';

export const prismaClient = new PrismaClient({
	log: ['query', 'warn', 'error', 'info'],
});
