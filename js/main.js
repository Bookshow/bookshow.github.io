// browser agent //
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



// scrolling //
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



// sync window size //
/*
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
	$('section.vertical-center')
		.wrapInner('<div class="table-like"><div></div></div>');
	
	syncSize();
	$(window).resize(syncSize);
});

})(this);
*/



// photo display //
(function (window) {

'use strict';
var $ = window.jQuery;

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

$(function () {
	
	var display = new PhotoDisplay('#photo-display-modal');
	
	// scan over page to inject href on thumbnail
	// TODO
	
	// intercept thumbnail image click
	$(window.document).on('click', '.photo-flow > *', function (e) {
		display.show(e.currentTarget);
		e.preventDefault();
	});
	
});

})(this);



// contact us //
(function (window) {

'use strict';
var $ = window.jQuery,
	POST_URL = 'https://docs.google.com/forms/d/1z-40GH2UeMEyx8koeGtv-rdTc_pmEZ1dk-JOJUC4I28/formResponse',
	PRICING_ENTRY_NAME = 'entry.2022360728';

function ContactUsModal(modal) {
	var self = this,
		$elem = this.$elem = $(modal);
	
	this.pricingInfoContainer = $elem.find('.u-pricing')[0];
	
	$elem
	.on('click', 'input[type=submit]', function (e) {
		post(self);
		e.preventDefault();
		setTimeout(function () {
			self.hide();
		}, 500);
	})
	.on('click', '.modal-body', function (e) {
		e.stopPropagation();
	})
	.on('click', function () {
		self.hide();
	});
}

function post(modal) {
	var pricing = window.pricingModel,
		data = {};
	modal.$elem.find('[name^="entry."]').each(function () {
		data[this.name] = this.value;
	});
	if (pricing)
		data[PRICING_ENTRY_NAME] = pricing.confirmedCriteriaSummary;
	$.post(POST_URL, data);
}

ContactUsModal.prototype.show = function () {
	this.$elem.modal('show');
};

ContactUsModal.prototype.hide = function () {
	this.$elem.modal('hide');
};

$(function () {
	
	var modal = window.contactUsModal = new ContactUsModal('#contact-us-modal');
	
	window.contactUs = function () {
		modal.show();
	};
	
	// intercept contact-us page link
	/*
	$(window.document).on('click', function (e) {
		if (e.currentTarget.ahref != '/contact')
			return;
		
		modal.show();
		e.preventDefault();
	});
	*/
	
});

})(this);
