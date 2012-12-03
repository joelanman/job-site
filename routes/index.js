var  request = require('request'),
	 $ = require('jquery'),
	 url = require('url');

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}

var scrapeJobs = function(body){

	var begin = body.indexOf('<body'),
		end   = body.indexOf('</body') + 6;
	body = body.substring(begin, end);
									
	var $body = $(body);
	
	var $jobs = $body.find(".job");
		
	var jobs = [];
	
	$jobs.each(function(){

		var $this = $(this),
			$title = $this.find("h3 a");

		var titleFulltext = $title.text(),
			maxLength = 52;

		if(titleFulltext.length < maxLength){
			var title = titleFulltext;
		} else {
			for (var i = maxLength; i>0; i--){
				if (titleFulltext[i] == ' '){
					var title = titleFulltext.substring(0, i) + ' ...';
					break;
				}
			}
		}

		jobs.push({
			title: title,
			url: $title.attr('href'),
			salary: $this.find('.salary').text().replace(' per annum',''),
			location: $this.find('.location').text().replace('London, South East England','London'),
			applications: $this.find('.appCount').text(),
			date: $this.find('.date').text().replace('Date: ', '') 
		});
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
					'body':		body};
	
	return (jobsData);
	
};


exports.init = function(app){

	app.get('/', function(req,res){

		var start = Date.now();
		
		var search = {'keywords': req.query.keywords || "",
					  'location': req.query.location || ""};
		
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

	app.get('/api/jobs', function(req,res){
	
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
			
			var jobsData = scrapeJobs(body);
			
			console.log("rendering", Date.now() - start);
			
    		res.writeHead(200, { 'Content-Type': 'application/json' });   
			
			res.write(JSON.stringify({'jobs': 	  jobsData.jobs,
									  'prevHref': encodeURIComponent(jobsData.prevHref),
									  'nextHref': encodeURIComponent(jobsData.nextHref)
									  }));
									  //,'body': 	  jobsData.body}));
			res.end();
						
		})
	});

};
