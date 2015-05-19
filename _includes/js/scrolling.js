(function (window) {

'use strict';
var $ = window.jQuery,
	scrolling = false,
	i = 0;

function setScrolling(value, callback) {
	if (scrolling == value)
		return;
	callback(window.scrolling = scrolling = value);
}

function listen(callback) {
	$(window.document).on('scroll', function () {
		setScrolling(true, callback);
		i++;
		setTimeout(function () {
			if (!--i)
				setScrolling(false, callback);
		}, window.scrollingCoolDown || 300);
	});
}

$(function () {
	var $markings = $('[data-spy="scrolling"]');
	if ($markings.length) {
		listen(function (scrolling) {
			$markings[scrolling ? 'addClass' : 'removeClass']('scrolling');
		});
	}
});

})(this);
