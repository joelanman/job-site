$(function(){

	var $jobTemplate = $($('#jobTemplate').html()),
		$jobs = $('#jobs');

	$("body").on("click", "#jobsNext", function(e){
	
		e.preventDefault();
	
		var $this = $(this);
	
		var url = $this.attr('href');
		
		console.log('url: ' + url);
				
		$.get(url, function(data){
		
			console.log(data);
		
			var jobs = data.jobs;
			
			$this.attr('href', data.nextHref);
			
			jobElements = [];
			
			for (var i = 0; i <jobs.length; i++){
			
				var job = jobs[i];
				
				var $job = $jobTemplate.clone();
				
				$job.find('.jobTitle').text(job.title);
				
				console.log('job: ' + job.title);
				
				jobElements.push($job);
			
			}
			
			$jobs.append(jobElements);
			
		});
	});

});
