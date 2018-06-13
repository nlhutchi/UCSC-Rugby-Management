# These are the controllers for your ajax api.

import datetime

def get_user_name_from_email(email):
	"""Returns a string corresponding to the user first and last names,
	given the user email."""
	u = db(db.auth_user.email == email).select().first()
	if u is None:
		return 'None'
	else:
		return ' '.join([u.first_name, u.last_name])

def get_posts():
	"""This controller is used to get the posts.  Follow what we did in lecture 10, to ensure
	that the first time, we get 4 posts max, and each time the "load more" button is pressed,
	we load at most 4 more posts."""

	posts = []

	rows = db().select(db.survey.ALL, orderby=~db.survey.created_on)
	for i, r in enumerate(rows):
		
			t = dict(
				user_email = r.user_email,
				user_name = get_user_name_from_email(r.user_email),
				question = r.question,
				created_on = r.created_on,
				opt1 = r.opt1,
				opt2 = r.opt2,
				opt3 = r.opt3,
				opt4 = r.opt4,
				res1 = r.res1,
				res2 = r.res2,
				res3 = r.res3,
				res4 = r.res4,
				#created_on_human = humanize.naturaltime(r.created_on),
				updated_on = r.updated_on,
				#updated_on_human = r.updated_on_human,
				id = r.id,
			)
			posts.append(t)

	logged_in = auth.user_id is not None
	email = None
	if logged_in:
		email = auth.user.email

	return response.json(dict(
		posts=posts,
		logged_in=logged_in,
		email=email,
	))

def get_responses():
	"""This controller is used to get the posts.  Follow what we did in lecture 10, to ensure
	that the first time, we get 4 posts max, and each time the "load more" button is pressed,
	we load at most 4 more posts."""

	responses = []
	if auth.user_id is not None:
		rows = db(db.response.created_by == auth.user_id).select(db.response.ALL)
	for i, r in enumerate(rows):	 
			t = dict(
				user_email = r.user_email,
				user_name = get_user_name_from_email(r.user_email),
				survey_idx = r.survey_idx,
				opt1 = r.opt1,
				opt2 = r.opt2,
				opt3 = r.opt3,
				opt4 = r.opt4,
			)
			responses.append(t)

	logged_in = auth.user_id is not None
	email = None
	if logged_in:
		email = auth.user.email

	return response.json(dict(
		responses=responses,
		logged_in=logged_in,
		email=email,
	))

#@auth.requires_signature()
def submit_response():
	t_id = db.response.insert(
		question = request.vars.question,
		user_email = request.vars.email,
		user_name = get_user_name_from_email(request.vars.email),
		response1 = request.vars.opt1,
		response2 = request.vars.opt2,
		response3 = request.vars.opt3,
		response4 = request.vars.opt4,

	)
	t = db.survey(t_id)
	return response.json(dict(post=t))
# Note that we need the URL to be signed, as this changes the db.
@auth.requires_signature()
def add_post():
	"""Here you get a new post and add it.	Return what you want."""
	t_id = db.survey.insert(
		question = request.vars.question,
		user_email = request.vars.email,
		user_name = get_user_name_from_email(request.vars.email),
		opt1 = request.vars.opt1,
		opt2 = request.vars.opt2,
		opt3 = request.vars.opt3,
		opt4 = request.vars.opt4,
		#created_on_human = humanize.naturaltime(datetime.datetime.utcnow()),

	)
	t = db.survey(t_id)
	return response.json(dict(post=t))


@auth.requires_signature(hash_vars=False)
def del_post():
	"""Used to delete a survey."""
	db(db.survey.id == request.vars.post_id).delete()
	return "ok"

#@auth.requires_signature(hash_vars=False)
def iterate_totals():
	po = db.survey(db.survey.id == request.vars.survey_id)
	po.res1 = request.vars.input1
	po.res2 = request.vars.input2
	po.res3 = request.vars.input3
	po.res4 = request.vars.input4
	po.update_record()
	return response.json(dict(post=po))

@auth.requires_signature(hash_vars=False)
def edit_post_submit():
	po = db.survey(db.survey.id == request.vars.post_id)
	po.question = request.vars.edit_content
	po.updated_on = datetime.datetime.utcnow()
	po.updated_on_human = humanize.naturaltime(datetime.datetime.utcnow())
	po.update_record()
	return response.json(dict(post=po))

def edit_post_get():
	edit_content = db.survey(db.survey.id == request.vars.post_id).question
	return response.json(dict(edit_content=edit_content))
