(function (window) {

'use strict';
var $ = window.jQuery;

function PhotoDisplay(modal) {
	var self = this,
		$elem = this.$elem = $(modal),
		image = this.image = $elem.find('#gallery-display-image')[0];
	
	function syncSize() {
		var winw = $(window).width(),
			winh = $(window).height(),
			maxw = winw > 800 ? Math.floor(winw * 0.9) : winw - 80,
			maxh = winh > 800 ? Math.floor(winh * 0.9) : winh - 80;
		image.style.maxWidth = maxw + 'px';
		image.style.maxHeight = maxh + 'px';
	}
	
	syncSize();
	$(window).resize(syncSize);
	
	$elem.on('click', function () {
		self.hide();
	});
}

PhotoDisplay.prototype = {
	show: function (elem) {
		if (this.$elem.is(':visible'))
			return;
		this.image.src = getOriginalURL(elem);
		this.$elem.modal('show');
	},
	hide: function () {
		this.$elem.modal('hide');
	}
};

function getOriginalURL(elem) {
	return $(elem).data('uri') || elem.src || elem.href;
}
/*
var thumbnail_pattern = /(.+)_[sml](\.\w+)/;

var getOriginalURL = function (src) {
	var matches = thumbnail_pattern.exec(src);
	return matches ? matches[1] + '_1920' + matches[2] : src;
};
*/

$(function () {
	
	var display = new PhotoDisplay('#gallery-display-modal');
	
	// intercept thumbnail image click
	$(window.document).on('click', '[data-function="gallery"]', function (e) {
		display.show(e.currentTarget);
		e.preventDefault();
	});
	
});

})(this);
