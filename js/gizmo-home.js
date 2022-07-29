$(document).ready(function(){

	// set vars from selectors
    const pausePlay = $("#pause_play");

	const $turbine = $('#turbine'),
		$turbineHub = $('#turbine_hub'),
		$wheel = $('#wheel'),
		$pinions	= $(".pinion"),
		$worms	= $(".worm"),
		$coggedGear = $('#cogged_gear'),
		$lever = $('#lever'),
		$ratchet = $('#ratchet'),
		$stamper = $('#stamper'),
		$products = $('.product');

	// set ratios
	var turbineCycle = 3; // 3
	var turbineWheelRatio = 5; 
	// pulley wheel turns once when the turnbine turns five times
	var wheelCycle = turbineCycle * turbineWheelRatio;
	// console.log(" -- wheelCycle: " + wheelCycle);
	var wheelWormRatio = .25; 
	// the worm shaft turns 6 teeth to 24 = 1/4
	var wormCycle = wheelCycle * wheelWormRatio;
	// console.log(" -- wormCycle: " + wormCycle);
	// if wheel cyle is 15 secs, the worm 360 is 3.75
	// one sixth of that shoud be pinion tooth cycle
	// and the delay should be one third of that (since three positions)
	var pinionDelayFudgeFactor = .0083334;
	// var pinionDelay = wormCycle/18 - pinionDelayFudgeFactor; // .15  - pinionDelayFudgeFactor
	var pinionDelay = wormCycle/18; // .15  - pinionDelayFudgeFactor
	// console.log(" -- pinionDelay: " + pinionDelay);
	// durration can't be longer than delay -- looks messey if it is
	var pinionDuration =  0; // 0 pinionDelay/2; //.1
	var wormCogRatio = 24;
	// worm has to turn 24 times for one cog turn
	var cogCycle = wormCycle * wormCogRatio;
	// console.log(" -- cogCycle: " + cogCycle);
	// lever jumps 12 times per one cog rotation
	var leverCycle = cogCycle/12;
	// var leverCycle = 7.5;
	// console.log(" -- leverCycle: " + leverCycle);
	// leverCylcle includes downTime and upTime
	var leverUpTime = .3;
	var leverDownTime = leverCycle - leverUpTime;

	// constants for adjustments
	var ratchetExtended = -10;
	var ratchetRetracted = -70;
	var stampTop = 3;

	// set up timelines

	// first timeline inside setup() function
	function setup() {
	  // instantiate timeline
	  const tl = new TimelineMax();
	  // set initial
	  tl.set($pinions.filter(":gt(0)"), {autoAlpha: 0}) // leaves 0 visible
	    .set($worms.filter(":gt(0)"), {autoAlpha: 0})
	    .set($turbine, {transformOrigin: 'center center'})
	    .set($wheel, {transformOrigin: 'center center'})
	    .set($coggedGear, {transformOrigin: 'center center'})
	    .set($lever, {transformOrigin: '162 46'})
	    .set($ratchet, {rotation: ratchetExtended, transformOrigin: '8 8'})
	    .set($stamper, {y: stampTop})
	    .set($products, {autoAlpha: 0}); // , x: 760, y: 1515, 
	  
	  // return timeline
	  return tl;
	}

	// wheels
	function spinWheels() {
		var tl = new TimelineMax(0);

		tl.to($turbine, turbineCycle, {rotation: -360, ease: Power0.easeNone, repeat:-1})
		.to($wheel, wheelCycle, {rotation: '-=360', ease: Power0.easeNone, repeat:-1}, 0)
		.to($coggedGear, cogCycle, {rotation: '+=360', ease: Power0.easeNone, repeat:-1}, 0);

		return tl;
	}

	// turn pinion -- cel flopping
	function flopPinion() {
		var tl = new TimelineMax({repeat:-1}, 0); 
		// fade 0th pin after delay
		tl.to($pinions.eq(0), pinionDuration, {delay:pinionDelay, autoAlpha: 0})
			// while at the same time bringing up the next
			.fromTo( $pinions.eq(1), pinionDuration, {autoAlpha: 0}, {autoAlpha: 1})
			// 2nd transition, delay before starting
			.to($pinions.eq(1), pinionDuration, {delay:pinionDelay, autoAlpha: 0})
			.fromTo( $pinions.eq(2), pinionDuration, {autoAlpha: 0}, {autoAlpha: 1})
			// 3rd transition
			.to($pinions.eq(2), pinionDuration, {delay:pinionDelay, autoAlpha: 0})
			.fromTo( $pinions.eq(0), pinionDuration, {autoAlpha: 0}, {autoAlpha: 1});

		return tl;
	}

	// turn worm gear
	function flopWorm() {
		var tl = new TimelineMax({repeat:-1}); // {repeat:-1, delay:wormCycle}
		// loop throgh all worm cels except last
		for (i = 0; i < ($worms.length - 1); i++) { 
		    // fade 0th worm after delay
			tl.to($worms.eq(i), pinionDuration, {delay:pinionDelay, autoAlpha: 0});
			// while at the same time bringing up the next
			tl.fromTo( $worms.eq(i+1), pinionDuration, {autoAlpha: 0}, {autoAlpha: 1});
		}
		// transition from last cel to first
		tl.to($worms.eq($worms.length), pinionDuration, {delay:pinionDelay, autoAlpha: 0});
		tl.fromTo( $worms.eq(0), pinionDuration, {autoAlpha: 0}, {autoAlpha: 1});

		return tl;
	}

	// lever
	function pushLever() {
		var tl = new TimelineMax({repeat:-1}, 0); // {paused:true}
		// extend ratchet, raise stamper, rock lever slowly counterclockwise
		tl.set($ratchet, {rotation: ratchetExtended}) // extend ratchet
			// raise stamper
			// .to($stamper, leverDownTime, {y: '-=25px', ease:Power0.easeNone }) 
			// rock lever slowly counterclockwise
			.to($lever, leverDownTime, { rotation:-12, ease:Power0.easeNone}, 0)
			// return ratchet
			.to($ratchet, .2, {delay:.1, rotation: ratchetRetracted}, "leverUp")
			// // make lever return to next tooth 
			.to($lever, leverUpTime, { rotation:0, ease:Power0.easeNone}, "leverUp");
		return tl;
	}

	// raise stamper
	function raiseStamp() {
		var tl = new TimelineMax(0); // {repeat:-1}, {paused:true}
		// raise stamper
		// when included in pushLever, above, it restarts from it's 0 position each time
		tl.to($stamper, leverDownTime, {y: '-=25px', ease:Power0.easeNone })
			.to($stamper, leverDownTime, {delay:leverUpTime, y: '-=25px', ease:Power0.easeNone })
			// .to($stamper, leverDownTime, {delay:leverUpTime, y: '-=25px', ease:Power0.easeNone })
			// .to($stamper, leverDownTime, {delay:leverUpTime, y: '-=25px', ease:Power0.easeNone })
			// .to($stamper, leverDownTime, {delay:leverUpTime, y: '-=25px', ease:Power0.easeNone })
			.to($stamper, leverUpTime, {y: stampTop, ease:Power0.easeNone })
			// .set( $product_1, {autoAlpha: 1} ) 
			// .set( $products[0], {autoAlpha: 1} ) 
			// call separate product timeline
			.call(startProduct)
			.call(stopMaster);
			// kill master timeline

		return tl;
	}

	// product conveyor belt
	// function moveProduct() {
	function startProduct() {
		// pick random number
		var prodNum = Math.floor((Math.random() * 6)); //  + 1
		// console.log(" -- prodNum: " + prodNum);
		TweenLite.set($products[prodNum], {autoAlpha: 1});
		TweenMax.to($products[prodNum], 7, {x: "2000px", ease:Linear.easeNone} );
	}

	// instantiate master timeline
	var master = new TimelineMax();
	// nest and call functions with timelines
	// add labels for better master timeline control

	master.add(setup())
		.add(spinWheels(), 0)
		.add(pushLever(), 0) 
		.add(flopPinion(), 0) 
		.add(flopWorm(), 0) 
		.add(raiseStamp(), 0); 		

	function stopMaster() {
		resetButton();
		master.kill();
	}

	function resetButton() {
        // pauseBtn.html("restart");   		
        pausePlay.attr("alt","restart") 
        pausePlay.attr("src","/static/images/play-idle.gif") 	
	}

	function restartMaster() {
		// reset product positions
		// doesn't seem to be taken care of by restart
		TweenLite.set($products, {x: 760, y: 1515, autoAlpha: 0}); // , autoAlpha: 0
		master.restart();
	}

	// handle control buttons
    pausePlay.click(function(){
    	// console.log("-- pausePlay");
    	// console.log("-- src: " + this.src);
    	// console.log("-- alt: " + this.alt);
    	var altContent = this.alt;

    	if (altContent == "pause") {
	        master.pause();
	        // this.src("/static/images/play-idle.gif"); 
	        $(this).attr("src","/static/images/play-idle.gif") 
	        $(this).attr("alt","resume") 
    	} else if (altContent == "restart") {
	        // setMaster();
	        // master.restart();
	        restartMaster();

	        // pausePlay.html("pause");   		
	        $(this).attr("src","/static/images/pause-idle.gif");
	        $(this).attr("alt","pause");
    	} else { // it already says resume
	        master.resume();
	        // pausePlay.html("pause");   	
	        $(this).attr("src","/static/images/pause-idle.gif");
	        $(this).attr("alt","pause");
    	}
    });

	pausePlay.hover(
		function(event){ 
			if (this.alt == "pause") {
		        $(this).attr("src","/static/images/pause-hover.gif") 				
			} else { // must be resume or restar
		        $(this).attr("src","/static/images/play-hover.gif") 				
			}
		}, function(event){
			if (this.alt == "pause") {
		        $(this).attr("src","/static/images/pause-idle.gif") 				
			} else { // must be resume or restar
		        $(this).attr("src","/static/images/play-idle.gif") 				
			}
		}
	);

	$turbineHub.hover(
		function(event){ 
			master.timeScale(2);
		}, function(event){
			master.timeScale(1);
		}
	);


}); // end doc ready
