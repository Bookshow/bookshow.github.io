(function (window) {

'use strict';
var $ = window.jQuery;

var ios = /(iPad|iPhone|iPod)/g.test(window.navigator.userAgent);

window.browser = {
	ios: ios
};

$(function () {
	if (ios)
		window.document.body.classList.add('ios');
});

})(this);
