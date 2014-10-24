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
		message = message || '';

		var bt = printStackTrace(),
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

			if (isCallable(this._before)) {
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
			message = message || '';
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
			message = message || '';
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