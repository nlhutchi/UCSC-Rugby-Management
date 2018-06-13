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

	var delete_graph = function() {
        d3.select("svg").remove();
    };
	
	
	self.renderPieChart = function(survey_idx){
		delete_graph();
		var dom_element_to_append_to = "#chart";
		var dataset = [{label:self.vue.posts[survey_idx].opt1,value:self.vue.posts[survey_idx].res1},{label:self.vue.posts[survey_idx].opt2,value:self.vue.posts[survey_idx].res2},{label:self.vue.posts[survey_idx].opt3,value:self.vue.posts[survey_idx].res3},{label:self.vue.posts[survey_idx].opt4,value:self.vue.posts[survey_idx].res4}];
		var colorScheme = ["#E57373","#BA68C8","#7986CB","#A1887F","#90A4AE","#AED581","#9575CD","#FF8A65","#4DB6AC","#FFF176","#64B5F6","#00E676"];

		var margin = {top:50,bottom:50,left:50,right:50};
		var width = 500 - margin.left - margin.right,
		height = width,
		radius = Math.min(width, height) / 2;
		var donutWidth = 75;
		var legendRectSize = 18;
		var legendSpacing = 4;

		dataset.forEach(function(item){
			item.enabled = true;
		});

		var color = d3.scale.ordinal()
		.range(colorScheme);

		var svg = d3.select(dom_element_to_append_to)
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

		var arc = d3.svg.arc()
		.outerRadius(radius - 10)
		.innerRadius(radius - donutWidth);

		var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.value; });

		var tooltip = d3.select(dom_element_to_append_to)
		.append('div')
		.attr('class', 'tooltip');


		tooltip.append('div')
		.attr('class', 'label');

		tooltip.append('div')
		.attr('class', 'count');

		tooltip.append('div')
		.attr('class', 'percent');

		var path = svg.selectAll('path')
		.data(pie(dataset))
		.enter()
		.append('path')
		.attr('d', arc)
		.attr('fill', function(d, i) {
			return color(d.data.label);
		})
		.each(function(d) { this._current = d; });


		path.on('mouseover', function(d) {
			var total = d3.sum(dataset.map(function(d) {
				return (d.enabled) ? d.value : 0;
			}));

			var percent = Math.round(1000 * d.data.value / total) / 10;
			tooltip.select('.label').html(d.data.label.toUpperCase()).style('color','black');
			tooltip.select('.count').html(d.data.value);
			tooltip.select('.percent').html(percent + '%');

			tooltip.style('display', 'block');
			tooltip.style('opacity',2);

		});


		path.on('mousemove', function(d) {
			tooltip.style('top', (d3.event.layerY + 10) + 'px')
			.style('left', (d3.event.layerX - 25) + 'px');
		});

		path.on('mouseout', function() {
			tooltip.style('display', 'none');
			tooltip.style('opacity',0);
		});

		var legend = svg.selectAll('.legend')
		.data(color.domain())
		.enter()
		.append('g')
		.attr('class', 'legend')
		.attr('transform', function(d, i) {
			var height = legendRectSize + legendSpacing;
			var offset =  height * color.domain().length / 2;
			var horz = -2 * legendRectSize;
			var vert = i * height - offset;
			return 'translate(' + horz + ',' + vert + ')';
		});

		legend.append('rect')
		.attr('width', legendRectSize)
		.attr('height', legendRectSize)
		.style('fill', color)
		.style('stroke', color)
		.on('click', function(label) {
			var rect = d3.select(this);
			var enabled = true;
			var totalEnabled = d3.sum(dataset.map(function(d) {
				return (d.enabled) ? 1 : 0;
			}));

			if (rect.attr('class') === 'disabled') {
				rect.attr('class', '');
			} else {
				if (totalEnabled < 2) return;
				rect.attr('class', 'disabled');
				enabled = false;
			}

			pie.value(function(d) {
				if (d.label === label) d.enabled = enabled;
				return (d.enabled) ? d.value : 0;
			});

			path = path.data(pie(dataset));

			path.transition()
			.duration(750)
			.attrTween('d', function(d) {
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					return arc(interpolate(t));
				};
			});
		});


		legend.append('text')
		.attr('x', legendRectSize + legendSpacing)
		.attr('y', legendRectSize - legendSpacing)
		.text(function(d) { return d; })
	};

    self.get_posts = function () {
		console.log('making it');
        $.getJSON(get_posts_url, function (data) {
              self.vue.posts = data.posts;
              self.vue.logged_in = data.logged_in;
              self.vue.email = data.email;
              enumerate(self.vue.posts);
        });
		for(i=1; i<self.vue.posts.length; i++){
			self.vue.chartId.append("chart" + i);
			self.vue.cshChartId.append("#chart" + i);
			console.log('making it');
		}
    };
	
	self.get_responses = function () {
		
		$.getJSON(get_responses_url, function (data) {
              self.vue.responses = data.responses;
              self.vue.logged_in = data.logged_in;
              self.vue.email = data.email;
              enumerate(self.vue.responses);
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

	
self.submit_response = function (post_idx) {
        // This function is called when the add post button is clicked
        if(self.vue.option1 == true)
			self.vue.in1 = parseFloat(self.vue.posts[post_idx].res1) + 1;
		else self.vue.in1 = self.vue.posts[post_idx].res1;
		if(self.vue.option2 == true)
			self.vue.in2 = parseFloat(self.vue.posts[post_idx].res2) + 1;
		else self.vue.in2 = self.vue.posts[post_idx].res2;
		if(self.vue.option3 == true)
			self.vue.in3 = parseFloat(self.vue.posts[post_idx].res3) + 1;
		else self.vue.in3 = self.vue.posts[post_idx].res3;
		if(self.vue.option4 == true)
			self.vue.in4 = parseFloat(self.vue.posts[post_idx].res4) + 1;
		else self.vue.in4 = self.vue.posts[post_idx].res4;
		
		//self.vue.in1 = self.vue.in1 + self.vue.posts[post_idx].res1;
		//self.vue.in2 = self.vue.in2 + self.vue.posts[post_idx].res2;
		//self.vue.in3 = self.vue.in3 + self.vue.posts[post_idx].res3;
		//self.vue.in4 = self.vue.in4 + self.vue.posts[post_idx].res4;
		
		 console.log('survey' + self.vue.in1 + self.vue.in2 + self.vue.in3 + self.vue.in4);
		 console.log('survey' + self.vue.posts[post_idx].id);
		 
	    $.post(iterate_totals_url, 
            {
				survey_id: self.vue.posts[post_idx].id,
				input1: self.vue.in1,
				input2: self.vue.in2,
				input3: self.vue.in3,
				input4: self.vue.in4,
			},
			function (data) {
				$.web2py.enableElement($("#edit_post_submit"));
                self.vue.posts[post_idx].res1 = data.post.res1;
                self.vue.posts[post_idx].res2 = data.post.res2;
                self.vue.posts[post_idx].res3 = data.post.res3;
                self.vue.posts[post_idx].res4 = data.post.res4;
				self.vue.in1 = 0;
				self.vue.in1 = 0;
				self.vue.in1 = 0;
				self.vue.in1 = 0;
                enumerate(self.vue.posts);
			});
			
	   
		$.post(submit_response_url,
            {
                survey_id: self.vue.posts[post_idx].id,
				opt1: self.vue.option1,
				opt2: self.vue.option2,
				opt3: self.vue.option3,
				opt4: self.vue.option4,
                email: self.vue.email,
            },
            function (data) {
                $.web2py.enableElement($("#add_post_submit"));
                self.vue.responses.unshift(data.post);
                
                //self.vue.question = "";
				self.vue.option1 = false;
				self.vue.option2 = false;
				self.vue.option3 = false;
				self.vue.option4 = false;
                enumerate(self.vue.responses);
            });
    };
	
    self.add_post = function () {
        // This function is called when we need to POST the form
        self.vue.is_adding_post = false;
        $.post(add_post_url,
            {
                question: self.vue.question,
				opt1: self.vue.opt1,
				opt2: self.vue.opt2,
				opt3: self.vue.opt3,
				opt4: self.vue.opt4,
                email: self.vue.email,
            },
            function (data) {
                $.web2py.enableElement($("#add_post_submit"));
                self.vue.posts.unshift(data.post);
                
                self.vue.question = "";
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
			responses: [],
            has_more: false,
            logged_in: false,
            is_adding_post: false,
            is_editing: false,
            question: null,
            edit_content: null,
            edit_post_id: null,
            email: null,
			opt1: null,
			opt2: null,
			opt3: null,
			opt4: null,
			option1: false,
			option2: false,
			option3: false,
			option4: false,
			option11: [],
			option22: [],
			option33: [],
			option44: [],
			in1: 0,
			in2: 0,
			in3: 0,
			in4: 0,
			chartId: [],
			cshChartId: [],
			inputData: [],
			
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
			get_responses: self.get_responses,
			submit_response: self.submit_response,
			create_chart_inputs: self.create_chart_inputs,
			renderPieChart: self.renderPieChart,
			
        }

    });

    self.get_posts();
	//self.get_responses();
    $("#vue-div").show()
    return self;
};

var APP = null;
var inputData = [{label:"Category 1",value:25},{label:"Category 2",value:12},{label:"Category 3",value:35},{label:"Category 4",value:30},{label:"Category 5",value:18}];
var colorScheme = ["#E57373","#BA68C8","#7986CB","#A1887F","#90A4AE","#AED581","#9575CD","#FF8A65","#4DB6AC","#FFF176","#64B5F6","#00E676"];

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
