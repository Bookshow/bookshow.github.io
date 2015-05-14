(function (window) {

'use strict';

/* encode: the function which maps a state to an URL string.
 * decode: the function which maps windows.location to a state.
 */
function StateManager(encode, decode) {
	this.encode = encode;
	this.decode = decode;
	var self = this;
	window.onpopstate = function (e) {
		self.fireEvent(e.state);
	};
}

StateManager.prototype.fireEvent = function (state) {
	if (this.onChangeState)
		this.onChangeState(state);
};

/* Push a state, which triggers a state event and pushes the state to history.
 */
StateManager.prototype.push = function (state, silent) {
	window.history.pushState(state, null, this.encode(state));
	if (!silent)
		this.fireEvent(state);
};

/* Tell the manager that we are ready after a page request, so it can replace
 * the state.
 */
StateManager.prototype.ready = function () {
	var state = this.decode(window.location);
	window.history.replaceState(state, null, null);
	this.fireEvent(state);
};

window.StateManager = StateManager;

})(this);
