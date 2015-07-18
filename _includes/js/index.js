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



// scroll position //
(function (window) {

'use strict';
var $ = window.jQuery,
	$h1,
	$win = $(window),
	height,
	headings,
	init = false;

window.events.on('size', function () {
	if (!init) {
		var className = window.document.body.className;
		if (className && className.contains('index')) {
			($h1 = $('h1')).addClass('out');
			$(window.document).on('scroll', onScroll);
		}
		init = true;
	}
	if ($h1) {
		headings = [];
		height = $win.height();
		$h1.each(function () {
			headings.push({
				element: this,
				top: $(this).offset().top
			});
		});
	}
});

function onScroll() {
	var pos = $win.scrollTop() + height * 2 / 3,
		i = 0, 
		len = headings.length;
	for (; i < len; i++)
		if (headings[i].top > pos)
			break;
	for (var j = 0; j < i; j++)
		$(headings[j].element).removeClass('out');
	headings.splice(0, i);
}

})(this);