(function (window) {

'use strict';
var $ = window.jQuery,
	_keys,
	_url = 'https://docs.google.com/forms/d/1z-40GH2UeMEyx8koeGtv-rdTc_pmEZ1dk-JOJUC4I28/formResponse';

_keys = {
	products: 'entry.522962378',
	title: 'entry.1085887891',
	email: 'entry.114982204',
	phone: 'entry.2139636067',
	question: 'entry.1779758370',
	spec: 'entry.2022360728',
	price: 'entry.2112899564',
	id: 'entry.2135626992'
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
