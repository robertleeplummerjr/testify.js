/**
 * @param {Testify} testify
 */
Testify.report.html = (function(Vue) {
	"use strict";

	return function(testify) {
		new Vue({
			el: "#head",
			data: {
				pass: testify.suiteResults.pass,
				fail: testify.suiteResults.fail,
				title: testify.suiteTitle
			}
		});

		new Vue({
			el: "#content",
			data: {
				title: testify.suiteTitle,

				result: testify.suiteResults.fail == 0 ? 'pass' : 'fail',
				cases: testify.stack,
				percent: percent(testify.suiteResults)
			},
			filters: {
				caseClass: function(fail) {
					return fail > 0 ? 'fail' : 'pass'
				},
				identification: function(test) {
					return test.name == '' ? test.type + '()' : test.name;
				},
				escapeHtml: escapeHtml
			}
		});
	}

})(Vue);