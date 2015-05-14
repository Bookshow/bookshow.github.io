// http://stackoverflow.com/questions/6213227/fastest-way-to-convert-a-number-to-radix-64-in-javascript
(function (window) {

'use strict';

window.Radix64 = {
	
	_Rixits :
//   0       8       16      24      32      40      48      56     63
//   v       v       v       v       v       v       v       v      v
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+_',
	// You have the freedom, here, to choose the glyphs you want for 
	// representing your base-64 numbers. The ASCII encoding guys usually
	// choose a set of glyphs beginning with ABCD..., but, looking at
	// your update #2, I deduce that you want glyphs beginning with 
	// 0123..., which is a fine choice and aligns the first ten numbers
	// in base 64 with the first ten numbers in decimal.

	// This cannot handle negative numbers and only works on the 
	// integer part, discarding the fractional part.
	// Doing better means deciding on whether you're just representing
	// the subset of javascript numbers of twos-complement 32-bit integers 
	// or going with base-64 representations for the bit pattern of the
	// underlying IEEE floating-point number, or representing the mantissae
	// and exponents separately, or some other possibility. For now, bail
	fromNumber: function(number) {
		if (isNaN(Number(number)) || number === null ||
			number === Number.POSITIVE_INFINITY)
			throw 'The input is not valid';
		if (number < 0)
			throw 'Can\'t represent negative numbers now';

		var rixit; // like 'digit', only in some non-decimal radix 
		var residual = Math.floor(number);
		var result = '';
		while (true) {
			rixit = residual % 64;
			result = this._Rixits.charAt(rixit) + result;
			residual = Math.floor(residual / 64);
			if (residual === 0)
				break;
		}
		return result;
	},
	toNumber: function(rixits) {
		var result = 0;
		rixits = rixits.split('');
		for (var e in rixits)
			result = (result * 64) + this._Rixits.indexOf(rixits[e]);
		return result;
	}
};

})(this);
