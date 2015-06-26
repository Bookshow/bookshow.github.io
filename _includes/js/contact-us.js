(function (window) {

'use strict';
var $ = window.jQuery,
	_keys,
	_url = 'https://docs.google.com/forms/d/1sI8tiy27t7zhtEWxjBl0UW4_GxPwnDXS1lQKC2aIqQg/formResponse';

_keys = {
	interests: 'entry.1838500567',
	title: 'entry.127812295',
	email: 'entry.1647649882',
	phone: 'entry.1584983621',
	question: 'entry.1625641888',
	spec: 'entry.917982981',
	price: 'entry.1145397837',
	id: 'entry.1123496740'
};

function ContactUsModal(modal) {
	var self = this,
		$elem = this.$elem = $(modal);
	
	this.$flipper = $elem.find('.flipper');
	
	$elem
	.on('click', '.u-submit', function (e) {
		post(self);
		e.preventDefault();
		flip(self, true);
	})
	.on('click', '.u-close', function (e) {
		e.stopPropagation();
		self.hide();
	})
	.on('click', '.modal-body', function (e) {
		e.stopPropagation();
	})
	.on('click', function () {
		self.hide();
	});
}

window.ContactUsModal = ContactUsModal;

ContactUsModal.prototype.config = {
	url: _url,
	keys: _keys
};

function post(modal) {
	var pricing = window.pricingModel,
		keys = modal.config.keys,
		interests = [],
		data = {};
	
	modal.$elem.find('[name]').each(function () {
		var name = this.name,
			key = keys[name];
		if (!key)
			return;
		if (name == 'interests' && this.checked) {
			interests.push(this.value);
		} else {
			data[key] = this.value;
			window.console.log(this.value);
			window.console.log(this.innerHTML);
		}
	});
	if (interests.length)
		data[keys.interests] = interests.join();
	
	if (pricing && pricing._total) {
		data[keys.spec] = pricing.confirmedCriteriaSummary;
		data[keys.price] = pricing._total;
	}
	if (window.appid) {
		data[keys.id] = window.appid;
	}
	
	$.post(modal.config.url, data);
}

function flip(modal, value) {
	modal.$flipper[value ? 'addClass' : 'removeClass']('flipped');
}

ContactUsModal.prototype.show = function () {
	this.$elem.modal('show');
};

ContactUsModal.prototype.hide = function () {
	this.$elem.modal('hide');
	flip(this, false);
};

$(function () {
	
	var modal = window.contactUsModal = new ContactUsModal('#contact-us-modal');
	
	window.contactUs = function () {
		modal.show();
	};
	
	$(window.document).on('click', '[data-toggle="contact-us"]', function (e) {
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
