import fastifyCookie from '@fastify/cookie';
import fastify from 'fastify';

import { createPollRoute } from './routes/create-poll.route';
import { getPollRoute } from './routes/get-poll.route';
import { voteOnPollRoute } from './routes/vote-on-poll.route';

const app = fastify();

app.get('/hello', () => {
	return 'Hello World!';
});

app.register(fastifyCookie, {
	secret: 'polls-app-nlw',
	hook: 'onRequest',
	parseOptions: {},
});

app.register(createPollRoute);
app.register(getPollRoute);
app.register(voteOnPollRoute);

app.listen({ port: 3333 }).then(() => {
	console.log('Http server listening on port 3333');
});
