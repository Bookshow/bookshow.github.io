(function (window) {

'use strict';
var $ = window.jQuery;

// model //
var _scheme = {
	'單機': {
		base: 20000
	}, 
	'副機': {
		base: 8000
	}, 
	'擷取': {
		base: 8000
	}, 
	'直播': {
		base: 10000
	}, 
	'十場': {
		multiplier: -0.1
	}, 
	'五場': {
		multiplier: -0.05
	}, 
	'預付': {
		multiplier: -0.05
	}, 
	'後付': {
		multiplier: 0.1
	}, 
	'急件': {
		addon: 5000
	}, 
	'檢勘': {
		addon: 12000
	}, 
	'網路': {
		addon: 8000
	}, 
	'延日': {
		unit: true,
		addon: 200
	}, 
	'順稿': {
		unit: true,
		addon: 3000
	}, 
	'字幕': {
		unit: true,
		addon: 5000
	}
};
var keys = Object.keys(_scheme);
var PricingModel = window.PricingModel = function () {
	var sw = this.switches = {},
		val = this.values = {};
	keys.forEach(function (k) {
		sw[k] = false;
		val[k] = 1;
	});
	this._total = 0;
};
window.inherit(PricingModel, window.DataModel);
PricingModel.scheme = _scheme;

function summarize(model) {
	var sch = PricingModel.scheme, 
		sw = model.switches,
		val = model.values,
		crs = [], 
		v;
	keys.forEach(function (k) {
		if (sch[k].unit) {
			if (sw[k] && (v = val[k]) > 0)
				crs.push(k + 'x' + v);
		} else {
			if (sw[k])
				crs.push(k);
		}
	});
	return crs.join();
}

PricingModel.prototype.recalculate = function () {
	var sch = PricingModel.scheme,
		sw = this.switches,
		val = this.values,
		bases = 0,
		multipliers = 1,
		addons = 0,
		m, v, total;
	
	keys.forEach(function (k) {
		m = sch[k];
		v = !sw[k]? 0 : m.unit ? val[k] : 1;
		bases += (m.base || 0) * v;
		multipliers += (m.multiplier || 0) * v;
		addons += (m.addon || 0) * v;
	});
	total = bases * multipliers + addons;
	
	this.confirmedCriteriaSummary = summarize(this);
	if (total == this._total)
		return;
	this.trigger('total', this._total = total);
};

PricingModel.prototype.toggle = function (key) {
	this.setSwitch(key, !this.switches[key]);
};

PricingModel.prototype.setSwitch = function (key, value) {
	if (keys.indexOf(key) < 0 || value == this.switches[key])
		return;
	this.switches[key] = value;
	this.trigger('switch', { key: key, value: value });
	//this.recalculate();
};

PricingModel.prototype.plus = function (key) {
	if (keys.indexOf(key) < 0)
		return;
	this.setValue(key, this.values[key] + 1);
};

PricingModel.prototype.minus = function (key) {
	if (keys.indexOf(key) < 0)
		return;
	this.setValue(key, Math.max(1, this.values[key] - 1));
};

PricingModel.prototype.setValue = function (key, value) {
	if (keys.indexOf(key) < 0 || value == this.values[key])
		return;
	this.values[key] = value;
	this.trigger('value', { key: key, value: value });
	//this.recalculate();
};



// component //
function getCriterionKey(element) {
	var cr = $(element).closest('.u-criterion')[0];
	return cr && $(cr).data('value');
}

var PricingForm = function (element, model) {
	var $element = $(element),
		criterionElems = {},
		valueElems = {},
		totalElem = $element.find('.u-total')[0];
	
	// register
	$element.find('.u-criterion').each(function () {
		var key = $(this).data('value');
		if (!key)
			return;
		criterionElems[key] = this;
		valueElems[key] = $(this).find('.u-value')[0];
	});
	
	$element
	.on('click', '.u-criterion > .u-checkbox', function () {
		model.toggle(getCriterionKey(this));
	})
	.on('click', '.u-criterion .u-plus', function () {
		model.plus(getCriterionKey(this));
	})
	.on('click', '.u-criterion .u-minus', function () {
		model.minus(getCriterionKey(this));
	})
	.on('click', '.u-submit', function () {
		model.recalculate();
	});
	
	model
	.on('switch', function (data) {
		var elem = criterionElems[data.key];
		if (!elem)
			return;
		$(elem)[data.value ? 'addClass' : 'removeClass']('selected');
	})
	.on('value', function (data) {
		var elem = valueElems[data.key];
		if (!elem)
			return;
		elem.innerHTML = '' + data.value;
		$(criterionElems[data.key])[data.value == 1 ? 'addClass' : 'removeClass']('lower-bounded');
	})
	.on('total', function (value) {
		totalElem.innerHTML = '' + value;
	});
};

$(function () {
	var model = window.pricingModel = new PricingModel();
	new PricingForm('#pricing', model);
});
	
})(this);