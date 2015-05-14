// OO utilty //
(function (window) {

'use strict';

window.inherit = function (X, Y) {
	X.prototype = new Y();
	X.prototype.constructor = X;
};

window.aggregator = function (f, delay) {
	var g = function (data) {
		g._cmds.push(data);
		setTimeout(function () {
			if (!g._cmds.length)
				return;
			var cmds = g._cmds;
			g._cmds = [];
			f(cmds);
		}, delay);
	};
	g._cmds = [];
	return g;
};

})(this);



// data model //
(function (window) {

'use strict';

function DataModel() {}

DataModel.prototype.on = function (name, handler) {
	if (name && (typeof handler === 'function')) {
		var handlers = this._handlers || (this._handlers = {});
		(handlers[name] || (handlers[name] = [])).push(handler);
	}
	return this;
};

DataModel.prototype.off = function (name, handler) {
	var handlers = this._handlers;
	if (!handlers || !name)
		return this;
	
	if (!handler) {
		delete handlers[name];
		
	} else {
		var hs = handlers[name];
		if (hs) {
			var i = hs.indexOf(handler);
			if (i > -1)
				hs.splice(i, 1);
		}
		if (!hs.length)
			delete handlers[name];
	}
	return this;
};

DataModel.prototype.trigger = function (name, data) {
	var handlers = this._handlers;
	if (!handlers || !name)
		return this;
	
	var hs = handlers[name];
	if (hs) {
		for (var i = 0, len = hs.length, h; i < len; i++) {
			h = hs[i];
			h(data);
		}
	}
	return this;
};

window.DataModel = DataModel;

})(this);
