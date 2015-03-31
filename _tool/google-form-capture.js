(function (window) {

'use strict';

var document = window.document,
	formElem = document.querySelector('form'),
	postURL = formElem.action,
	elemList = formElem.querySelectorAll('label[for], [name]'),
	s = '<form>\n';

function appendAttr(s, obj, name) {
	var v = obj[name] || obj.attributes[name] && obj.attributes[name].value;
	if (typeof v === 'string')
		v = v.replace(/[\\"']/g, '\\$&'); // escape quotes
	return v === true ? s + ' ' + name : v ? s + ' ' + name + '="' + v + '"' : s;
}

for (var i = 0, len = elemList.length, elem; i < len && (elem = elemList[i]); i++) {
	var tagName = elem.tagName.toLowerCase(),
		isLabel = tagName == 'label',
		emptyTag = tagName != 'textarea' && !isLabel;
	
	if (isLabel && !elem.textContent)
		continue;
	
	s += '\t<' + tagName;
	s = appendAttr(s, elem, 'id');
	s = appendAttr(s, elem, 'name');
	s = appendAttr(s, elem, 'for');
	s = appendAttr(s, elem, 'type');
	s = appendAttr(s, elem, 'value');
	s += '>';
	
	if (isLabel)
		s += elem.textContent.replace(/\n/g, '');
	
	if (!emptyTag)
		s += '</' + tagName + '>';
	s += '\n';
}
s += '</form>';

window.console.log(s);
window.console.log(postURL);

})(this);