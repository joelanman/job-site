var  request = require('request'),
	 $ = require('jquery'),
	 url = require('url');

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}


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
			
			var begin = body.indexOf('<body'),
				end   = body.indexOf('</body') + 6;
			body = body.substring(begin, end);
															
			console.log("Doc loading", Date.now() - start);
			
			var $body = $(body);
			
			var $jobs = $body.find(".job");
			
			var jobs = [];
			
			$jobs.each(function(){
				jobs.push({
					title: $(this).find("h3 a").text()
				});
			});
			
			console.log("rendering", Date.now() - start);
			
			res.render('results', {'jobs': jobs, search: search});
			
		})

	});

};
