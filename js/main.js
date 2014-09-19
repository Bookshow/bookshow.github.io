// browser //
(function (window) {

'use strict';
var $ = window.jQuery;

var ios = /(iPad|iPhone|iPod)/g.test(window.navigator.userAgent);

window.browser = {
	ios: ios
};

$(function () {
	if (ios)
		window.document.body.classList.add('ios');
});

})(this);



// main //
(function (window) {

'use strict';
var $ = window.jQuery;

// TODO: extract photo display component

function PhotoDisplay(modal) {
	var self = this,
		$elem = this.$elem = $(modal),
		image = this.image = $elem.find('#photo-display-image')[0];
	
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
		this.image.src = getOriginalURL(elem.src);
		this.$elem.modal('show');
	},
	hide: function () {
		this.$elem.modal('hide');
	}
};

var thumbnail_pattern = /(.+)_[sml](\.\w+)/;

var getOriginalURL = function (src) {
	var matches = thumbnail_pattern.exec(src);
	return matches ? matches[1] + '_1920' + matches[2] : src;
};

function syncSize() {
	if (!window.browser || !window.browser.ios)
		return; 
	var winh = $(window).height();
	$('section.full').css('height', winh + 'px');
}

$(function () {
	
	var display = new PhotoDisplay('#photo-display');
	
	$('section.vertical-center')
		.wrapInner('<div class="table-like"><div></div></div>');
	
	// scan over page to inject href on thumbnail
	// TODO
	
	syncSize();
	$(window).resize(syncSize);
	
	// intercept thumbnail image click
	$(document).on('click', '.photo-flow > *', function (e) {
		display.show(e.currentTarget);
		e.preventDefault();
	});
	
});

})(this);
