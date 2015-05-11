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
/*
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
*/



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
	POST_URL = 'https://docs.google.com/forms/d/1z-40GH2UeMEyx8koeGtv-rdTc_pmEZ1dk-JOJUC4I28/formResponse';

var keys = {
	products: 'entry.522962378',
	title: 'entry.1085887891',
	email: 'entry.114982204',
	phone: 'entry.2139636067',
	question: 'entry.1779758370',
	spec: 'entry.2022360728',
	price: 'entry.2112899564'
};

function ContactUsModal(modal) {
	var self = this,
		$elem = this.$elem = $(modal);
	
	$elem
	.on('click', 'input[type=submit]', function (e) {
		post(self);
		e.preventDefault();
		// TODO: effect
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
		products = [],
		data = {};
	
	modal.$elem.find('[name]').each(function () {
		var name = this.name,
			key = keys[name];
		if (!key)
			return;
		if (name == 'products' && this.checked) {
			products.push(this.value);
		} else {
			data[key] = this.value;
		}
	});
	if (products.length)
		data[keys.products] = products.join();
	
	if (pricing) {
		data[keys.spec] = pricing.confirmedCriteriaSummary;
		data[keys.price] = pricing._total;
	}
	
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
	
	$(window.document).on('click', '[data-function="contact-us"]', function (e) {
		modal.show();
		e.preventDefault();
	});
	// intercept contact-us page link?
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



/* tab extension*/
(function (window) {

'use strict';
var $ = window.jQuery;

function showLI(li) {
	if (!li)
		return;
	$(li.querySelector('[role="tab"]')).tab('show');
}

$(window.document).on('click', '[role="navigator"]', function (e) {
	var elem = e.currentTarget,
		$elem = $(elem),
		type = $elem.data('toggle'),
		target = $elem.data('target'); // TODO: or href
	target = $(target)[0];
	if (!target || !type)
		return;
	
	var currentLI = target.querySelector('.active');
	if (type == 'previous') {
		showLI(currentLI && currentLI.previousElementSibling);
		
	} else if (type == 'next') {
		showLI(currentLI && currentLI.nextElementSibling);
	}
	e.preventDefault();
});

})(this);