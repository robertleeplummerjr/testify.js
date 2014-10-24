/**
 * Calculate the percentage of success for a test
 *
 * @param {Object} suiteResults
 * @return {Number} Percent
 */
function percent(suiteResults) {
	var sum = suiteResults.pass + suiteResults.fail,
		result = Math.round(suiteResults.pass * 100 / Math.max(sum, 1));

	return result;
}

function escapeHtml(text) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};

	return (text || '').replace(/[&<>"']/g, function(m) { return map[m]; });
}

function ajax(url, success, error) {
	"use strict";
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400){
			// Success!
			if (success)
				success(request.responseText);
		} else {
			// We reached our target server, but it returned an error
			if (error)
				error(request.responseText);
		}
	};

	request.onerror = function() {
		// There was a connection error of some sort
		if (error)
			error();
	};

	request.send();
}