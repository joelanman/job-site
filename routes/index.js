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

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var scrapeJobs = function(body){

	//console.log(body);

	var data = JSON.parse(body);
		
	var results = data.results,
		jobs = [];
	
	for ( var i=0; i< results.length; i++){
	
		var job = results[i];
		var	title = job.jobTitle,
			excerpt = job.jobDescription;
			
		//console.log(JSON.stringify(job));
		//console.log(title);

		var title = title.trim(),
			maxTitleLength = 50;
		
		// GET RID OF ALL CAPS
		if (title == title.toUpperCase()) {
			title = title.toTitleCase();
		}

		// truncate title to max length
		
		var truncate = function(string, maxLength){
		
			var truncated = string;
				
			if (string.length > maxLength){
				for (var i=maxLength; i>0; i--){
					if (string[i] == ' ' || string[i] == ','){
						var truncated = string.substring(0, i) + ' ...';
						break;
					}
				}
			}
			return truncated;
		}
		
		var shortTitle = truncate(title, 50);
		var excerpt = truncate(excerpt, 240);
		
		if (excerpt == excerpt.toUpperCase()) {
			excerpt = excerpt.toTitleCase();
		}
		console.log("excerpt: "+excerpt);

		jobs.push({
			shortTitle: shortTitle,
			title: title,
			url: job.jobId,
			salary: (job.minimumSalary && job.minimumSalary) ? "£" + addCommas(job.minimumSalary) + " - £" + addCommas(job.maximumSalary) : "Salary negotiable",
			location: job.locationName.replace('London, South East England','London'),
			applications: Math.round(Math.random()*100),
			date: job.expirationDate,
			excerpt: excerpt
		});
	}
	
	// filters
	
	/*$filters = $body.find('#mainFacets');
	
	$salaryCountElements = $filters.find('.salary .count');
	
	var salaryCounts = [],
		maxCount = 0;
	
	$salaryCountElements.each(function(){
		var count = Number($(this).text().replace(/[(),]/g,''));
		salaryCounts.push({'absolute': count});
		if (count > maxCount)
			maxCount = count;
	});
	
	for (var i=0; i<salaryCounts.length; i++){
		salaryCounts[i].relative = salaryCounts[i].absolute/maxCount;
	}
	
	console.log(jobs.length + " jobs found");
	
	var $pager = $body.find('.pager');
	
	var $prev = $pager.find('.selected').prev();
	
	var prevHref = $prev.length > 0 ? $prev.attr('href') : "";
	
	var $next = $pager.find('.next').closest('a');
	
	var nextHref = $next.length > 0 ? $next.attr('href') : "";
	
	console.log("prevHref: " + nextHref);
	console.log("nextHref: " + nextHref);
	*/
	
	var jobsData = {'jobs': 	jobs,
					'totalResults': data.totalResults,
					'nextHref': 'moop',
					'prevHref': 'moop',
					'filterData' : {'salaryCounts': []},
					'body':		body};
	
	return (jobsData);
	
};


exports.init = function(app){

	app.get('/', function(req,res){

		var start = Date.now();
		
		var search = {'keywords': req.query.keywords || "",
					  'location': req.query.location || ""};
		res.render('results', {search: search});
		/*						   
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
*/
	});

	app.get('/api/jobs/search', function(req,res){
	
		console.log("---- search...");
		
		var start = Date.now();
		
		var pathname = req.query.url;
		
		var reqUrl = url.parse("http://29D95958-0849-4185-A02C-6C9E22DEFB23:@www.reed.co.uk/");
		
		if (!pathname){
		
			reqUrl.pathname = "api/1.0/search";
			reqUrl.query = {};
			
			if (req.query.keywords)
				reqUrl.query.keywords = req.query.keywords.toUpperCase();
				
			if (req.query.location)
				reqUrl.query.locationName = req.query.location;
				
			if (req.query.salaryfrom)
				reqUrl.query.minimumSalary = req.query.salaryfrom;
				
			if (req.query.salaryto)
				reqUrl.query.maximumSalary = req.query.salaryto;
				
			if (req.query.perm)
				reqUrl.query.permanent = req.query.perm;
				
			if (req.query.temp)
				reqUrl.query.temp = req.query.temp;
				
			if (req.query.contract)
				reqUrl.query.contract = req.query.contract;
				
			if (req.query.parttime)
				reqUrl.query.parttime = req.query.parttime;
				
			if (req.query.fulltime)
				reqUrl.query.fulltime = req.query.fulltime;
				
			if (req.query.resultsToSkip)
				reqUrl.query.resultsToSkip = req.query.resultsToSkip;
			
			reqUrl.query.resultsToTake = '20';
			reqUrl.query.format = 'json';
		
			//if (reqUrl.query.keywords != "" && !reqUrl.query.sortby)
			//	reqUrl.query.sortby = 'KeywordRelevance';
			
		} else {
				
			reqUrl.pathname = pathname;
		
		}
		
		var uri = url.format(reqUrl);
			
		console.log("making request ", Date.now() - start);
		
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
									  'totalResults': jobsData.totalResults
									  }));
									  //,'body': 	  jobsData.body}));
			res.end();
						
		})
	});

	app.get('/api/jobs/view', function(req,res){
	
		var start = Date.now();
		
		var pathname = req.query.url;
		
		console.log("---- view: " + pathname);
		
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

			job.description = $body.find('#jobdescription').html();
			
			console.log("rendering", Date.now() - start);
			
    		res.writeHead(200, { 'Content-Type': 'application/json' });   
			
			res.write(JSON.stringify({'job': job
									  }));
									  //,'body': 	  jobsData.body}));
			res.end();
						
		})
	});
	
	app.get('/api/jobs/suggestions', function(req,res){
	
		var start = Date.now();
		
		var keywords = req.query.keywords;
				
		console.log("---- getting suggestions for: " +keywords);
		
		var reqUrl = url.parse("http://www.indeed.co.uk");
		
		reqUrl.pathname = '/jobs';
		reqUrl.query = {'q': keywords};
		
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

			//console.log(body);

			var $jobtitleElements = $body.find('#TITLE_rbo a');
			
			var suggestions = [];
			
			$jobtitleElements.each(function(){
				suggestions.push($(this).text());
			});
			
			console.log("rendering", Date.now() - start);
			
    		res.writeHead(200, { 'Content-Type': 'application/json' });   
			
			res.write(JSON.stringify({'suggestions': suggestions.slice(0,8)
									  }));
									  //,'body': 	  body}));
			res.end();
						
		})
	});

};
