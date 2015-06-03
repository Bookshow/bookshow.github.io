(function (window) {

'use strict';
var $ = window.jQuery;

// model //
var _scheme, keys, 
	_defaultBase = 20000; // 單機
_scheme = {
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
		exclusives: ['五場'],
		multiplier: -0.1
	}, 
	'五場': {
		exclusives: ['十場'],
		multiplier: -0.05
	}, 
	'標付': {
		exclusives: ['預付', '後付'],
		defaultsTo: '標付'
	}, 
	'預付': {
		exclusives: ['標付', '後付'],
		defaultsTo: '標付',
		multiplier: -0.05
	}, 
	'後付': {
		exclusives: ['標付', '預付'],
		defaultsTo: '標付',
		multiplier: 0.1
	}, 
	'檢勘': {
		addon: 12000
	}, 
	'網路': {
		addon: 8000
	}, 
	'順稿': {
		incremental: true,
		addon: 3000
	}, 
	'字幕': {
		incremental: true,
		addon: 5000
	}
};
keys = Object.keys(_scheme);

var PricingModel = window.PricingModel = function () {
	var sw = this.switches = {},
		val = this.values = {};
	keys.forEach(function (k) {
		sw[k] = false;
		val[k] = 1;
	});
	this._total = 0;
	//this.recalculate({ ga: false });
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
		if (sch[k].incremental) {
			if (sw[k] && (v = val[k]) > 0)
				crs.push(k + 'x' + v);
		} else {
			if (sw[k])
				crs.push(k);
		}
	});
	return crs.join();
}

PricingModel.prototype.recalculate = function (options) {
	var sch = PricingModel.scheme,
		sw = this.switches,
		val = this.values,
		bases = _defaultBase,
		multipliers = 1,
		addons = 0,
		m, total;
	
	keys.forEach(function (k) {
		m = sch[k];
		if (!sw[k])
			return;
		bases += m.base || 0;
		multipliers += m.multiplier || 0;
		addons += (m.addon || 0) * (m.incremental ? val[k] : 1);
	});
	total = bases * multipliers + addons;
	
	this.confirmedCriteriaSummary = summarize(this);
	if (total == this._total)
		return;
	if (!options || options.ga !== false) {
		// TODO: GA
	}
	this.trigger('total', this._total = total);
};

PricingModel.prototype.toggle = function (key) {
	this.setSwitch(key, !this.switches[key]);
};

PricingModel.prototype.setSwitch = function (key, value, escapeSideEffect) {
	if (keys.indexOf(key) < 0 || value == this.switches[key])
		return;
	var scheme = PricingModel.scheme[key],
		defaultsTo = scheme.defaultsTo;
	if (!escapeSideEffect && !value && defaultsTo == key)
		return;
	
	this.switches[key] = value;
	this.trigger('switch', { key: key, value: value });
	
	if (escapeSideEffect)
		return;
	
	// side effects
	if (value) {
		var exclusives = scheme.exclusives,
			self = this;
		if (exclusives) {
			exclusives.forEach(function (d) {
				self.setSwitch(d, false, true);
			});
		}
	} else {
		if (defaultsTo) {
			this.setSwitch(defaultsTo, true, true);
		}
	}
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
	.on('click', '.u-criterion > .u-button', function () {
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
	
	function updateTotal(value) {
		totalElem.innerHTML = '' + (value || '');
	}
	
	model
	.on('switch', function (data) {
		var elem = criterionElems[data.key];
		if (!elem)
			return;
		$(elem)[data.value ? 'addClass' : 'removeClass']('selected');
		updateTotal();
	})
	.on('value', function (data) {
		var elem = valueElems[data.key];
		if (!elem)
			return;
		elem.innerHTML = '' + data.value;
		$(criterionElems[data.key])[data.value == 1 ? 'addClass' : 'removeClass']('min');
		updateTotal();
	})
	.on('total', updateTotal);
	
	// init
	model.setSwitch('標付', true);
	//updateTotal(model._total);
};

$(function () {
	var model = window.pricingModel = new PricingModel();
	new PricingForm('#form', model);
});

})(this);
