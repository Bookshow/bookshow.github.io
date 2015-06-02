// partners //
(function (window) {

'use strict';
var $ = window.jQuery,
	ul,
	$btn,
	init = false;

window.events.on('size', function () {
	if (!init) {
		ul = $('#partners .u-partners')[0];
		$btn = $('#partners .u-toggle');
		init = true;
	}
	if (ul)
		$btn[ul.scrollHeight > ul.clientHeight ? 'removeClass' : 'addClass']('hide');
});

})(this);
