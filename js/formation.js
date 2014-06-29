(function (window) {

'use strict';
var $ = window.jQuery;

var catalog = {
	desk: {
		width: 60,
		height: 20,
		ghost: '<span class="desk ghost hide"></span>'
	},
	chair: {
		width: 20,
		height: 20,
		ghost: '<span class="chair ghost hide"></span>'
	}
};

var warehouse = {
	desk: 16,
	chair: 50
};



function Room(element) {
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

Room.prototype.set = function (obj, x, y, rotation) {
	obj = _normalize(obj);
	var elem = obj._elem,
		$elem = $(elem),
		isNew = elem === undefined;
	if (isNew) {
		elem = obj._elem = document.createElement('span');
		elem._obj = obj;
		$elem = $(elem);
		elem.className = obj.type + ' draggable';
	}
	$elem.addClass('hide');
	
	var r = 'rotate(' + rotation + 'deg)';
	$elem.css({
		left: x + 'px',
		top: y + 'px',
		transform: r,
		'-webkit-transform': r
	});
	
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

function syncGhostPosition(ghost, e) {
	$(ghost).css({
		left: e.pageX + 'px',
		top: e.pageY + 'px'
	});
}

$(function () {
	var room = new Room('#room'),
		dragger = new Dragger(),
		roomRect, dragged, fromPool, ghost;
	
	dragger.onStart = function (e) {
		var target = e.currentTarget;
		fromPool = $(target.parentNode).hasClass('pool');
		roomRect = room.getBound();
		dragged = fromPool ? { type: $(target.parentNode).data('type') } : target._obj;
		if (fromPool) {
			// TODO: subtract item count
		} else {
			room.hide(dragged);
		}
		ghost = $(catalog[dragged.type].ghost)[0];
		syncGhostPosition(ghost, e);
		document.body.appendChild(ghost);
		$(ghost).removeClass('hide');
	};
	dragger.onMove = function (e) {
		syncGhostPosition(ghost, e);
	};
	dragger.onStop = function (e) {
		$(ghost).addClass('hide');
		ghost.remove();
		if (!inRoom(roomRect, e)) {
			if (!fromPool)
				room.remove(dragged);
			return;
		}
		room.set(dragged, e.pageX - roomRect.left, e.pageY - roomRect.top);
	};
	
});

})(this);
