var tf = new Testify("Testify test himself"),
	test = new Testify("//");

tf.before(function(tf)
{
	test.data.arr = [1, 2, 3];
});
tf.test("Pass/Fail test", function(tf)
{
	tf.assert(true, "To be sure that initial test pass !");
	tf.assertFalse(false);
	tf.assert(test.pass());
	tf.assertFalse(!test.pass());
	tf.assert(!test.fail());
	tf.assertFalse(test.fail());
});
tf.test("Basic assert test", function(tf)
{
	tf.assert(test.assert(true));
	tf.assert(!test.assert(false));
	tf.assertFalse(test.assert(false));
	tf.assertFalse(!test.assert(true));
});
tf.test("assertEquals/assertNotEquals test", function(tf)
{
	tf.assert(test.assertEquals(1, 1));
	tf.assert(test.assertEquals(-1337, '-1337'));
	tf.assert(test.assertEquals(42.0, 42));
	tf.assert(test.assertEquals(0, null));
	tf.assert(test.assertEquals(0, ""));
	tf.assert(test.assertEquals(1, true));
	tf.assert(test.assertEquals([0,1,1], [false,"1",true]));
	tf.assert(test.assertEquals(new Object(), {}));
	tf.assert(test.assertNotEquals(-1, ""));
	tf.assertFalse(test.assertEquals(-1, ""));
	tf.assertFalse(test.assertEquals([1], 1));
	tf.assertFalse(test.assertEquals([9,8], {0:9,1:8}));
	tf.assertFalse(test.assertNotEquals(1.0, 1));
});
tf.test("assertSame/assertNotSame test", function(tf)
{
	tf.assert(test.assertSame(-1, -1));
	tf.assert(test.assertNotSame(-1, -1.0));
	tf.assert(test.assertSame(2E10, 2E10));
	tf.assert(test.assertSame("\\", ''));
	tf.assert(test.assertSame([0,1,true], [0,1,true]));
	tf.assert(test.assertSame(255, 0xFF));
	tf.assert(test.assertSame(42.1, 42));
	tf.assert(test.assertNotSame({}, {}));
	tf.assertFalse(test.assertSame(1, "1"));
	tf.assertFalse(test.assertSame(1.0, 1));
	tf.assertFalse(test.assertSame(2, 2.00));
	tf.assertFalse(test.assertSame(new Object(), {}));
});
tf.test("assertInArray/assertNotInArray test", function(tf)
{
	arr = [1, 2, null, false, "1", "2"];
	tf.assert(test.assertInArray(1, arr));
	tf.assert(test.assertInArray(true, arr));
	tf.assert(test.assertInArray(false, arr));
	tf.assert(test.assertInArray(0, arr));
	tf.assert(test.assertNotInArray(3, arr));
	tf.assert(test.assertNotInArray("str", arr));
	tf.assertFalse(test.assertInArray(-1, arr));
	tf.assertFalse(test.assertInArray([0], arr));
});
tf.test("data set test", function(tf)
{
	tf.assert(test.assertInArray(2, test.data.arr));
	tf.assert(test.assertInArray(3, test.data.arr));
	tf.assert(test.assertNotInArray(9, test.data.arr));
});
tf.run();