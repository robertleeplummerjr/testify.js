/**
 * Testify - a micro unit testing framework
 *
 * This is the main class of the framework. Use it like this:
 * A public object for storing state and other variables across test cases and method calls.
 * @param {String} The suite title
 * @version 0.4.1
 * @author Martin Angelov
 * @author Marc-Olivier Fiset
 * @author Fabien Salathe
 * @author Robert Plummer
 * @link marco
 * @throws TestifyException
 * @license MIT
 * @Constructor
 */
var Testify = (function() {
	/**
	 * A helper method for recording the results of the assertions in the internal stack.
	 *
	 * @param {Boolean} pass If equals true, the test has passed, otherwise failed
	 * @param {String} [message] Custom message
	 *
	 * @return boolean
	 */
	function recordTest(pass, message)
	{
		message = message || 'Testify.recordTest';

		var bt = '',
			source = '',//this.getFileLine(bt[1]['file'], bt[1]['line'] - 1),
			result = pass ? "pass" : "fail",
			item = this.stack[this.currentTestCase];

		if (!item){
			item = this.stack[this.currentTestCase] = {
				name: this.currentTestCase,
				tests: [],
				pass: 0,
				fail: 0
			};
		}

		this.testIndex++;

		item.tests.push({
			name: message,
			type: bt.toString(),
			result: result,
			line: this.testIndex,
			file: '',
			source: source
		});
		item[result]++;
		this.suiteResults[result]++;
		return pass;
	}
	/**
	 * Internal method for fetching a specific line of a text file. With caching.
	 *
	 * @param {String} file The file name
	 * @param {Number} line The line number to return
	 *
	 * @return string
	 */
	function getFileLine(file, line)
	{
		if (!this.fileCache.hasOwnProperty(file)) {
			this.fileCache[file] = file;
		}
		return trim(this.fileCache[file][line]);
	}

	/**
	 *
	 * @param {*} fn
	 */
	function isCallable(fn) {
		return (fn.call !== undefined && fn.apply !== undefined);
	}

	function Constructor(title, isCLI) {
		//private
		this.testIndex = 0;
		this.tests = [];
		this.stack = {};
		this.fileCache = [];
		this.currentTestCase = null;
		this.suiteTitle = title;
		this.suiteResults = {
			pass: 0,
			fail: 0
		};
		this._before = null;
		this._after = null;
		this._beforeEach = null;
		this._afterEach = null;

		//public
		this.data = {};

		this.isCLI = function() {
			return isCLI || false;
		};
	}

	Constructor.prototype = {
		/**
		 * Add a test case.
		 *
		 * @param {String|Function} name Title of the test case
		 * @param {Function} [testCase] The test case as a callback
		 *
		 * @return this
		 */
		test: function test(name, testCase)
		{
			//if is a function
			if (isCallable(name)) {
				testCase = name;
				name = "Test Case #" + (this.tests.length + 1);
			}
			this.affirmCallable(testCase, "test");
			this.tests.push({
				name: name,
				testCase: testCase,
				pass: 0,
				fail: 0
			});
			return this;
		},

		/**
		 * Executed once before the test cases are run.
		 *
		 * @param {Function} callback An anonymous callback function
		 */
		before: function before(callback)
		{
			this.affirmCallable(callback, "before");
			this._before = callback;
		},

		/**
		 * Executed once after the test cases are run.
		 *
		 * @param {Function} callback An anonymous callback function
		 */
		after: function after(callback)
		{
			this.affirmCallable(callback, "after");
			this._after = callback;
		},

		/**
		 * Executed for every test case, before it is run.
		 *
		 * @param {Function} callback An anonymous callback function
		 */
		beforeEach: function beforeEach(callback)
		{
			this.affirmCallable(callback, "beforeEach");
			this._beforeEach = callback;
		},

		/**
		 * Executed for every test case, after it is run.
		 *
		 * @param {Function} callback An anonymous callback function
		 */
		afterEach: function afterEach(callback)
		{
			this.affirmCallable(callback, "afterEach");
			this._afterEach = callback;
		},

		/**
		 * Run all the tests and before / after functions. Calls {@see report} to generate the HTML report page.
		 *
		 * @return Testify
		 */
		run: function run()
		{
			var arr = [this],
				n,
				test;

			if (this._before !== null && isCallable(this._before)) {
				this._before.apply(this, arr);
			}

			for(n in this.tests) if (this.tests.hasOwnProperty(n)) {
				test = this.tests[n];
				this.currentTestCase = test.name;
				if (this._beforeEach !== null && isCallable(this._beforeEach)) {
					this._beforeEach.apply(this, arr);
				}
				// Executing the testcase
				test.testCase.apply(this, arr);
				if (this._afterEach !== null && isCallable(this._afterEach)) {
					this._afterEach.apply(this, arr);
				}
			}
			if (this._after !== null && isCallable(this._after)) {
				this._after.apply(this, arr);
			}
			this.report();

			Constructor.instances.push(this);
			return this;
		},
		
		/**
		 * Alias for {@see assertTrue} method.
		 *
		 * @param {Boolean} arg The result of a boolean expression
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 * @see Testify.assertTrue()
		 *
		 * @return boolean
		 */
		assert: function assert(arg, message)
		{
			message = message || 'Testify.assert';
			return this.assertTrue(arg, message);
		},
		
		/**
		 * Passes if given a truthfull expression.
		 *
		 * @param {Boolean} arg The result of a boolean expression
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 *
		 * @return boolean
		 */
		assertTrue: function assertTrue(arg, message)
		{
			message = message || 'Testify.assertTrue';
			return recordTest.call(this, arg == true, message);
		},
		
		/**
		 * Passes if given a falsy expression.
		 *
		 * @param {Boolean} arg The result of a boolean expression
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 *
		 * @return boolean
		 */
		assertFalse: function assertFalse(arg, message)
		{
			message = message || 'Testify.assertFalse';
			return recordTest.call(this, arg == false, message);
		},

		/**
		 * Passes if arg1 == arg2.
		 *
		 * @param {*} arg1
		 * @param {*} arg2
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 *
		 * @return boolean
		 */
		assertEquals: function assertEquals(arg1, arg2, message)
		{
			message = message || 'Testify.assertEquals';
			return recordTest.call(this, arg1 == arg2, message);
		},

		/**
		 * Passes if arg1 != arg2.
		 *
		 * @param {*} arg1
		 * @param {*} arg2
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 *
		 * @return boolean
		 */
		assertNotEquals: function assertNotEquals(arg1, arg2, message)
		{
			message = message || 'Testify.assertNotEquals';
			return recordTest.call(this, arg1 != arg2, message);
		},

		/**
		 * Passes if arg1 === arg2.
		 *
		 * @param {*} arg1
		 * @param {*} arg2
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 *
		 * @return boolean
		 */
		assertSame: function assertSame(arg1, arg2, message)
		{
			message = message || 'Testify.assertSame';
			return recordTest.call(this, arg1 === arg2, message);
		},

		/**
		 * Passes if arg1 !== arg2.
		 *
		 * @param {*} arg1
		 * @param {*} arg2
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 *
		 * @return boolean
		 */
		assertNotSame: function assertNotSame(arg1, arg2, message)
		{
			message = message || 'Testify.assertNotSame';
			return recordTest.call(this, arg1 !== arg2, message);
		},

		/**
		 * Passes if arg is an element of arr.
		 *
		 * @param {*} arg
		 * param {Array} arr
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 *
		 * @return boolean
		 */
		assertInArray: function assertInArray(arg, arr, message)
		{
			message = message || 'Testify.assertInArray';
			return recordTest.call(this, (arr.indexOf(arg) > -1), message);
		},

		/**
		 * Passes if arg is not an element of arr.
		 *
		 * @param {*} arg
		 * param {Array} arr
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 *
		 * @return boolean
		 */
		assertNotInArray: function assertNotInArray(arg, arr, message)
		{
			message = message || 'Testify.assertNotInArray';
			return recordTest.call(this, !(arr.indexOf(arg) > -1), message);
		},

		/**
		 * Unconditional pass.
		 *
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 *
		 * @return boolean
		 */
		pass: function pass(message)
		{
			message = message || 'Testify.pass';
			return recordTest.call(this, true, message);
		},

		/**
		 * Unconditional fail.
		 *
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 *
		 * @return boolean
		 */
		fail: function fail(message)
		{
			message = message || 'Testify.fail';
			// This check fails every time
			return recordTest.call(this, false, message);
		},

		/**
		 * Generates a pretty CLI or HTML5 report of the test suite status. Called implicitly by {@see run}.
		 *
		 * @return this
		 */
		report: function report()
		{
			var title = this.suiteTitle,
				suiteResults = this.suiteResults,
				cases = this.stack;

			if (this.isCLI()) {
				//include dirname(__FILE__) . '/testify.report.cli.php';
			} else {
				//include dirname(__FILE__) . '/testify.report.html.php';
			}

			return this;
		},

		/**
		 * Internal helper method for determine whether a variable is callable as a function.
		 *
		 * @param {*} callback The variable to check
		 * @param {String} name Used for the error message text to indicate the name of the parent context
		 * @throws TestifyException if callback argument is not a function
		 */
		affirmCallable: function affirmCallable(callback, name)
		{
			if (!isCallable(callback)) {
				throw new TestifyException(name + "(): is not a valid callback function!");
			}
		},

		/**
		 * Alias for {@see assertEquals}.
		 *
		 * @deprecated Not recommended, use {@see assertEquals}
		 * @param {*} arg1
		 * @param {*} arg2
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 *
		 * @return boolean
		 */
		assertEqual: function assertEqual(arg1, arg2, message)
		{
			message = message || 'Testify.assertEqual';
			return this.assertEquals(arg1, arg2, message);
		},

		/**
		 * Alias for {@see assertSame}.
		 *
		 * @deprecated Not recommended, use {@see assertSame}
		 * @param {*} arg1
		 * @param {*} arg2
		 * @param {String} [message] Custom message. SHOULD be specified for easier debugging
		 *
		 * @return boolean
		 */
		assertIdentical: function assertIdentical(arg1, arg2, message)
		{
			message = message || 'Testify.assertIdentical';
			return recordTest.call(this, arg1 === arg2, message);
		}
	};

	Constructor.report = {};
	Constructor.instances = [];

	return Constructor;
})();


var TestifyException = (function() {
	"use strict";
	function Constructor(message) {
		this.name = 'TestifyException';
		this.message = message;
	}
	Constructor.prototype = Error.prototype;

	return Constructor;
})();

/**
 * @param {Testify} testify
 */
Testify.report.html = (function() {

	function Constructor(testify) {
		new Vue({
			el: document.getElementsByTagName('title')[0],
			data: {
				pass: testify.suiteResults.pass,
				fail: testify.suiteResults.fail,
				title: testify.suiteTitle
			}
		});

		new Vue({
			el: document.body,
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

	Constructor.ui = '<style>\
		* {\
	margin: 0;\
	padding: 0;\
}\
html {\
	background-color: #fafafa;\
	overflow-x: hidden;\
	height: 100%;\
}\
body {\
	font: 13px/1.5 Tahoma, Arial, sans-serif;\
	text-align: center;\
	color: #5a5a5a;\
	height: 100%;\
}\
#wrapper {\
	min-height: 100%;\
}\
h1, h2 {\
	font-family: "PT Sans Narrow", sans-serif;\
	font-weight: normal;\
}\
h1:before,\
	h2:before {\
	display: inline-block;\
	font: normal 0.6em/1.1 sans-serif;\
	text-align: center;\
	color: #fff;\
	content: "✓";\
	position: relative;\
	top: -0.2em;\
	width: 1em;\
	height: 1em;\
	padding: 0.32em;\
	margin-right: 1.2em;\
	background-color: #a8d474;\
	border-radius: 50%;\
}\
h1.fail:before,\
	h2.fail:before {\
	background-color: #ee3c4f;\
	content: "✗";\
	line-height: 1.05;\
}\
h1 {\
	font-size: 46px;\
	padding: 50px 40px;\
	position: relative;\
	border-bottom: 1px solid #ddd;\
	background-color: #fff;\
	box-shadow: 0 0 3px #ddd;\
	margin-bottom: 40px;\
	color: #777;\
}\
h2 {\
	font-size: 28px;\
}\
span.result {\
	color: #DCDCDC;\
	display: block;\
	padding: 0.6em;\
}\
.green { color: #94c25d; }\
.red { color: #fb4357; }\
ul {\
	list-style: none;\
	font-size: 19px;\
	width: 800px;\
	margin: 10px auto 80px;\
}\
li span.pass {color: #94c25d;}\
li span.fail {color: #fb4357;}\
li span.file,\
	li span.line {\
	float: right;\
	font-size: 14px;\
	padding-left: 10px;\
	line-height: 19px;\
	position: relative;\
	bottom: -4px;\
}\
li span.file {\
	color: #b0b0b0;\
}\
li{\
	text-align: left;\
	border-bottom: 1px dotted #d4d4d4;\
	padding: 3px 0;\
	overflow: hidden;\
}\
li span.type {\
	display: inline-block;\
	width: 600px;\
}\
div.message {\
	font-size: 22px;\
	font-family: "PT Sans Narrow", sans-serif;\
	padding: 0 40px 50px;\
}\
div.message.pass .red,\
	div.message.fail .green {\
	display: none;\
}\
footer {\
	background-color: #fff;\
	border-top: 1px solid #ddd;\
	box-shadow: 0 0 3px #ddd;\
	color: #888;\
	font-size: 10px;\
	padding: 15px;\
	display: block;\
	height: 15px;\
	position: relative;\
}\
a, a:visited {\
	color: #3ba2cd;\
	text-decoration: none;\
}\
a:hover {\
	text-decoration: underline;\
}\
div.source {\
	font-size: 11px;\
	color: #ccc;\
	-moz-transition: 0.25s;\
	-webkit-transition: 0.25s;\
	transition: 0.25s;\
}\
li:hover div.source {\
	color: #444;\
}\
		</style>\
		<div id="wrapper">\
			<div id="content">\
				<h1 v-class="{{result}}">\
					{{title}}\
				</h1>\
				<div class="message {{result}}">\
					<span class="green">Far out! Everything passed!</span>\
					<span class="red">Bummer! You have failing tests! [pass {{percent}}%]</span>\
				</div>\
				<div v-repeat="case : cases">\
					<h2 v-class="case.fail | caseClass">\
						{{case.name}}\
						<span class="result">\
							<span class="green">{{case.pass}}</span>/<span class="red">{{case.fail}}</span>\
						</span>\
					</h2>\
					<ul class="tests">\
						<li v-repeat="test : case.tests">\
							<span class="type {{test.result}}">\
								{{test | identification}}\
							</span>\
							<span class="line">call {{test.line}}</span>\
							<span class="file">{{test.file}}</span>\
							<div class="source">{{test.source | escapeHtml}}</div>\
						</li>\
					</ul>\
				</div>\
			</div>\
		</div>\
		<footer> Powered by <a href="http://robertleeplummerjr.github.io/testify.js" target="_blank">Testify.js</a> framework, based on <a href="http://tutorialzine.com/projects/testify/" target="_blank">Testify</a></footer>';

	return Constructor;
})();

/**
 * @param {Testify} testify
 */
Testify.report.cli = (function() {
	return function(testify) {
		var result = testify.suiteResults.fail === 0 ? 'pass' : 'fail',
			i,
			cases = testify.stack,
			caseTitle,
			lines = (new Array(80)).join('-'),
			spaces = (new Array(7)).join(' '),
			_case,
			tests,
			testsMax,
			test,
			echo = lines + "\n"
				+ " " + testify.title + " [" + testify.result + "]\n";


		for(caseTitle in cases) if (cases.hasOwnProperty(caseTitle)) {
			_case = cases[caseTitle];
			echo +=
				"\n" + lines + "\n"
				+ "[" + result + "] " + caseTitle + "{pass " + _case.pass + " / fail " + _case.fail + "}\n\n";

			tests = _case.tests;
			testsMax = tests.length;
			i = 0;
			for(;i < testsMax; i++) {
				test = tests[i];
				echo +=
					"[" + test.result + "] " + test.type + "}()\n"
					+ spaces + "line " + test.line + ", " + test.file + "\n"
					+ spaces + test.source + "\n";
			}
		}
	}
})();

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