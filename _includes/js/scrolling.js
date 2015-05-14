(function (window) {

'use strict';
var $ = window.jQuery,
	scrolling = false,
	i = 0;

function setScrolling(value) {
	if (scrolling == value)
		return;
	window.scrolling = scrolling = value;
	$(window.document.body)[value ? 'addClass' : 'removeClass']('scrolling');
}

setScrolling(false);

$(window.document).on('scroll', function () {
	setScrolling(true);
	i++;
	setTimeout(function () {
		if (!--i)
			setScrolling(false);
	}, window.scrollingCoolDown || 300);
});

})(this);
