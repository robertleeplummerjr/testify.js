/**
 * @param {Testify} testify
 */
Testify.report.cli = (function(percent) {
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
})(percent);