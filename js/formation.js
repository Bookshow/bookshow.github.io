(function (window) {

'use strict';
var $ = window.jQuery;

var catalog = {
	desk: {
		cost: { desk: 1 }
	},
	chair: {
		cost: { chair: 1 }
	},
	d1c2: {
		subs: [
			{ type: 'desk', x: -10 },
			{ type: 'chair', x: 15, y: 15 },
			{ type: 'chair', x: 15, y: -15 }
		],
		cost: { desk: 1, chair: 2 }
	},
	c2: {
		subs: [
			{ type: 'chair', x: 5, y: 15 },
			{ type: 'chair', x: 5, y: -15 }
		],
		cost: { chair: 2 }
	},
	d2c4: {
		subs: [
			{ type: 'd1c2', y: -20, rotation: -90 },
			{ type: 'd1c2', y: 20, rotation: 90 }
		],
		cost: { desk: 2, chair: 4 }
	}
};

var types = Object.keys(catalog);

var storage = {
	desk: 16,
	chair: 50
};



function setElementRotation(elem, degree) {
	var r = 'rotate(' + (degree || 0) + 'deg)';
	$(elem).css({
		transform: r,
		'-webkit-transform': r
	});
}

function Warehouse(element, catalog, storage) {
	this.catalog = catalog;
	this.storage = storage;
	this.$element = $(element);
	this.element = this.$element[0];
	this.rotations = {};
	this.trays = {};
	this.counts = {};
	
	// render
	var self = this, 
		c, pool, tray, count;
	Object.keys(catalog).forEach(function (type) {
		c = catalog[type];
		pool = $('<div data-type="' + type + '" class="pool"></div>')[0];
		self.trays[type] = tray = $('<div class="tray draggable"></div>')[0];
		self.counts[type] = count = $('<div class="count"></div>')[0];
		$(tray).tooltip({ placement: 'bottom', title: 'Scroll to rotate.' });
		tray.appendChild(self.create(type, 'symbol'));
		pool.appendChild(tray);
		pool.appendChild(count);
		self.element.appendChild(pool);
	});
}

Warehouse.prototype.rotate = function (type, degree, add) {
	setElementRotation(this.trays[type], this.rotations[type] = 
		(360 + degree + ((add && this.rotations[type]) || 0)) % 360);
};

// TODO: may also take care of rotation
Warehouse.prototype.create = function (type, classes) {
	if (classes && typeof classes !== 'string') classes = classes.join(' ');
	classes = !classes || !classes.length ? '' : ' ' + classes;
	var elem = $('<span class="' + type + classes + '"></span>')[0],
		subs = (this.catalog[type] && this.catalog[type].subs) || [];
	for (var i = 0, sub, c, len = subs.length; i < len; i++) {
		sub = subs[i];
		c = this.create(sub.type, 'sub');
		$(c).css({
			left: (sub.x || 0) + 'px',
			top: (sub.y || 0) + 'px'
		});
		if (sub.rotation)
			setElementRotation(c, sub.rotation);
		elem.appendChild(c);
	}
	return elem;
};



function Room(element, warehouse) {
	this.warehouse = warehouse;
	this.$element = $(element);
	this.element = this.$element[0];
	this.objects = [];
	this.elems = {};
}

var _uuid = 0;
function uuid() {
	return _uuid++;
}

function normalize(obj) {
	return typeof obj === 'string' ? { type: obj } : obj._obj ? obj._obj : obj;
}

Room.prototype.set = function (obj) {
	obj = normalize(obj);
	var id = obj._id,
		isNew = id === undefined,
		elem = isNew ? (this.elems[id = obj._id = uuid()] = 
			this.warehouse.create(obj.type, 'draggable hide')) : this.elems[id], 
		$elem = $(elem);
	
	$elem.css({ left: (obj.x || 0) + 'px', top: (obj.y || 0) + 'px' });
	setElementRotation(elem, obj.rotation);
	
	if (isNew) {
		this.objects.push(elem._obj = obj);
		this.element.appendChild(elem);
	}
	$elem.removeClass('hide');
};

Room.prototype.remove = function (obj) {
	var i = this.objects.indexOf(obj = normalize(obj)),
		elem;
	if (i < 0)
		return;
	this.objects.splice(i, 1);
	// jshint boss: true
	if (elem = this.elems[obj._id]) {
		delete elem._obj;
		elem.remove();
	}
	delete this.elems[obj._id];
};

Room.prototype.clear = function () {
	this.$element.empty();
	this.objects = [];
	this.elems = {};
};

Room.prototype.load = function (state) {
	this.clear();
	var self = this;
	(state || []).forEach(function (obj) {
		delete obj._id; // TODO: better to remove when retrieving state
		self.set(obj);
	});
};

function setVisibility(room, obj, value) {
	$(room.elems[normalize(obj)._id])[value ? 'removeClass' : 'addClass']('hide');
}

Room.prototype.hide = function (obj) {
	setVisibility(this, obj, false);
};

Room.prototype.show = function (obj) {
	setVisibility(this, obj, true);
};

Room.prototype.getBound = function () {
	var $elem = this.$element,
		rect = $elem.offset();
	rect.right = rect.left + $elem.width();
	rect.bottom = rect.top + $elem.height();
	return rect;
};



function Dragger() {
	
	var self = this, 
		_dragging = false;
	Object.defineProperty(this, 'dragging', {
		get: function () {
			return _dragging;
		},
		set: function (value) {
			if (value == _dragging)
				return;
			_dragging = value;
			if (self.onState)
				self.onState(value);
		}
	});
	
	$(window.document)
	.on('mousedown', '.draggable', function (e) {
		if (self.dragging)
			return;
		if (self.onStart) {
			var pass = self.onStart(e);
			// jshint eqnull: true
			if (pass != null && !pass)
				return;
		}
		self.dragging = true;
	})
	.on('mousemove', function (e) {
		if (!self.dragging)
			return;
		if (self.onMove)
			self.onMove(e);
	})
	.on('mouseup', function (e) {
		if (!self.dragging)
			return;
		self.dragging = false;
		if (self.onStop)
			self.onStop(e);
	});
}



function inRoom(rect, e) {
	return rect.left < e.pageX && e.pageX < rect.right && 
		rect.top < e.pageY && e.pageY < rect.bottom;
}

function alignToGridLine(offset, pos, gridSize) {
	var offx = offset.x || offset.left,
		offy = offset.y || offset.top;
	gridSize = gridSize || 10;
	return {
		x: Math.round((pos.x - offx) / gridSize) * gridSize + offx,
		y: Math.round((pos.y - offy) / gridSize) * gridSize + offy
	};
}

function getPatchedPosition(offset, center, e, gridSize) {
	return alignToGridLine(center, {x: e.pageX - offset.x, 
		y: e.pageY - offset.y }, gridSize);
}

function syncGhostPosition(ghost, position) {
	$(ghost).css({
		left: position.x + 'px',
		top: position.y + 'px'
	});
}

function offsetFromCenter(target, e) {
	var rect = target.getBoundingClientRect();
	return {
		x: e.clientX - (rect.left + rect.right) / 2,
		y: e.clientY - (rect.top + rect.bottom) / 2
	};
}

function encodeURL(state) {
	var str = '', 
		t, x, y, r;
	(state || []).forEach(function (obj) {
		t = types.indexOf(obj.type) + 1; // lazy way to force heading digit
		x = obj.x || 0;
		y = obj.y || 0;
		r = Math.round((obj.rotation || 0) / 15);
		str += window.Radix64.fromNumber((((t << 10) + x << 10) + y << 5) + r);
	});
	return str ? '?f=' + str : '.';
}

function decodeLocation(location) {
	var m = /[?&]f=([^&]+)/.exec(location.search),
		str = m && m[1],
		state = [];
	if (!str || str.length % 5 !== 0)
		return [];
	for (var i = 0, j, obj; i < str.length; i += 5) {
		obj = {};
		j = window.Radix64.toNumber(str.substring(i, i + 5));
		obj.rotation = (j % 32) * 15;
		j >>= 5;
		obj.y = j % 1024;
		j >>= 10;
		obj.x = j % 1024;
		j >>= 10;
		obj.type = types[j - 1];
		state.push(obj);
	}
	return state;
}

$(function () {
	var manager = new window.StateManager(encodeURL, decodeLocation),
		warehouse = new Warehouse('#warehouse', catalog, storage),
		room = new Room('#room', warehouse),
		dragger = new Dragger(),
		roomRect, 
		roomCenter,
		cursorOffset,
		dragged, 
		gridSize = 5,
		fromPool, 
		ghost;
	
	manager.onChangeState = function (state) {
		room.load(state);
	};
	
	warehouse.$element.on('mousewheel DOMMouseScroll', '.tray',  function (e) {
		// each tick is 15 degrees
		var oe = e.originalEvent,
			delta = oe.wheelDelta ? oe.wheelDelta / 8 : -5 * oe.detail;
		warehouse.rotate($(e.currentTarget.parentNode).data('type'), delta, true);
		e.preventDefault();
	});
	
	dragger.onState = function (value) {
		$(window.document.body)[value ? 'addClass' : 'removeClass']('dragging');
	};
	dragger.onStart = function (e) {
		var target = e.currentTarget;
		fromPool = $(target).hasClass('tray');
		cursorOffset = offsetFromCenter(target, e);
		roomRect = room.getBound();
		roomCenter = {
			x: Math.round((roomRect.left + roomRect.right) / 2),
			y: Math.round((roomRect.top + roomRect.bottom) / 2)
		};
		
		if (fromPool) {
			var type = $(target.parentNode).data('type');
			dragged = { type: type, rotation: warehouse.rotations[type] || 0 };
			// TODO: subtract item count
		} else {
			dragged = target._obj;
			room.hide(dragged);
		}
		ghost = warehouse.create(dragged.type, 'ghost hide');
		setElementRotation(ghost, dragged.rotation);
		syncGhostPosition(ghost, getPatchedPosition(cursorOffset, roomCenter, e, gridSize));
		document.body.appendChild(ghost);
		$(ghost).removeClass('hide');
	};
	dragger.onMove = function (e) {
		syncGhostPosition(ghost, getPatchedPosition(cursorOffset, roomCenter, e, gridSize));
	};
	dragger.onStop = function (e) {
		$(ghost).addClass('hide');
		ghost.remove();
		if (!inRoom(roomRect, e)) {
			if (!fromPool) {
				room.remove(dragged);
				manager.push(room.objects, true);
			}
			return;
		}
		var pos = getPatchedPosition(cursorOffset, roomCenter, e, gridSize);
		dragged.x = pos.x - roomRect.left;
		dragged.y = pos.y - roomRect.top;
		room.set(dragged);
		manager.push(room.objects, true);
	};
	
	manager.ready();
	
});

})(this);
