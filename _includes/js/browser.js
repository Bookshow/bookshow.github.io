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



(function (window) {

'use strict';

window.appid = Math.floor(Math.random() * 100000);

})(this);
