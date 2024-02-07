import { randomUUID } from 'node:crypto';

import { type FastifyInstance } from 'fastify';
import { z } from 'zod';

import { prismaClient } from '@/lib/prisma';

export async function voteOnPollRoute(app: FastifyInstance) {
	app.post('/polls/:pollId/vote', async (request, reply) => {
		const voteOnPollBody = z.object({
			pollOptionId: z.string().uuid(),
		});

		const voteOnPollParams = z.object({
			pollId: z.string().uuid(),
		});

		const { pollOptionId } = voteOnPollBody.parse(request.body);
		const { pollId } = voteOnPollParams.parse(request.params);

		let { sessionId } = request.cookies;

		if (sessionId) {
			const userAlreadyVotedOnPoll = await prismaClient.vote.findUnique({
				where: {
					sessionId_pollId: {
						pollId,
						sessionId,
					},
				},
			});

			if (
				userAlreadyVotedOnPoll &&
				userAlreadyVotedOnPoll.pollOptionId !== pollOptionId
			) {
				await prismaClient.vote.delete({
					where: {
						id: userAlreadyVotedOnPoll.id,
					},
				});
			} else if (userAlreadyVotedOnPoll) {
				return reply.status(400).send({
					time: new Date().toISOString(),
					message: 'You already voted on this poll',
					route: request.routerPath,
				});
			}
		}

		if (!sessionId) {
			sessionId = randomUUID();

			reply.setCookie('sessionId', sessionId, {
				path: '/',
				maxAge: 60 * 60 * 24 * 30, // 30 days
				signed: true,
				httpOnly: true,
			});
		}

		await prismaClient.vote.create({
			data: {
				sessionId,
				pollId,
				pollOptionId,
			},
		});

		return reply.status(201).send();
	});
}
