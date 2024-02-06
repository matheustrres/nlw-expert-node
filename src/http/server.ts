import { PrismaClient } from '@prisma/client';
import fastify from 'fastify';
import { z } from 'zod';

const app = fastify();
const prisma = new PrismaClient({
	log: ['query', 'warn', 'error', 'info'],
});

app.get('/hello', () => {
	return 'Hello World!';
});

app.post('/polls', async (request, reply) => {
	const createPollBody = z.object({
		title: z.string().min(1),
	});

	const { title } = createPollBody.parse(request.body);

	const prismaPoll = await prisma.poll.create({
		data: {
			title,
		},
	});

	return reply.status(201).send({
		poll: prismaPoll,
	});
});

app.listen({ port: 3333 }).then(() => {
	console.log('Http server listening on port 3333');
});
