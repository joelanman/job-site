$(function(){

	var $jobTemplate = $($('#jobTemplate').html()),
		$jobs = $('#jobs');

	$("body").on("click", "#jobsNext", function(e){
	
		e.preventDefault();
	
		var $this = $(this);
	
		var url = "/api/jobs/search?url=" + $this.attr('href');
		
		console.log('url: ' + url);
				
		$.get(url, function(data){
		
			console.log(data);
		
			var jobs = data.jobs;
			
			$this.attr('href', data.nextHref);
			
			jobElements = [];
			
			for (var i = 0; i <jobs.length; i++){
			
				var job = jobs[i];
				
				var $job = $jobTemplate.clone();
				
				$job.find('.link').attr('href', job.url);
				$job.find('.jobTitle').text(job.title);
				$job.find('.salary').text(job.salary);
				$job.find('.location').text(job.location);
				$job.find('.applications').text(job.applications);
				$job.find('.date').text(job.date);
				
				console.log('job: ' + job.title);
				
				jobElements.push($job);
			
			}
			
			$jobs.append(jobElements);
			
		});
	});

	$("body").on("click", ".job .link", function(e){

		e.preventDefault();

		$('#jobViewInner .jobTitle').text($(this).find('.jobTitle').text());
		$('#jobDescription').text('Loading ...');
		$('#jobViewWrap').show();

		var url = "/api/jobs/view?url=" + $(this).attr('href');
		
		console.log('url: ' + url);
				
		$.get(url, function(data){

			console.log(data);
			$('#jobDescription').html(data.job.description);

		});

	});

	$("#jobViewWrap").on("click touch", function(e){

		e.preventDefault();

		if($(e.target).closest('#jobViewInner').length == 0)
			$('#jobViewWrap').hide();

	});

});
