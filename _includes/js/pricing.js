(function (window) {

'use strict';
var $ = window.jQuery;

// model //
var _scheme, optionKeys, courseKeys, paymentKeys;

_scheme = {
	values: {
		'拍攝': {
			init: 3,
			min: 3,
			max: 8
		},
		'順稿': {
			init: 1,
			min: 1
		},
		'字幕': {
			init: 1,
			min: 1
		}
	},
	modules: {
		'基本': {
			base: 17000,
			step: 3400
		},
		'直播': {
			base: 13000,
			step: 2600
		}, 
		'剪輯': {
			base: 8000,
			step: 1600
		}, 
		'精剪': {
			base: 18000,
			step: 3600
		}
	},
	courses: {
		'剪輯': ['基本', '剪輯'],
		'精剪': ['基本', '精剪'],
		'直播': ['基本', '直播'],
		'直播+剪輯': ['基本', '直播', '剪輯'],
		'直播+精剪': ['基本', '直播', '精剪']
	},
	payments: {
		'標付': 1, 
		'預付': 0.95,
		'後付': 1.1
	},
	options: {
		'雙主': {
			base: 6000
		}, 
		'加副': {
			base: 4000
		}, 
		'投影': {
			base: 5000
		}, 
		'檢勘': {
			external: 12000
		}, 
		'網路': {
			external: 8000
		}, 
		'順稿': {
			incremental: true,
			external: 3000
		}, 
		'字幕': {
			incremental: true,
			external: 5000
		}
	}
};
optionKeys = Object.keys(_scheme.options);
courseKeys = Object.keys(_scheme.courses);
paymentKeys = Object.keys(_scheme.payments);

var PricingModel = window.PricingModel = function () {
	var sw = this.switches = {};
	optionKeys.forEach(function (k) {
		sw[k] = false;
	});
	this.values = {};
	this._total = 0;
	//this.recalculate({ ga: false });
};
window.inherit(PricingModel, window.DataModel);
PricingModel.scheme = _scheme;

function summarize(model) {
	var sch = PricingModel.scheme, 
		ops = sch.options,
		sw = model.switches,
		val = model.values,
		crs = [], 
		v;
	optionKeys.forEach(function (k) {
		if (ops[k].incremental) {
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
		ops = sch.options,
		mds = sch.modules,
		sw = this.switches,
		val = this.values,
		hrs = val['拍攝'],
		base = 0,
		multipliers = sch.payments[this.payment] || 1,
		externals = 0,
		m, total;
	
	(sch.courses[this.course] || []).forEach(function (c) {
		m = mds[c];
		base += (m.base || 0) + (m.step || 0) * (hrs + 2);
	});
	optionKeys.forEach(function (k) {
		m = ops[k];
		if (!sw[k])
			return;
		base += (m.base || 0);
		externals += (m.external || 0) * (m.incremental ? val[k] : 1);
	});
	
	total = Math.round(base * multipliers + externals);
	
	this.confirmedCriteriaSummary = summarize(this);
	/*
	if (total == this._total)
		return;
	*/
	if (!options || options.ga !== false) {
		// TODO: GA
	}
	this.trigger('total', this._total = total);
};

PricingModel.prototype.setCourse = function (course) {
	if (courseKeys.indexOf(course) < 0 || course == this.course)
		return;
	this.trigger('course', this.course = course);
	//this.recalculate();
};

PricingModel.prototype.setPayment = function (payment) {
	if (paymentKeys.indexOf(payment) < 0 || payment == this.payment)
		return;
	this.trigger('payment', this.payment = payment);
	//this.recalculate();
};

PricingModel.prototype.toggleOption = function (key) {
	this.setOption(key, !this.switches[key]);
};

PricingModel.prototype.setOption = function (key, value) {
	if (optionKeys.indexOf(key) < 0 || value == this.switches[key])
		return;
	this.switches[key] = value;
	this.trigger('switch', { key: key, value: value });
	//this.recalculate();
};

PricingModel.prototype.plusValue = function (key) {
	if (!this.values[key])
		return;
	this.setValue(key, this.values[key] + 1);
};

PricingModel.prototype.minusValue = function (key) {
	if (!this.values[key])
		return;
	this.setValue(key, this.values[key] - 1);
};

PricingModel.prototype.setValue = function (key, value) {
	var sch = PricingModel.scheme.values[key],
		isMin, isMax;
	if (!sch)
		return;
	if (sch.min && (isMin = value <= sch.min))
		value = sch.min;
	if (sch.max && (isMax = value >= sch.max))
		value = sch.max;
	if (value == this.values[key])
		return;
	this.values[key] = value;
	this.trigger('value', {
		key: key, 
		value: value,
		min: isMin,
		max: isMax
	});
	//this.recalculate();
};

PricingModel.prototype.initialize = function () {
	this.setCourse('剪輯');
	this.setPayment('標付');
	
	var values = PricingModel.scheme.values,
		self = this;
	Object.keys(values).forEach(function (k) {
		self.setValue(k, values[k].init);
	});
};



// component //
function getKey(element) {
	var elem = $(element).closest('[data-key]')[0];
	return elem && $(elem).data('key');
}

function getGroup(element) {
	var grp = $(element).closest('[data-group]')[0];
	return grp && $(grp).data('group');
}

var PricingForm = function (element, model) {
	var $element = $(element),
		optionElems = {},
		intboxElems = {},
		valueElems = {},
		currCourseElem, currPaymentElem,
		totalElem = $element.find('.u-total')[0];
	
	// register
	$element.find('.u-option').each(function () {
		var key = $(this).data('key');
		if (!key)
			return;
		optionElems[key] = this;
	});
	$element.find('.u-intbox').each(function () {
		var key = $(this).data('key');
		if (!key)
			return;
		intboxElems[key] = this;
		valueElems[key] = $(this).find('.u-value')[0];
	});
	
	$element
	.on('click', '.u-option > .u-button', function () {
		var grp = getGroup(this),
			key = getKey(this),
			cmd = grp == 'courses' ? 'setCourse' :
				grp == 'payments' ? 'setPayment' : 'toggleOption';
		model[cmd](key);
	})
	.on('click', '.u-intbox .u-plus', function () {
		model.plusValue(getKey(this));
	})
	.on('click', '.u-intbox .u-minus', function () {
		model.minusValue(getKey(this));
	})
	.on('click', '.u-submit', function () {
		model.recalculate();
	});
	
	function updateTotal(value) {
		totalElem.innerHTML = '' + (value || '');
	}
	
	model
	.on('course', function (data) {
		var elem = optionElems[data];
		if (!elem || elem == currCourseElem)
			return;
		$(currCourseElem).removeClass('selected');
		$(currCourseElem = elem).addClass('selected');
		updateTotal();
	})
	.on('payment', function (data) {
		var elem = optionElems[data];
		if (!elem || elem == currPaymentElem)
			return;
		$(currPaymentElem).removeClass('selected');
		$(currPaymentElem = elem).addClass('selected');
		updateTotal();
	})
	.on('switch', function (data) {
		var elem = optionElems[data.key];
		if (!elem)
			return;
		$(elem)[data.value ? 'addClass' : 'removeClass']('selected');
		updateTotal();
	})
	.on('value', function (data) {
		var $elem = $(intboxElems[data.key]),
			valueElem = valueElems[data.key];
		if (valueElem)
			valueElem.innerHTML = '' + data.value;
		$elem[data.min ? 'addClass' : 'removeClass']('min');
		$elem[data.max ? 'addClass' : 'removeClass']('max');
		updateTotal();
	})
	.on('total', updateTotal);
	
	// init
	model.initialize();
	//updateTotal(model._total);
};

$(function () {
	var model = window.pricingModel = new PricingModel();
	new PricingForm('#body', model);
});

})(this);
