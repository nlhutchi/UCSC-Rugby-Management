// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array
    var enumerate = function(v) {
        var k=0;
        return v.map(function(e) {e._idx = k++;});
    };


    self.get_posts = function () {
        $.getJSON(get_posts_url, function (data) {
              self.vue.posts = data.posts;
              self.vue.logged_in = data.logged_in;
              self.vue.email = data.email;
              enumerate(self.vue.posts);
        })
    };

    self.get_more = function () {
        console.log('get more');
        var num_posts = self.vue.posts.length;
        $.getJSON(posts_url(num_posts, num_posts + 4), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
            enumerate(self.vue.posts);
        });
    };

    self.add_post_button = function () {
        // This function is called when the add post button is clicked
        console.log('new post pressed');
        if(self.vue.logged_in)
          self.vue.is_adding_post = !self.vue.is_adding_post;
    };

    self.add_post = function () {
        // This function is called when we need to POST the form
        self.vue.is_adding_post = false;
        $.post(add_post_url,
            {
                form_content: self.vue.form_content,
                email: self.vue.email,
            },
            function (data) {
                $.web2py.enableElement($("#add_post_submit"));
                self.vue.posts.unshift(data.post);
                
                self.vue.form_content = "";
                enumerate(self.vue.posts);
            });
    };

    self.delete_post = function (post_idx) {
      console.log('delete clicked ' + post_idx);
      $.post(del_post_url,
            { post_id: self.vue.posts[post_idx].id },
            function () {
                self.vue.posts.splice(post_idx, 1);
                if(self.vue.posts.length <= 3)
                  self.get_posts();
                enumerate(self.vue.posts);
            }
        )
    };

    self.edit_post_button = function (post_idx) {
        console.log('edit post clicked');
        self.vue.is_editing = true;
        self.vue.edit_post_get_content(post_idx);
    };

    self.edit_post_cancel = function () {
        self.vue.is_editing = !self.vue.is_editing;
    };

    self.edit_post_get_content = function (post_idx) {
      var pp = {post_id: self.vue.posts[post_idx].id};
      self.vue.edit_post_id = post_idx;
      $.getJSON(edit_post_get_url + "?" + $.param(pp), function (data) {
          self.vue.edit_content = data.edit_content;
      });
      enumerate(self.vue.posts);
    };
	

    self.edit_post_submit = function () {
        console.log('edit post submit');
        self.vue.is_editing = false;
        $.post(edit_post_submit_url,
            {
                edit_content: self.vue.edit_content,
                post_id: self.vue.posts[self.vue.edit_post_id].id,
            },
            function (data) {
                $.web2py.enableElement($("#edit_post_submit"));
                self.vue.posts[self.vue.edit_post_id].post_content = data.post.post_content;
                self.vue.posts[self.vue.edit_post_id].updated_on = data.post.updated_on;
                enumerate(self.vue.posts);
            });
    };


    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            posts: [],
            has_more: false,
            logged_in: false,
            is_adding_post: false,
            is_editing: false,
            form_content: null,
            edit_content: null,
            edit_post_id: null,
            email: null
        },
        methods: {
            get_more: self.get_more,
            add_post: self.add_post,
            delete_post: self.delete_post,
            edit_post_get_content: self.edit_post_get_content,
            edit_post_submit: self.edit_post_submit,
            edit_post_cancel: self.edit_post_cancel,
            edit_post_button: self.edit_post_button,
            add_post_button: self.add_post_button,
        }

    });

    self.get_posts();
    $("#vue-div").show()
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
