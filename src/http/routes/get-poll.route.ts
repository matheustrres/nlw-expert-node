import { type FastifyInstance } from 'fastify';
import { z } from 'zod';

import { prismaClient } from '@/lib/prisma';
import { redisClient } from '@/lib/redis';

export async function getPollRoute(app: FastifyInstance) {
	app.get('/polls/:pollId', async (request, reply) => {
		const getPollParams = z.object({
			pollId: z.string().uuid(),
		});

		const { pollId } = getPollParams.parse(request.params);

		const prismaPoll = await prismaClient.poll.findUnique({
			where: {
				id: pollId,
			},
			include: {
				options: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});

		if (!prismaPoll) {
			return reply.status(400).send({
				message: 'Poll not found.',
			});
		}

		const result = await redisClient.zrange(pollId, 0, -1, 'WITHSCORES');

		const votes = result.reduce(
			(obj, line, i) => {
				if (i % 2 === 0) {
					const score = result[i + 1];

					Object.assign(obj, { [line]: Number(score) });
				}

				return obj;
			},
			{} as Record<string, number>,
		);

		return reply.send({
			poll: {
				id: prismaPoll.id,
				title: prismaPoll.title,
				options: prismaPoll.options.map((o) => ({
					id: o.id,
					title: o.title,
					score: o.id in votes ? votes[o.id] : 0,
				})),
			},
		});
	});
}
