function PhotoDisplay(modal) {
	var self = this,
		$elem = this.$elem = $(modal),
		dialog = $elem.find('.modal-dialog')[0];
	this.image = $elem.find('#photo-display-image')[0];
	
	function resize() {
		dialog.style.maxWidth = $(window).width() + 'px';
		dialog.style.maxHeight = $(window).height() + 'px';
	}
	
	resize();
	
	// TODO: smarter sizing
	// TODO: on browser window resize call it
	
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

var thumbnail_pattern = /(.+)_s(\.\w+)/;

function getOriginalURL(src) {
	var matches = thumbnail_pattern.exec(src);
	return matches ? matches[1] + matches[2] : src;
}

$(function () {
	
	var display = new PhotoDisplay('#photo-display');
	
	// scan over page to inject href on thumbnail
	// TODO
	
	// intercept thumbnail image click
	$(document).on('click', '.photo-flow > *', function (e) {
		display.show(e.currentTarget);
		e.preventDefault();
	});
	
});