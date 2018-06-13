# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

db.define_table('post',
                Field('user_email', default=auth.user.email if auth.user_id else None),
                Field('user_name', 'string'),
                Field('post_content', 'text'),
                Field('created_on', 'datetime', default=request.now),
                Field('created_on_human', 'string'),
                Field('updated_on', 'datetime', default=None, update=request.now),
                Field('updated_on_human', 'string', default=None),
                )
				
db.define_table('scheduled_events',
				Field('user_email', default=auth.user.email if auth.user_id else None),
				Field('user_name', 'string'),
				Field('event_name', 'text'),
				Field('event_location', 'text'),
				Field('event_description', 'text'),
				Field('created_on', 'datetime', default=request.now),
				Field('event_on', 'datetime'),
                )
				
db.define_table('survey',
				Field('user_email', default=auth.user.email if auth.user_id else None),
				Field('user_name', 'string'),
				Field('question', 'text'),
				Field('created_on', 'datetime', default=request.now),
				Field('updated_on', 'datetime', default=None, update=request.now),
				Field('opt1', 'text'),
				Field('opt2', 'text'),
				Field('opt3', 'text'),
				Field('opt4', 'text'),
				Field('res1', 'float', default=0),
				Field('res2', 'float', default=0),
				Field('res3', 'float', default=0),
				Field('res4', 'float', default=0),
				
                )
			
db.define_table('response',
				Field('user_email', default=auth.user.email if auth.user_id else None),
				Field('survey_id', 'float'),
				Field('user_name', 'string'),
				Field('created_by', 'reference auth_user', default=auth.user_id),
				Field('response1', 'float', default=0),
				Field('response2', 'float', default=0),
				Field('response3', 'float', default=0),
				Field('response4', 'float', default=0),
				
                )

# I don't want to display the user email by default in all forms.
db.post.user_email.readable = db.post.user_email.writable = False
db.post.post_content.requires = IS_NOT_EMPTY()
db.post.created_on.readable = db.post.created_on.writable = False
db.post.updated_on.readable = db.post.updated_on.writable = False
db.post.updated_on_human.readable = db.post.updated_on_human.writable = False
db.post.id.readable = db.post.id.writable = False

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)