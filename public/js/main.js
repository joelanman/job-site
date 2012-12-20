
String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

$(function(){

	var search = {
		url		: "/api/jobs/search",
		filters : {
			'keywords':'',
			'location':'',
			
			'salaryfrom': null,
			'salaryto': null,
			
			'perm': null,
			'temp': null,
			'contract': null,
			
			'fulltime': null,
			'parttime': null,
			
			'sortby': 'DisplayDate'
		},
		getJobs : function(){
		
			var title = "";
			
			$('#jobs').fadeTo(200, 0.5);
			
			var types = {
				'perm': 	this.filters.perm,
				'temp': 	this.filters.temp,
				'contract': this.filters.contract,
				
				'fulltime': this.filters.fulltime,
				'parttime': this.filters.parttime
			}
			
			var titleCheck = function(title, prop, name){
			
				for (var i in types){
				
					if (types[i] && i != prop){
						return title;
					}
				
				}
				
				if (types[prop]){
					return name;
				} else {
					return title;
				}
				
			}
			
			title = titleCheck(title, 'temp', 'Temp ');
			title = titleCheck(title, 'contract', 'Contract ');
			title = titleCheck(title, 'parttime', 'Part-time ');
					
			if (this.filters.keywords){
				title += this.filters.keywords + " jobs";
			} else {
				if (title){
					title += "jobs";
				} else {
					title += "Jobs";
				}
			}
			
			
			if (this.filters.location)
				title += " in " + this.filters.location.toTitleCase();
					
			$('#resultsTitle').text(title);
			
			if (this.filters.keywords){
				$('#resultsInner .sort').show();
			} else {
				this.filters.sortby = 'DisplayDate';
				$('#resultsInner .sort a').removeClass('selected');
				$('#resultsInner .sort a.date').addClass('selected');
				$('#resultsInner .sort').hide();
			}
				
			console.log('getting jobs...');	
			$.get(this.url, this.filters, function(data){
				console.log(data);
				$jobs.empty();
				$('#jobs').fadeTo(0,1);
				drawJobs(data);
				$('#resultsInner').scrollTop(0);
				getSuggestions();
				//getSalaryCounts();
			});
		}
	};
	
	search.filters.keywords = $('#searchWrap .keywords').val();
	search.filters.location = $('#searchWrap .location').val();
	
	var $jobTemplate = $($('#jobTemplate').html()),
		$suggestionTemplate = $($('#suggestionTemplate').html()),
		
		$jobs = $('#jobs'),
		$suggestions = $('.suggestions');
		
	drawJobs = function(data){
	
		console.log('drawing jobs...');
		
		var jobs = data.jobs;
		
		//$('#jobsNext').attr('href', data.nextHref);
						
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
			$job.find('.excerpt').html(job.excerpt);
						
			jobElements.push($job);
		
		}
		
		$jobs.append(jobElements);
		
		initAutoLoad(data.nextHref);
	};
	
	$('#searchWrap .keywords').change(function(){
		console.log("change keyword");
		
		var $this = $(this);
		
		if ($this.val() != search.filters[$this.attr('name')]){
		
			search.filters.keywords = $this.val();
			search.getJobs();
		}
	});
	
	$('#searchWrap .location').change(function(){
		console.log("change location");
		
		var $this = $(this);
		
		if ($this.val() != search.filters[$this.attr('name')]){
		
			search.filters.location = $this.val();
			search.getJobs();
		}
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
			$this.change();
		}, 400);
	});	
	
	$('#searchWrap input').keydown(function(e){

		if (e.keyCode == 13){
			e.preventDefault();
			return false;
		}
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
    
	$("body").on("click", "#collapseTypesHours a", function(e){
		
		$(this).toggleClass('selected');
		
		var typeLabels = [];
		
		$('#collapseTypesHours a').each(function(){
			var $this = $(this),
				name = $this.attr('data-name'),
				selected = $this.hasClass('selected');
			
			if (selected) {
				search.filters[name] = true;
				typeLabels.push($this.text());
			} else {
				search.filters[name] = null;
			}
							
		});
		
		if (typeLabels.length){
			var typeLabel = typeLabels.join(", ") + " jobs";
		} else {
			var typeLabel = "Any job type";
		}
		
		$('#toggleTypesHours .label').text(typeLabel);
		
		search.getJobs();
		
	});
	
	$("body").on("click", "#resultsInner .sort a", function(e){
		
		if ($(this).hasClass('selected') == false){
		
			$('#resultsInner .sort a').removeClass('selected');
		
			$(this).addClass('selected');
		
			search.filters.sortby = $(this).attr('data-value');
		
			search.getJobs();
		
		}
		
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
	
	var hideControlPanel = function(e){
	
		if ($(e.target).closest('#controlPanel').length == 0 && $("#controlPanel").is(":visible")){		
			console.log("hiding control panel");
			$('#controlPanel').fadeOut(100);
			$("body").unbind("click.hideControlPanel");
		}
	};
	
	$("body").on("click", "#controlPanelBtn", function(e){
		if ($("#controlPanel").is(":hidden")){
			e.preventDefault();
			console.log("showing control panel");
			$("#controlPanel").fadeIn(100, function(){
				$("body").on("click.hideControlPanel", hideControlPanel);
			});
		}
	});
	
	$("body").on("click", "#scrollToTop a", function(e){
		
		$('#resultsInner').animate({scrollTop:0});
		
	});
	
	var $lastJob = null,
		autoLoadURL = null;
	
	var checkScroll = function(){
	
		if ($lastJob){
		
			if ($lastJob.position().top < $('#resultsInner').innerHeight()){
	
				console.log($lastJob.position().top + ", " + $('#resultsInner').innerHeight());
		
				$('#resultsInner').unbind('scroll.autoload');
				$(window).unbind('resize.autoload');
	
				var url = "/api/jobs/search?url=" + autoLoadURL;

				console.log('autoloading ' + url);
					
				$.get(url, function(data){

					drawJobs(data);

				});
			}
		}
	};
	
	var processOptions = function(options){
	
		var optionsClass = "";
		
		for (var name in options){
		
			var value = options[name];
			
			optionsClass += name + value + " ";
			
			// set input state
			var $input = $('input[name=' + name + '][value=' + value +']');
			$input.attr('checked', true);
			
			// set label state
			$('input[name=' + name + ']').closest('label').removeClass('selected');
			$input.closest('label').addClass('selected');
		}
				
		$('#options').attr('class', optionsClass);
		checkScroll();
	}
	
	$("#controlPanel").on("click touch", ".option", function(e){
						
		var options = {};
		
		$('#controlPanel .option:checked').each(function(){
			var $this = $(this);
			options[$this.attr('name')] = $this.val();
		});
		
		processOptions(options);
		
		localStorage["options"] = JSON.stringify(options);
		
	});
	
	var options = localStorage["options"];
	
	options = (typeof(options) == "string") ? JSON.parse(options) : {};
	
	// defaults
	
	var defaults = {
	
		searchLayout: "Top",
		jobsLayout:   "Rows",
		excerpts:	  "On"
	
	};
	
	for (i in defaults){
		if (!options[i])
			options[i] = defaults[i];
	}
	
	processOptions(options);
	
	var getSuggestions = function(){
		$.get('/api/jobs/suggestions?keywords='+search.filters.keywords, function(data){
			console.log(data);
			var suggestions = data.suggestions,
				suggestionElements = [];
			$suggestions.fadeOut(200, function(){
				$(this).empty();
							for (var i = 0; i<suggestions.length; i++){
					var $suggestion = $suggestionTemplate.clone();
					$suggestion.find('a').text(suggestions[i]);
					suggestionElements.push($suggestion);
				}
				$suggestions.append(suggestionElements);
				$suggestions.fadeIn(200);
			});
		
		});
	};
	
	var getSalaryCounts = function(){
		
		var query = $.extend(true, {}, search.filters);
		
		delete query.salaryfrom;
		delete query.salaryto;
		
		$.get(search.url, query, function(data){
			console.log(data);
			
			var salaryCounts = data.filterData.salaryCounts;
		
			for (var i=0; i<salaryCounts.length; i++){
				$('#salaryGraph .col' + (i+1)).height(salaryCounts[i].relative *20);
			}
		});
	};
		
	var initAutoLoad = function(url){
	
		autoLoadURL = url;
	
		console.log("init Autoload for " + autoLoadURL);
	
		$('#resultsInner').unbind('scroll.autoload');
		$(window).unbind('resize.autoload');
		
		if (autoLoadURL){
		
			$('#jobsWrap .loading').show();
			$lastJob = $('#jobs .job').last();
					
			$('#resultsInner').bind('scroll.autoload', checkScroll);
			$(window).bind('resize.autoload', checkScroll);
			
			checkScroll();
			
		} else {
		
			$('#jobsWrap .loading').hide();
			
		}
	
	}
	
	var $resultsInner = $('#resultsInner');
	
	$resultsInner.bind('scroll.showScrollToTop', function(){
		
		if ($resultsInner.scrollTop() > $resultsInner.innerHeight()){
		
			$('#scrollToTop').fadeIn();
			
		} else {
		
			$('#scrollToTop').fadeOut();
			
		}
	});
		
	$('body').on('click', '.suggestions a', function(e){
		e.preventDefault();
		$('#searchWrap .keywords').val($(this).text()).change();
	});
		
	$('body').on('click', '.toggle', function(e){
	
		e.preventDefault();
		
		var id = this.id.replace('toggle','');
		
		var $collapse = $('#collapse'+id);
		
		var hideCollapse = function(){
			console.log("hiding collapse "+ id);
			$collapse.hide();
			$("body").unbind('click.'+ id);
		}
		
		if ($collapse.is(':hidden')){
		
			$('#collapse'+id).show();
		
			$('body').on('click.'+ id, function(e){
				if ($(e.target).closest('#collapse'+id).length == 0){		
					hideCollapse();
				}
			});
		
		} else {
			hideCollapse();
		}
		
	});

	search.getJobs();
	
	var opts = {
	  lines: 8, // The number of lines to draw
	  length: 7, // The length of each line
	  width: 4, // The line thickness
	  radius: 8, // The radius of the inner circle
	  corners: 0, // Corner roundness (0..1)
	  rotate: 0, // The rotation offset
	  color: '#000', // #rgb or #rrggbb
	  speed: 1, // Rounds per second
	  trail: 60, // Afterglow percentage
	  shadow: false, // Whether to render a shadow
	  hwaccel: true, // Whether to use hardware acceleration
	  className: 'spinner', // The CSS class to assign to the spinner
	  zIndex: 2e9, // The z-index (defaults to 2000000000)
	};
	var target = $('#jobsWrap .loading')[0];
	var spinner = new Spinner(opts).spin(target);
	
});
