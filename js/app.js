function PhotoDisplay(modal) {
	var self = this,
		$elem = this.$elem = $(modal),
		dialog = $elem.find('.modal-dialog')[0];
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

var thumbnail_pattern_1 = /(.+)_s(\.\w+)/;
var thumbnail_pattern_2 = /(.+)_m(\.\w+)/;
var thumbnail_pattern_3 = /(.+)_l(\.\w+)/;


function getOriginalURL(src) {
	var matches_1 = thumbnail_pattern_1.exec(src);
	var matches_2 = thumbnail_pattern_2.exec(src);
	var matches_3 = thumbnail_pattern_3.exec(src);
	// return matches ? matches[1] + matches[2] : src;
	if      (matches_1){return matches_1[1] +"_1920"+ matches_1[2];}
	else if (matches_2){return matches_2[1] +"_1920"+ matches_2[2];}
	else if (matches_3){return matches_3[1] +"_1920"+ matches_3[2];}
	else return returnURL;

	/*
	var returnURL = matches ? matches[1] +"_1920"+ matches[2] : src;
	var matches = thumbnail_pattern_2.exec(returnURL);
	var returnURL = matches ? matches[1] +"_1920"+ matches[2] : returnURL;
	var matches = thumbnail_pattern_3.exec(returnURL);
	var returnURL = matches ? matches[1] +"_1920"+ matches[2] : returnURL;
    return returnURL;
    */
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