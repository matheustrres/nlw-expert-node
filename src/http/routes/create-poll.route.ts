import { type FastifyInstance } from 'fastify';
import { z } from 'zod';

import { prismaClient } from '@/lib/prisma';

export async function createPollRoute(app: FastifyInstance) {
	app.post('/polls', async (request, reply) => {
		const createPollBody = z.object({
			title: z.string().min(1),
			options: z.array(z.string()),
		});

		const { title, options } = createPollBody.parse(request.body);

		const prismaPoll = await prismaClient.poll.create({
			data: {
				title,
				options: {
					createMany: {
						data: options.map((o) => ({
							title: o,
						})),
					},
				},
			},
		});

		return reply.status(201).send({
			poll: prismaPoll,
		});
	});
}
