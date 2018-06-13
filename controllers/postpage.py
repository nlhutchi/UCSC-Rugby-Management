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

    rows = db().select(db.post.ALL, orderby=~db.post.created_on)
    for i, r in enumerate(rows):
        
            t = dict(
                user_email = r.user_email,
                user_name = get_user_name_from_email(r.user_email),
                post_content = r.post_content,
                created_on = r.created_on,
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


# Note that we need the URL to be signed, as this changes the db.
@auth.requires_signature()
def add_post():
    """Here you get a new post and add it.  Return what you want."""
    t_id = db.post.insert(
        post_content = request.vars.form_content,
        user_email = request.vars.email,
        user_name = get_user_name_from_email(request.vars.email),
        #created_on_human = humanize.naturaltime(datetime.datetime.utcnow()),

    )
    t = db.post(t_id)
    return response.json(dict(post=t))


@auth.requires_signature(hash_vars=False)
def del_post():
    """Used to delete a post."""
    db(db.post.id == request.vars.post_id).delete()
    return "ok"

@auth.requires_signature(hash_vars=False)
def edit_post_submit():
    po = db.post(db.post.id == request.vars.post_id)
    po.post_content = request.vars.edit_content
    po.updated_on = request.now
    po.update_record()
    return response.json(dict(post=po))

def edit_post_get():
    edit_content = db.post(db.post.id == request.vars.post_id).post_content
    return response.json(dict(edit_content=edit_content))
