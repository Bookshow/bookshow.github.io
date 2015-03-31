(function (window) {

'use strict';
var $ = window.jQuery;

var PricingModel = function () {
	this.criteria = {};
	this._total = 0;
};
window.inherit(PricingModel, window.DataModel);

PricingModel.prototype.recalculate = function () {
	var cr = this.criteria,
		x = (cr.a ? 1000 : 0) + (cr.b ? 2000 : 0) + (cr.c ? 3000 : 0),
		y = 1 + (cr.d ? -0.1 : 0) + (cr.e ? -0.2 : 0) + (cr.f ? -0.3 : 0),
		z = (cr.g ? 100 : 0) + (cr.h ? 200 : 0) + (cr.i ? 300 : 0),
		total = x * y + z;
	if (total == this._total)
		return;
	this.trigger('total', this._total = total);
};

PricingModel.prototype.toggle = function (key) {
	this.set(key, !this.criteria[key]);
};

PricingModel.prototype.set = function (key, value) {
	if (value == this.criteria[key])
		return;
	this.criteria[key] = value;
	this.trigger('criterion', { key: key, value: value });
	//this.recalculate();
};

$(function () {
	var model = window.pricingModel = new PricingModel(),
		elemMap = {},
		totalElem = $('#pricing .u-total')[0];
	
	$('#pricing .u-criterion').each(function () {
		elemMap[$(this).data('value')] = this;
	});
	
	$('#pricing')
	.on('click', '.u-criterion', function () {
		model.toggle($(this).data('value'));
	})
	.on('click', '.u-submit', function () {
		model.recalculate();
	});
	
	model
	.on('criterion', function (data) {
		var elem = elemMap[data.key];
		if (!elem)
			return;
		$(elem)[data.value ? 'addClass' : 'removeClass']('selected');
	})
	.on('total', function (value) {
		totalElem.innerHTML = '' + value + '元起';
	});
});
	
})(this);