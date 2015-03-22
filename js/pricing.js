(function (window) {

'use strict';
var $ = window.jQuery;

var PricingModel = function () {
	this._total = 0;
};
window.inherit(PricingModel, window.DataModel);

PricingModel.prototype.recalculate = function () {
	var x = (this.a ? 1000 : 0) + (this.b ? 2000 : 0) + (this.c ? 3000 : 0),
		y = 1 + (this.d ? -0.1 : 0) + (this.e ? -0.2 : 0) + (this.f ? -0.3 : 0),
		z = (this.g ? 100 : 0) + (this.h ? 200 : 0) + (this.i ? 300 : 0),
		total = x * y + z;
	if (total == this._total)
		return;
	this.trigger('total', this._total = total);
};

PricingModel.prototype.toggle = function (key) {
	this.set(key, !this[key]);
};

PricingModel.prototype.set = function (key, value) {
	if (value == this[key])
		return;
	this[key] = value;
	this.trigger('criterion', { key: key, value: value });
	//this.recalculate();
};

$(function () {
	var model = new PricingModel(),
		elemMap = {},
		totalElem = $('#pricing .u-total')[0];
	
	$('#pricing .u-criterion').each(function () {
		elemMap[$(this).data('value')] = this;
	});

	$('#pricing').on('click', '.u-criterion', function () {
		model.toggle($(this).data('value'));
	});

	$('#pricing').on('click', '.u-submit', function () {
		model.recalculate();
	});

	model.on('criterion', function (data) {
		var elem = elemMap[data.key];
		if (!elem)
			return;
		$(elem)[data.value ? 'addClass' : 'removeClass']('selected');
	});

	model.on('total', function (value) {
		totalElem.innerHTML = '' + value + '元起';
	});
});
	
})(this);