// swipe event //
(function (window) {

'use strict';
var $ = window.jQuery;

var threshold = 50;

var $doc = $(window.document),
	startX, startY, 
	moving = false;

$doc
.on('touchstart', function (e) {
	var touches = e.originalEvent.touches;
	if (!touches || touches.length != 1)
		return;
	
	startX = touches[0].pageX;
	startY = touches[0].pageY;
	moving = true;
})
.on('touchmove', function (e) {
	if (!moving)
		return;
	var touches = e.originalEvent.touches;
	if (!touches || touches.length != 1)
		return;
	
	var deltaX = touches[0].pageX - startX,
		deltaY = touches[0].pageY - startY;
	
	// TODO: wrap more information
	if (deltaY > threshold)
		$doc.trigger('swipedown');
	else if (deltaY < -threshold)
		$doc.trigger('swipeup');
	else if (deltaX > threshold)
		$doc.trigger('swiperight');
	else if (deltaX < -threshold)
		$doc.trigger('swipeleft');
	else
		return; // skip marking moving false
	
	moving = false;
});

})(this);



// discrete scrolling //
(function (window) {

'use strict';
var $ = window.jQuery,
	$win = $(window),
	$doc = $(window.document),
	$body;

// TODO: check IE 8

var noSwipe = false,
	sections = [];

function syncSection() {
	for (var i = 0, $secs = $('section'), len = $secs.length; i < len; i++) {
		sections.push({ elem: $secs[i] });
	}
}

function syncSectionPosition() {
	for (var i = 0, len = sections.length, sec; i < len; i++) {
		sec = sections[i];
		sec.offset = sec.elem.offsetTop;
	}
}

function syncSize() {
	var winw = $(window).width(),
		winh = $(window).height();
	noSwipe = winh < 700 || winh >= 1400 || winw < 700 ||
		(winh < 970 && winw < 992);
	syncSectionPosition();
}

function scrollTo(offset, current) {
	if (!$.support.transition) {
		$win.scrollTop(offset);
		return;
	}
	
	current = current || $win.scrollTop(); // be robust
	
	$body.css({
		'margin-top': (offset - current) + 'px',
		'transition': 'none'
	});
	$win.scrollTop(offset);
	//$body.css('transition', '1000ms ease');
	window.document.offsetWidth; // jshint ignore:line, reflow
	// this triggers transition
	$body.css({
		'margin-top': 0,
		'transition': '1000ms ease'
	});
}

function goto(section, currentOffset) {
	if (!section)
		return;
	scrollTo(section.offset, currentOffset);
}

function up() {
	var currentOffset = $win.scrollTop();
	for (var i = sections.length - 1, sec; i > -1; i--) {
		sec = sections[i];
		if (sec.offset < currentOffset) {
			goto(sec, currentOffset);
			return;
		}
	}
}

function down() {
	var currentOffset = $win.scrollTop();
	for (var i = 0, len = sections.length, sec; i < len; i++) {
		sec = sections[i];
		if (sec.offset > currentOffset) {
			goto(sec, currentOffset);
			return;
		}
	}
}

function first() {
	goto(sections[0]);
}

function last() {
	goto(sections[sections.length - 1]);
}

$doc
.on('swipeup', function () {
	if (noSwipe)
		return;
	up();
})
.on('swipedown', function () {
	if (noSwipe)
		return;
	down();
})
.on('keydown', function (e) {
	var tagName = e.target.tagName.toLowerCase();
	if (tagName == 'input' || tagName == 'textarea')
		return;
	switch (e.which) {
		case 38: // up
			e.preventDefault();
			up();
			break;
		case 40: // down
			e.preventDefault();
			down();
			break;
		case 32: // spacebar
			e.preventDefault();
			down();
			break;
		case 33: // page up
			e.preventDefault();
			up();
			break;
		case 34: // page down
			e.preventDefault();
			down();
			break;
		case 36: // home
			e.preventDefault();
			first();
			break;
		case 35: // end
			e.preventDefault();
			last();
			break;
	}
});

// aggregate syncSize

$(function () {
	
	// body is not ready earlier
	$body = $(window.document.body);
	
	syncSection();
	syncSize();
	$win.resize(syncSize);
});

})(this);
