const endpointsJson = require('../endpoints.json');
const request = require('supertest');
const db = require('../db/seeds/seed');
const app = require('../__app__/app');
const data = require('../db/data/test-data');
const dbConnection = require('../db/connection');

afterAll(() => {
	return dbConnection.end();
});

beforeEach(() => {
	return db(data);
});

describe('GET /api', () => {
	test('200: Responds with an object detailing the documentation for each endpoint', () => {
		return request(app)
			.get('/api')
			.expect(200)
			.then(({ body: { endpoints } }) => {
				expect(endpoints).toEqual(endpointsJson);
			});
	});
});

describe('GET /api/topics', () => {
	test('200: Responds with an array of objects with the properties slug and description', () => {
		return request(app)
			.get('/api/topics')
			.expect(200)
			.then(({ body: { topics } }) => {
				expect(topics).toHaveLength(3);
				topics.forEach((topic) => {
					expect(topic).toHaveProperty('slug', expect.any(String));
					expect(topic).toHaveProperty('description', expect.any(String));
				});
			});
	});
});

describe('GET /api/articles/:article_id', () => {
	test('200: Responds with an article of the chosen ID', () => {
		return request(app)
			.get('/api/articles/3')
			.expect(200)
			.then(({ body: { article } }) => {
				expect(article).toMatchObject({
					article_id: 3,
					title: 'Eight pug gifs that remind me of mitch',
					topic: 'mitch',
					author: 'icellusedkars',
					body: 'some gifs',
					created_at: '2020-11-03T09:12:00.000Z',
					article_img_url:
						'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
				});
			});
	});
	test('200: Returns an article with an additional row of the amount of comments the specified article has', () => {
		return request(app)
			.get('/api/articles/1')
			.expect(200)
			.then(({ body: { article } }) => {
				expect(article).toHaveProperty('comment_count', 11);
			});
	});
	test('400: Returns an invalid input message when provided anything but a number', () => {
		return request(app)
			.get('/api/articles/tester')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('bad request');
			});
	});
	test('404: Returns a message advising the article does not exist when passed a number that is not a current article', () => {
		return request(app)
			.get('/api/articles/9999')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('not found');
			});
	});
});

describe('GET /api/articles', () => {
	test('200: Returns an array of all articles sorted in descending order without a body property', () => {
		return request(app)
			.get('/api/articles')
			.expect(200)
			.then(({ body: { articles } }) => {
				expect(articles).toHaveLength(13);
				articles.forEach((article) => {
					expect(article).toHaveProperty('article_id', expect.any(Number));
					expect(article).toHaveProperty('title', expect.any(String));
					expect(article).toHaveProperty('topic', expect.any(String));
					expect(article).toHaveProperty('author', expect.any(String));
					expect(article).toHaveProperty('created_at', expect.any(String));
					expect(article).toHaveProperty('votes', expect.any(Number));
					expect(article).toHaveProperty('comment_count', expect.any(Number));
					expect(article).toHaveProperty('article_img_url', expect.any(String));
				});
				expect(articles).toBeSortedBy('created_at', { descending: true });
			});
	});
	test('200: Returns all articles in descending order sorted by the title', () => {
		return request(app)
			.get('/api/articles?sort_by=title&order=desc')
			.expect(200)
			.then(({ body: { articles } }) => {
				expect(articles).toBeSortedBy('title', { descending: true });
			});
	});
	test('200: Returns all articles in ascending order sorted by the author', () => {
		return request(app)
			.get('/api/articles?sort_by=author&order=asc')
			.expect(200)
			.then(({ body: { articles } }) => {
				expect(articles).toBeSortedBy('author', { descending: false });
			});
	});
	test('200: Returns all articles sorted by created_at', () => {
		return request(app)
			.get('/api/articles?sort_by=created_at')
			.expect(200)
			.then(({ body: { articles } }) => {
				expect(articles).toBeSortedBy('created_at', { descending: true });
			});
	});
	test('200: Returns all articles sorted by votes', () => {
		return request(app)
			.get('/api/articles?sort_by=votes')
			.expect(200)
			.then(({ body: { articles } }) => {
				expect(articles).toBeSortedBy('votes', { descending: true });
			});
	});
	test('200: Returns all articles that match the specified topic value', () => {
		return request(app)
			.get('/api/articles?topic=mitch')
			.expect(200)
			.then(({ body: { articles } }) => {
				expect(articles).toHaveLength(12);
				articles.forEach((article) => {
					expect(article.topic).toBe('mitch');
				});
			});
	});
	test('404: Returns an error message when passed a sort_by value that is invalid', () => {
		return request(app)
			.get('/api/articles?sort_by=testing&order=asc')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toEqual('not found');
			});
	});
	test('404: Returns an error message when passed an order value that is invalid', () => {
		return request(app)
			.get('/api/articles?sort_by=title&order=tester')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toEqual('not found');
			});
	});
	test('404: Returns an error message when passed a topic value that does not exist', () => {
		return request(app)
			.get('/api/articles?topic=tester&order=asc')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('not found');
			});
	});
});

describe('GET /api/articles/:article_id/comments', () => {
	test('200: Returns an array of comments for a given article_id', () => {
		return request(app)
			.get('/api/articles/1/comments')
			.expect(200)
			.then(({ body }) => {
				body.forEach((article) => {
					const keys = Object.keys(article);
					expect(keys.length).toBe(6);

					expect(article).toHaveProperty('comment_id', expect.any(Number));
					expect(article).toHaveProperty('votes', expect.any(Number));
					expect(article).toHaveProperty('created_at', expect.any(String));
					expect(article).toHaveProperty('author', expect.any(String));
					expect(article).toHaveProperty('body', expect.any(String));
					expect(article).toHaveProperty('article_id', expect.any(Number));
				});
				expect(body).toBeSortedBy('created_at', { descending: true });
			});
	});
	test('400: Returns an invalid input message when provided anything but a number', () => {
		return request(app)
			.get('/api/articles/tester/comments')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('bad request');
			});
	});
	test('404: Returns a message advising the article does not exist when passed a number that is not a current article', () => {
		return request(app)
			.get('/api/articles/9999/comments')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('not found');
			});
	});
});

describe('POST /api/articles/:article_id/comments', () => {
	test('201: adds a comment for the specified article id with username and body properties', () => {
		const commentData = {
			username: 'butter_bridge',
			body: 'this is a test comment for an article',
		};

		return request(app)
			.post('/api/articles/2/comments')
			.send(commentData)
			.expect(201)
			.then(({ body }) => {
				expect(body).toHaveProperty('username', 'butter_bridge');
				expect(body).toHaveProperty(
					'body',
					'this is a test comment for an article'
				);
				expect(body).toHaveProperty('comment_id', expect.any(Number));
			});
	});
	test('400: returns a bad request message when the username is missing', () => {
		const commentData = {
			body: 'this is a test comment for an article',
		};

		return request(app)
			.post('/api/articles/2/comments')
			.send(commentData)
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe(`bad request`);
			});
	});
	test('400: returns a bad request message when the body is missing', () => {
		const commentData = {
			username: 'butter_bridge',
		};

		return request(app)
			.post('/api/articles/2/comments')
			.send(commentData)
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe(`bad request`);
			});
	});
	test('404: Returns a message advising the input does not currently exist when the input ID does not exist', () => {
		const commentData = {
			username: 'butter_bridge',
			body: 'this is a test comment for an article',
		};

		return request(app)
			.post('/api/articles/9999/comments')
			.send(commentData)
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('not found');
			});
	});
});

describe('PATCH /api/articles/:article_id', () => {
	test('200: Responds with an article that has an updated votes value when a positive number of votes is sent', () => {
		const updatedVotes = { inc_votes: 10 };

		return request(app)
			.patch('/api/articles/1')
			.send(updatedVotes)
			.expect(200)
			.then(({ body }) => {
				expect(body).toHaveProperty('votes', 110);
			});
	});
	test('200: Responds with an article that has an updated votes value when a negative number of votes is sent', () => {
		const updatedVotes = { inc_votes: -10 };

		return request(app)
			.patch('/api/articles/1')
			.send(updatedVotes)
			.expect(200)
			.then(({ body }) => {
				expect(body).toHaveProperty('votes', 90);
			});
	});
	test('404: Response with an error message if the article does not exist', () => {
		const updatedVotes = { inc_votes: -10 };

		return request(app)
			.patch('/api/articles/9999')
			.send(updatedVotes)
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('not found');
			});
	});
	test('404: Responds with an error message if trying to deduct more votes than the rows value', () => {
		const updatedVotes = { inc_votes: -1000 };

		return request(app)
			.patch('/api/articles/1')
			.send(updatedVotes)
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('not found');
			});
	});
	test('404: Responds with an error message if the object fo votes does not have the correct property', () => {
		const updatedVotes = { bad_property: 10 };

		return request(app)
			.patch('/api/articles/1')
			.send(updatedVotes)
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('not found');
			});
	});
	test('404: Responds with an error message if the object fo votes does not have the correct property', () => {
		const updatedVotes = { bad_property: 10 };

		return request(app)
			.patch('/api/articles/1')
			.send(updatedVotes)
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('not found');
			});
	});
	test('400: Responds with an error message when attempting to input anything but a number as an article reference', () => {
		const updatedVotes = { inc_votes: 10 };

		return request(app)
			.patch('/api/articles/tester')
			.send(updatedVotes)
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('bad request');
			});
	});
	test('400: Responds with an error message when attempting to input anything but a number as the updated votes value', () => {
		const updatedVotes = { inc_votes: 'tested' };

		return request(app)
			.patch('/api/articles/1')
			.send(updatedVotes)
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('bad request');
			});
	});
});

describe('DELETE /api/articles/:article_id/comments/:comment_id', () => {
	test('204: Comment is deleted based on the input comment_id', () => {
		return request(app)
			.delete('/api/articles/1/comments/18')
			.expect(204)
			.then(({ body }) => {
				expect(body).toEqual({});
			});
	});
	test('404: Returns a message advising no comment found if the comment_id does not exist', () => {
		return request(app)
			.delete('/api/articles/1/comments/9999')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toEqual('not found');
			});
	});
	test('400: Returns a message advising of an invalid id when the input is not a number', () => {
		return request(app)
			.delete('/api/articles/:article_id/comments/tester')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toEqual('bad request');
			});
	});
});

describe('GET /api/users', () => {
	test('200: Returns the entire user table with all contents', () => {
		return request(app)
			.get('/api/users')
			.expect(200)
			.then(({ body }) => {
				expect(body).toHaveLength(4);
				body.forEach((user) => {
					expect(user).toHaveProperty('username');
					expect(user).toHaveProperty('name');
					expect(user).toHaveProperty('avatar_url');
				});
			});
	});
});
