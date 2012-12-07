$(function(){

	var search = {
		filters : {},
		getJobs : function(){
		
			console.log('getting jobs...');
			
			var url = "/api/jobs/search";
		
			console.log('url: ' + url);
				
			$('#jobs').fadeTo(200, 0.5);
			$.get(url, this.filters, function(data){
				console.log(data);
				$jobs.empty();
				drawJobs(data);
				$('#jobs').fadeTo(0,1);
				$('#resultsInner').scrollTop(0);
			});
		}
	};
	
	search.filters.keywords = $('#searchWrap .keywords').val();
	search.filters.location = $('#searchWrap .location').val();
	
	var $jobTemplate = $($('#jobTemplate').html()),
		$jobs = $('#jobs');
		
	drawJobs = function(data){
		console.log('drawing jobs...');
		
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
						
			jobElements.push($job);
		
		}
		
		$jobs.append(jobElements);
		
	};
	
	$('#searchWrap .keywords').change(function(){
		console.log("change");
		search.filters.keywords = $(this).val();
		search.getJobs();
	});
	
	$('#searchWrap .location').change(function(){
		console.log("change");
		search.filters.location = $(this).val();
		search.getJobs();
	});
	
	var keyDelay = null;
	
	$('#searchWrap input').keyup(function(){
		
		console.log("keyup");
		var $this = $(this);
		
		if (keyDelay){
			console.log("clearing timeout "+keyDelay);
			clearTimeout(keyDelay);
		}
	
		keyDelay = setTimeout(function(){
			keyDelay = null;
			if ($this.val() != search.filters[$this.attr('name')]){
				$this.change();
			}
		}, 500);
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
    
    $("#salarySlider").on("slidechange", function(event, ui) {
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

		if ($(e.target).closest('#jobViewInner').length == 0){		
			e.preventDefault();
			$('#jobViewWrap').hide();
		}

	});
	
	$("body").on("click", "#controlPanelBtn", function(e){
		e.preventDefault();
		$("#controlPanelWrap").fadeIn();
	});
	
	$("#controlPanelWrap").on("click touch", function(e){

		if ($(e.target).closest('#controlPanel').length == 0){
		
			e.preventDefault();
			$('#controlPanelWrap').fadeOut();
			
		}

	});
	
	$("#controlPanel").on("click touch", ".option", function(e){
						
		var optionsClass = "";
		
		$('#controlPanel .option:checked').each(function(){
			var $this = $(this);
			var cssClass = $this.attr('name') + $this.val();
			optionsClass += cssClass + " ";
		});
		
		$('#options').attr('class', optionsClass);
		
	});

});
