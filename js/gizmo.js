$(document).ready(function(){

	// console.log(" -- got doc ready");

	const gWheel = $('#g-wheel'),
    gTurbine = $('#g-turbine'),
		gTurbineHub = $('#g-turbine_hub'),
		gCog = $('#g-cogged_gear'),
		gRatchet = $('#ratchet-gear');
		// replayButton = $('#replay');

	TweenLite.set(gWheel, {transformOrigin: 'center center'}); 
	TweenLite.to(gWheel, 5, {rotation: -270, ease: Power3.easeOut });
	gWheel.hover(
		function(event){ 
			TweenLite.to(gWheel, .3, {rotation: '-=45', ease: Power3.easeOut });
		}, function(event){
			TweenLite.to(gWheel, 3, {rotation: '+=270', ease: Power3.easeOut });
		}
	);

	TweenMax.set(gCog, {transformOrigin: 'center center'}); 
	const ctl = new TimelineMax(0);
	ctl.to(gCog, 50, {rotation: 360, ease: Power0.easeNone, repeat:15 });
	// mild speed bump for outer cog
	gCog.hover(
		function(event){ 
			// console.log(" -- over cog");
			ctl.timeScale(6);
		}, function(event){
			ctl.timeScale(1);
		}
	);

	// faster for inner ratchet gear
	gRatchet.hover(
		function(event){ 
			// console.log(" -- over ratchet");
			ctl.timeScale(16);
		}, function(event){
			ctl.timeScale(6);
		}
	);

	TweenLite.set(gTurbine, {transformOrigin: 'center center'}); 
	// TweenLite.to(gTurbine, 5, {rotation: -270, ease: Power3.easeOut });
	const ttl = new TimelineMax(0);
	ttl.to(gTurbine, 5, {rotation: -270, ease: Power4.easeOut });

  // gTurbine.hover(
	gTurbineHub.hover(
		function(event){ 
      // TweenLite.to(gTurbine, 3, {rotation: '+=270', ease: Power3.easeOut });
      TweenMax.to(gTurbine, 2, {rotation: '+=360', repeat:-1, ease: Power0.easeNone });
    }, function(event){
      // ttl.pause();
			TweenLite.to(gTurbine, 2, {rotation: '+=180', ease: Power3.easeOut });
		}
	);

	// slim pops
  $(document).on("click", ".pop_item", function(event){
    // console.log(" got to pop_item ");
    // $(".pop_item").on("click touchstart", function(event){
    event.preventDefault();
    // get href
    // use closest -- target may be image in dig deeper gallery

    var chosen_href = $(event.target).closest('a').attr('href');
    console.log(" -- href: " + chosen_href);
    
    // e.g. /project/impressions
    
    // if ($('.projects-grid-item[1]').is(":nth-child(2n)"))  {
      if ($('.mobile-logo').is(":visible"))  {
        console.log(" -- visible (aka mobile)");
        // use href as-is for full
        window.location.href = chosen_href;        
      } else {
        console.log(" -- not visible (aka desktop) ");
        
        // split href and add ajax
        // var href_split = chosen_href.split('/');    
        // // href_split[1] = project, about, [2] = impressions, juliet
        // var ajaxHref = "/" + href_split[1] + "/ajax/" + href_split[2];
        // console.log(" -- ajaxHref: " + ajaxHref);
        // var web_href = "https://dev.digitalgizmo.com/gizmo-assets/content/" + chosen_href;
        // console.log(" -- web_href: " + web_href);
        
        // slimPop(chosen_href, slimpopSizeClass);  
        // slimPop(ajaxHref, "project");  
        // slimPop(chosen_href, "project");  
      slimPop(chosen_href, "project");  
    }

  });

}); // end doc ready

/* 
*  used by popBox() and..
*/
function slimPop(theURL, sizeClass) { 
  // append divs if not present
  if (!$('#slimpop-overlay').length > 0) { // overlay html doesn't exist
    //create HTML markup for lightbox window
    var slimpopOverlay = 
    '<div id="slimpop-overlay" class="hidden"></div>' +
    '<div id="slimpop-container" class="hidden"></div>';
    //insert lightbox HTML into page
    $('body').append(slimpopOverlay);
    // assign close click to overlay
    $('#slimpop-overlay').click(function(event){
      hideBox();    
    });
  } else { // clear the container -- otherwise previous content flashes by
    $('#slimpop-overlay').html = " ";
  }
  // unhide overlay
  $('#slimpop-overlay').removeClass().addClass('unhidden');
  // assign contentDiv for further use
  var contentDiv = $('#slimpop-container');
  // contentDiv will be unhidden by specific classes 
  contentDiv.removeClass().addClass("slimpop-basic").addClass(sizeClass); 
  // call Ajax
  getURL(theURL, contentDiv);
  // handle locally
  // contentDiv.html('<div id="slimpop-wrapper">' + 
  // '<p>Don wuz here ' + '</p></div>')
}

	// close slim pop
  $(document).on("click", ".slimpop-close", function(event){
    event.preventDefault();
    hideBox()

  });


/* simple hide called by Close link in box, and by hideOverlay, below.
*/
function hideBox() {
  // test for existence of audioPlayer element - see Impressions
  // set var for div
  var contentDiv = $('#slimpop-container');
  // empty content div so it won't briefly show old content on new pop
  contentDiv.html = " ";  
  // hide box.. 
  contentDiv.removeClass().addClass('hidden');
  // ..and darkening overlay
  $('#slimpop-overlay').removeClass().addClass('hidden');

}

// ----------- AJAX ----------

// jQuery Ajax
function getURL(theURL, contentDiv) {
  //contentDiv.load(theURL);
  // using .get instead of .load so that I can catch errors, especially 404
  // requestData,?
  $.get(theURL, function(data) {  
    // console.log(' -- data: ' + data)
    contentDiv.html(
      '<div id="slimpop-wrapper">' + 
      '<p class="slimpop-close"><a href="/">close</a></p>' +
      data + '</div>' 
    );
    // console.log("--- attr name: " + contentDiv.attr('id'));
    // make sure we're scrolled to the top
    // in the case of full screen (mobile) the scroll has to operate on 
    // the whole windo
    if (contentDiv.attr('id') == 'fullpop_content_wrapper') {
      $(window).scrollTop( 0 );
    } else {
      contentDiv.animate({ scrollTop: 0 }, 0);    
    }
    // following callback wasn't needed since we're operating on the window.
    // contentDiv.html(data).promise().done(function(){
    //   // console.log(" -- success for html")
    //   // scrollTop works on window, not div
    //   $(window).scrollTop( 0 );
    // });
  }).fail(function(jqXHR) {
    contentDiv.html('<div id="slimpop-wrapper">' + '<p>SlimPop error: ' + 
      jqXHR.status + " -- " + jqXHR.responseText +  '</p></div>')
    .append(jqXHR.responseText);
  });
}
