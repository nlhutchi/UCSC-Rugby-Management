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

    rows = db().select(db.scheduled_events.ALL, orderby=db.scheduled_events.event_on)
    for i, r in enumerate(rows):
        
            t = dict(
                user_email = r.user_email,
                user_name = get_user_name_from_email(r.user_email),
                event_name = r.event_name,
				event_description = r.event_description,
				event_location = r.event_location,
                created_on = r.created_on,
				event_on = r.event_on,
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


# Note that we need the URL to be signed, as this changes the db.
@auth.requires_signature()
def add_post():
    """Here you get a new scheduled_events and add it.  Return what you want."""
    t_id = db.scheduled_events.insert(
        event_name = request.vars.form_content,
		event_description = request.vars.evt_desc,
		event_location = request.vars.evt_loc,
        user_email = request.vars.email,
        user_name = get_user_name_from_email(request.vars.email),
		event_on = datetime.datetime.strptime(request.vars.event_on, "%Y-%m-%dT%H:%M")
        #created_on_human = humanize.naturaltime(datetime.datetime.utcnow()),

    )
    t = db.scheduled_events(t_id)
    return response.json(dict(post=t))


@auth.requires_signature(hash_vars=False)
def del_post():
    """Used to delete a post."""
    db(db.scheduled_events.id == request.vars.post_id).delete()
    return "ok"

@auth.requires_signature(hash_vars=False)
def edit_post_submit():
	po = db.scheduled_events(db.scheduled_events.id == request.vars.post_id)
	po.event_name = request.vars.edit_content
	po.event_description = request.vars.edit_desc
	po.event_location = request.vars.edit_location
	po.event_on = datetime.datetime.strptime(request.vars.edit_time, "%Y-%m-%dT%H:%M")
	po.update_record()
	return response.json(dict(post=po))

def edit_post_get():
	t = dict(
		edit_content = db.scheduled_events(db.scheduled_events.id == request.vars.post_id).event_name,
		edit_location = db.scheduled_events(db.scheduled_events.id == request.vars.post_id).event_location,
		edit_desc = db.scheduled_events(db.scheduled_events.id == request.vars.post_id).event_description,
	)
	return response.json(dict(edit=t))
