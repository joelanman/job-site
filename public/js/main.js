$(function(){

	var search = {
		filters : {},
		getJobs : function(){
			
			var url = "/api/jobs/search";
		
			console.log('url: ' + url);
				
			$('#jobs').fadeTo(200, 0.5);
			$.get(url, this.filters, function(data){
				console.log(data);
				$jobs.empty();
				drawJobs(data);
				$('#jobs').fadeTo(0,1);
			});
		}
	};
	
	search.filters.keywords = $('#searchWrap .keywords').val();
	search.filters.location = $('#searchWrap .location').val();
	
	var $jobTemplate = $($('#jobTemplate').html()),
		$jobs = $('#jobs');
		
	drawJobs = function(data){
		console.log(data);
		
		var jobs = data.jobs;
		
		$('#jobsNext').attr('href', data.nextHref);
				
		jobElements = [];
		
		for (var i = 0; i <jobs.length; i++){
		
			var job = jobs[i];
			
			var $job = $jobTemplate.clone();
			
			$job.find('.link').attr('href', job.url);
			$job.find('.jobTitle').text(job.shortTitle);
			$job.find('.jobTitle').attr('data-title', job.title);
			$job.find('.salary').text(job.salary);
			$job.find('.location').text(job.location);
			$job.find('.applications').text(job.applications);
			$job.find('.date').text(job.date);
			
			console.log('job: ' + job.title);
			
			jobElements.push($job);
		
		}
		
		$jobs.append(jobElements);
		
	};
	
	$('#searchWrap .keywords').change(function(){
		search.filters.keywords = $(this).val();
		search.getJobs();
	});
	
	$('#searchWrap .location').change(function(){
		search.filters.location = $(this).val();
		search.getJobs();
	});
	
	var keyDelay = null;
	
	$('#searchWrap input').keyup(function(){
		
		var $this = $(this);
		
		if (keyDelay){
			console.log("clearing timeout "+keyDelay);
			clearTimeout(keyDelay);
		}
	
		keyDelay = setTimeout(function(){
			$this.change();
		}, 1000);
	});

	$("#salarySlider").slider({
        range: true,
        min: 0,
        max: 100000,
        step: 1000,
        values: [ 0, 100000 ],
        slide: function( event, ui ) {
            $("#filtersWrap .salaryLabel").text("£" + ui.values[ 0 ] + " - £" + ui.values[ 1 ] );
        }
    });
    
    $("#salarySlider").on( "slidechange", function(event, ui) {
    	console.log(ui.values);
    	search.filters.salaryfrom = ui.values[0];
    	search.filters.salaryto = ui.values[1];
    	search.getJobs();
    });
    
	$("body").on("click", "#jobsNext", function(e){
	
		e.preventDefault();
	
		var $this = $(this);
	
		var url = "/api/jobs/search?url=" + $this.attr('href');
		
		console.log('url: ' + url);
				
		$.get(url, function(data){
		
			drawJobs(data);
			
		});
	});

	$("body").on("click", ".job .link", function(e){

		e.preventDefault();

		$('#jobViewInner .jobTitle').text($(this).find('.jobTitle').attr('data-title'));
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
