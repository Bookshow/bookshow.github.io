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
	.on('click', 'u-submit', function (e) {
		post(self);
		e.preventDefault();
		// TODO: effect
		setTimeout(function () {
			self.hide();
		}, 500);
	})
	.on('click', '.u-cancel', function (e) {
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
