const {
	selectTopics,
	articleId,
	fetchArticles,
	getArticleComments,
	newArticleComment,
	updatedVotes,
	deleteComment,
	allUsers,
} = require('./app.model');
const endpointsJson = require('./endpoints.json');

exports.getApiEndpoints = (req, res, next) => {
	res.status(200).send({ endpoints: endpointsJson });
};

exports.getAllTopics = (req, res, next) => {
	selectTopics()
		.then((topics) => {
			res.status(200).send({ topics });
		})
		.catch(next);
};

exports.getArticlebyId = (req, res, next) => {
	const article_id = req.params.article_id;

	articleId(article_id)
		.then((article) => {
			res.status(200).send({ article });
		})
		.catch(next);
};

exports.getArticles = (req, res, next) => {
	const { sort_by = 'created_at', order = 'desc', topic } = req.query;

	fetchArticles(sort_by, order, topic)
		.then((articles) => {
			res.status(200).send({ articles });
		})
		.catch(next);
};

exports.getMatchingComments = (req, res, next) => {
	const article_id = req.params.article_id;

	getArticleComments(article_id)
		.then((article) => {
			res.status(200).send(article);
		})
		.catch(next);
};

exports.postNewComment = (req, res, next) => {
	const { article_id } = req.params;
	const { username, body } = req.body;

	newArticleComment(article_id, { username, body })
		.then((newComment) => {
			res.status(201).send({
				comment_id: newComment.comment_id,
				username: newComment.author,
				body: newComment.body,
			});
		})
		.catch(next);
};

exports.newVoteValue = (req, res, next) => {
	const { article_id } = req.params;
	const { inc_votes } = req.body;

	updatedVotes({ inc_votes }, article_id)
		.then((newVotes) => {
			res.status(200).send(newVotes);
		})
		.catch(next);
};

exports.removedComment = (req, res, next) => {
	const { article_id, comment_id } = req.params;

	deleteComment(article_id, comment_id)
		.then((removedRow) => {
			if (removedRow === 0) {
				return res.status(404).send({ msg: 'not found' });
			}
			return res.status(204).send();
		})
		.catch(next);
};

exports.getAllUsers = (req, res, next) => {
	allUsers()
		.then((allUsers) => {
			res.status(200).send(allUsers);
		})
		.catch(next);
};
