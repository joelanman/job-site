var  request = require('request'),
	 $ = require('jquery'),
	 url = require('url');

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

var scrapeJobs = function(body){

	var begin = body.indexOf('<body'),
		end   = body.indexOf('</body') + 6;
	body = body.substring(begin, end);
									
	var $body = $(body);
	
	var $jobs = $body.find(".job");
		
	var jobs = [];
	
	$jobs.each(function(){

		var $this = $(this),
			$title = $this.find("h3 a"),
			excerpt = $this.find('.description').html();

		var title = $title.text().trim(),
			maxLength = 50;
		
		// GET RID OF ALL CAPS
		if (title == title.toUpperCase()) {
			title = title.toTitleCase();
		}

		// truncate to max length
		if (title.length < maxLength){
			var shortTitle = title;
		} else {
			for (var i = maxLength; i>0; i--){
				if (title[i] == ' '){
					var shortTitle = title.substring(0, i) + ' ...';
					break;
				}
			}
		}

		jobs.push({
			shortTitle: shortTitle,
			title: title,
			url: $title.attr('href'),
			salary: $this.find('.salary').text().trim().replace(' per annum',''),
			location: $this.find('.location').text().trim().replace('London, South East England','London'),
			applications: $this.find('.appCount').text().trim().replace(/ applications?/,''),
			date: $this.find('.date').text().trim().replace('Date: ', ''),
			excerpt: excerpt
		});
	});
	
	// filters
	
	$filters = $body.find('#mainFacets');
	
	$salaryCountElements = $filters.find('.salary .count');
	
	var salaryCounts = [];
	
	$salaryCountElements.each(function(){
		salaryCounts.push($(this).text().replace(/[(),]/g,''));
	});
	
	console.log(jobs.length + " jobs found");
	
	var $pager = $body.find('.pager');
	
	var $prev = $pager.find('.selected').prev();
	
	var prevHref = $prev.length > 0 ? $prev.attr('href') : "";
	
	var $next = $pager.find('.next').closest('a');
	
	var nextHref = $next.length > 0 ? $next.attr('href') : "";
	
	console.log("prevHref: " + nextHref);
	console.log("nextHref: " + nextHref);
	
	var jobsData = {'jobs': 	jobs,
					'nextHref': nextHref,
					'prevHref': prevHref,
					'filterData' : {'salaryCounts': salaryCounts},
					'body':		body};
	
	return (jobsData);
	
};


exports.init = function(app){

	app.get('/', function(req,res){

		var start = Date.now();
		
		var search = {'keywords': req.query.keywords || "",
					  'location': req.query.location || ""};
		
		if (search.keywords != "")
			search.sortby = 'KeywordRelevance';
		
		var reqUrl = url.parse("http://www.reed.co.uk/jobs");
		
		reqUrl.query = search;
		
		var uri = url.format(reqUrl);
		
		request({ uri: uri, timeout:5000 }, function (error, response, body) {

			if (error || response.statusCode !== 200) {
				console.log('Error:' + error);
				res.send(500);
				return;
			}

			// get info
			console.log("Scraping", Date.now() - start);
			
			var jobsData = scrapeJobs(body);
			
			console.log("rendering", Date.now() - start);
			
			res.render('results', {'jobs': jobsData.jobs,
								   search: search,
								   prevHref: encodeURIComponent(jobsData.prevHref),
								   nextHref: encodeURIComponent(jobsData.nextHref)});
			
		})

	});

	app.get('/api/jobs/search', function(req,res){
	
		var start = Date.now();
		
		var pathname = req.query.url;
		
		var reqUrl = url.parse("http://www.reed.co.uk");
		
		if (!pathname){
		
			reqUrl.pathname = "jobs";
			reqUrl.query = req.query;
			
			if (reqUrl.query.keywords != "")
				reqUrl.query.sortby = 'KeywordRelevance';
			
		} else {
				
			reqUrl.pathname = pathname;
		
		}
		
		var uri = url.format(reqUrl);
			
		console.log(uri);
		
		request({ uri: uri, timeout:5000 }, function (error, response, body) {

			if (error || response.statusCode !== 200) {
				console.log('Error:' + error);
				res.send(500);
				return;
			}

			// get info
			console.log("Scraping", Date.now() - start);
			
			var jobsData = scrapeJobs(body);
			
			console.log("rendering", Date.now() - start);
			
    		res.writeHead(200, { 'Content-Type': 'application/json' });   
			
			res.write(JSON.stringify({'jobs': 	    jobsData.jobs,
									  'prevHref':   encodeURIComponent(jobsData.prevHref),
									  'nextHref':   encodeURIComponent(jobsData.nextHref),
									  'filterData': jobsData.filterData,
									  }));
									  //,'body': 	  jobsData.body}));
			res.end();
						
		})
	});

	app.get('/api/jobs/view', function(req,res){
	
		var start = Date.now();
		
		var pathname = req.query.url;
		
		console.log(pathname);
		
		var reqUrl = url.parse("http://www.reed.co.uk");
		
		reqUrl.pathname = pathname;
		
		var uri = url.format(reqUrl);
		
		console.log(uri);
		
		request({ uri: uri, timeout:5000 }, function (error, response, body) {

			if (error || response.statusCode !== 200) {
				console.log('Error:' + error);
				res.send(500);
				return;
			}

			// get info
			console.log("Scraping", Date.now() - start);
			
			//var begin = body.indexOf('<body'),
			//	end   = body.indexOf('</body') + 6;
			//body = body.substring(begin, end);
											
			var $body = $(body);

			var job = {};

			//console.log(body);

			console.log($body.find('#jobdescription').length);

			job.description = $body.find('#jobdescription').html();
			
			console.log("rendering", Date.now() - start);
			
    		res.writeHead(200, { 'Content-Type': 'application/json' });   
			
			res.write(JSON.stringify({'job': job
									  }));
									  //,'body': 	  jobsData.body}));
			res.end();
						
		})
	});

};
