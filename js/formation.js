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
			{ type: 'chair', x: 13, y: 15 },
			{ type: 'chair', x: 13, y: -15 }
		],
		cost: { desk: 1, chair: 2 }
	},
	c2: {
		subs: [
			{ type: 'chair', y: 15 },
			{ type: 'chair', y: -15 }
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
		add ? ((this.rotations[type] || 0) + degree) % 360 : degree);
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
}

function _normalize(obj) {
	return typeof obj === 'string' ? { type: obj } : obj._obj ? obj._obj : obj;
}

Room.prototype.checkCollision = function (obj) {
	obj = _normalize(obj);
	// TODO
};

Room.prototype.set = function (obj, x, y) {
	obj = _normalize(obj);
	var elem = obj._elem,
		$elem = $(elem),
		isNew = elem === undefined;
	if (isNew) {
		elem = obj._elem = this.warehouse.create(obj.type);
		elem._obj = obj;
		$elem = $(elem);
		$elem.addClass('draggable');
	}
	$elem.addClass('hide');
	
	$elem.css({
		left: x + 'px',
		top: y + 'px'
	});
	setElementRotation(elem, obj.rotation);
	
	if (isNew)
		this.element.appendChild(elem);
	
	$elem.removeClass('hide');
};

Room.prototype.remove = function (obj) {
	obj = _normalize(obj);
	if (!obj)
		return;
	var elem = obj._elem;
	if (elem) {
		elem.remove();
		delete elem._obj;
	}
	delete obj._elem;
};

function setVisibility(obj, value) {
	obj = _normalize(obj);
	var elem = obj._elem;
	if (elem)
		$(elem)[value ? 'removeClass' : 'addClass']('hide');
}

Room.prototype.hide = function (obj) {
	setVisibility(obj, false);
};

Room.prototype.show = function (obj) {
	setVisibility(obj, true);
};

Room.prototype.getBound = function () {
	var $elem = this.$element,
		rect = $elem.offset();
	rect.right = rect.left + $elem.width();
	rect.bottom = rect.top + $elem.height();
	return rect;
};



function Dragger() {
	
	var _dragging = false;
	Object.defineProperty(this, 'dragging', {
		get: function () {
			return _dragging;
		},
		set: function (value) {
			if (value == _dragging)
				return;
			_dragging = value;
			$(window.document.body)[value ? 'addClass' : 'removeClass']('dragging');
		}
	});
	
	var self = this;
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

function syncGhostPosition(ghost, offset, e) {
	$(ghost).css({
		left: (e.pageX - offset.x) + 'px',
		top: (e.pageY - offset.y) + 'px'
	});
}

function offsetFromCenter(target, e) {
	var rect = target.getBoundingClientRect();
	return {
		x: e.clientX - (rect.left + rect.right) / 2,
		y: e.clientY - (rect.top + rect.bottom) / 2
	};
}

$(function () {
	var warehouse = new Warehouse('#warehouse', catalog, storage),
		room = new Room('#room', warehouse),
		dragger = new Dragger(),
		roomRect, 
		cursorOffset,
		dragged, 
		fromPool, 
		ghost;
	
	$('#warehouse').on('mousewheel DOMMouseScroll', '.tray',  function (e) {
		// each tick is 15 degrees
		var oe = e.originalEvent,
			delta = oe.wheelDelta ? oe.wheelDelta / 8 : -5 * oe.detail;
		warehouse.rotate($(e.currentTarget.parentNode).data('type'), delta, true);
		e.preventDefault();
	});
	
	dragger.onStart = function (e) {
		var target = e.currentTarget;
		fromPool = $(target).hasClass('tray');
		cursorOffset = offsetFromCenter(target, e);
		roomRect = room.getBound();
		
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
		syncGhostPosition(ghost, cursorOffset, e);
		document.body.appendChild(ghost);
		$(ghost).removeClass('hide');
	};
	dragger.onMove = function (e) {
		syncGhostPosition(ghost, cursorOffset, e);
	};
	dragger.onStop = function (e) {
		$(ghost).addClass('hide');
		ghost.remove();
		if (!inRoom(roomRect, e)) {
			if (!fromPool)
				room.remove(dragged);
			return;
		}
		room.set(dragged, 
			e.pageX - cursorOffset.x - roomRect.left, 
			e.pageY - cursorOffset.y - roomRect.top);
	};
	
});

})(this);
