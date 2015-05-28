(function (window) {

'use strict';



function inherit(X, Y) {
	X.prototype = new Y();
	X.prototype.constructor = X;
}

function Transform(matrix) {
	this.matrix = matrix;
}
function _combine(m1, m2) {
	return [
		m1[0] * m2[0] + m1[2] * m2[1],
		m1[1] * m2[0] + m1[3] * m2[1],
		m1[0] * m2[2] + m1[2] * m2[3],
		m1[1] * m2[2] + m1[3] * m2[3],
		m1[0] * m2[4] + m1[2] * m2[5] + m1[5],
		m1[1] * m2[4] + m1[3] * m2[5] + m1[6]
	];
}
function _parse(str) {
	
}
Transform.parse = function (str) {
	var arr = str.split(',');
	if (arr.length === 0) {
		return new Identity();
	} else if (arr.length === 1) {
		return _parse(str);
	} else {
		return new MultipleTransform(arr.map(_parse));
	}
};

function Identity() {
	this.matrix = [1, 0, 0, 1, 0, 0];
}
inherit(Identity, Transform);

function Scale(r) {
	this.r = r;
	this.matrix = [r, 0, 0, r, 0, 0];
}
inherit(Scale, Transform);

function Translate(x, y) {
	this.x = x;
	this.y = y;
	this.matrix = [1, 0, 0, 1, x, y];
}
inherit(Translate, Transform);

function MultipleTransform(members) {
	this.members = members;
	
	var len = (members && members.length) || 0;
	if (len === 0)
		this.matrix = [1, 0, 0, 1, 0, 0];
	else {
		var m = members[0].matrix;
		for (var i = 1; i < len; i++)
			m = _combine(m, members[i]);
		this.matrix = m;
	}
}
inherit(MultipleTransform, Transform);



function D(segments) {
	this.segments = segments;
}
D.parse = function(str) {
	return new D(str.match(/[A-Za-z]([^A-Za-z])*/g).map(Segment.parse));
};
D.prototype.toString = function () {
	return this.segments.join(' ');
};
D.prototype.transform = function (transform) {
	return new D(this.segments.map(function (segment) {
		return segment.transform(transform);
	}));
};

function Segment(type, data) {
	this.type = type;
	this.data = data;
}
Segment.parse = function(str) {
	return new Segment(str.substring(0, 1), 
		(str.match(/-?[.\d]+/g) || []).map(window.parseFloat));
};
Segment.prototype.toString = function () {
	return this.type + ' ' + this.data.join(', ');
};
Segment.prototype.transform = function (transform) {
	var type = this.type,
		data = this.data,
		matrix = transform.matrix,
		relative = /[a-z]/.test(type),
		ndata = [];
	if (/[MmZzLlQqCc]/.test(type)) {
		for (var n = data.length / 2, i = 0, p; i < n; i += 2) {
			p = applyMatrix(data[i], data[i + 1], matrix, relative);
			ndata.push(p.x);
			ndata.push(p.y);
		}
		
	} else if (/[Aa]/.test(type)) {
		// A rx,ry xAxisRotate LargeArcFlag,SweepFlag x,y
		// TODO
	}
	return new Segment(type, ndata);
};
function applyMatrix(x, y, m, r) {
	return {
		x: x * m[0] + y * m[2] + (r ? 0 : m[4]),
		y: x * m[1] + y * m[3] + (r ? 0 : m[5])
	};
}



window.svg = {
	D: D,
	Segment: Segment,
	Scale: Scale,
	Translate: Translate
};


})(this);