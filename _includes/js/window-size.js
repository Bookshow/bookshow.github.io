(function (window) {

'use strict';
var $ = window.jQuery;

function syncSize() {
	if (!window.browser || !window.browser.ios)
		return; 
	var winh = $(window).height();
	$('section.full').css('height', winh + 'px');
}

$(function () {
	// TODO: don't rely on JS here
	$('section.vertical-center')
		.wrapInner('<div class="table-like"><div></div></div>');
	
	syncSize();
	$(window).resize(syncSize);
});

})(this);
