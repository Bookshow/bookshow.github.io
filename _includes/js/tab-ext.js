(function (window) {

'use strict';
var $ = window.jQuery;

function showLI(li) {
	if (!li)
		return;
	$(li.querySelector('[role="tab"]')).tab('show');
}

$(window.document).on('click', '[role="navigator"]', function (e) {
	var elem = e.currentTarget,
		$elem = $(elem),
		type = $elem.data('toggle'),
		target = $elem.data('target'); // TODO: or href
	target = $(target)[0];
	if (!target || !type)
		return;
	
	var currentLI = target.querySelector('.active');
	if (type == 'previous') {
		showLI(currentLI && currentLI.previousElementSibling);
		
	} else if (type == 'next') {
		showLI(currentLI && currentLI.nextElementSibling);
	}
	e.preventDefault();
});

})(this);
