(function (window) {

'use strict';
var $ = window.jQuery,
	events = window.events || (window.events = new window.DataModel());

function syncSize() {
	events.trigger('size');
}

$(function () {
	syncSize();
	$(window).resize(syncSize);
});

})(this);
