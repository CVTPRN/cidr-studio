const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../dist/calculator-math.js');

test('A /24 has 256 addresses and fits four /26s or 128 /31s', () => {
  const result = C.calculate('10.0.0.0/24', '/26');
  assert.equal(result.parent.addresses, 256);
  assert.equal(result.addresses, 64);
  assert.equal(result.count, 4);
  assert.equal(C.calculate('10.0.0.0/24', '/31').count, 128);
});

test('Prefix-only networks and optional slashes are accepted', () => {
  for (const input of ['/24', '24', ' /24 ']) {
    const result = C.calculate(input, ' 26 ');
    assert.equal(result.parent.network, null);
    assert.equal(result.parent.label, '/24');
    assert.equal(result.count, 4);
  }
});

test('Host bits are normalized and the correct network range is retained', () => {
  const result = C.calculate('192.168.1.245/24', '/26');
  assert.equal(result.parent.label, '192.168.1.0/24');
  assert.equal(result.parent.network.start, 3232235776);
  assert.equal(result.parent.network.end, 3232236031);
  assert.equal(result.count, 4);
});

test('IPv4 extremes and equal-size subnets retain full precision', () => {
  const result = C.calculate('0.0.0.0/0', '/32');
  assert.equal(result.parent.addresses, 4294967296);
  assert.equal(result.addresses, 1);
  assert.equal(result.count, 4294967296);
  assert.equal(C.calculate('/0', '/0').count, 1);
  assert.equal(C.calculate('255.255.255.254/31', '/32').count, 2);
  assert.equal(C.calculate('255.255.255.255/32', '/32').count, 1);
  assert.equal(C.calculate('/31', '/31').addresses, 2);
});

test('Larger requested subnets do not fit', () => {
  assert.equal(C.calculate('/24', '/23').count, 0);
  assert.equal(C.calculate('/32', '/0').count, 0);
});

test('Every prefix pair preserves address capacity without enumeration', () => {
  for (let parent = 0; parent <= 32; parent++) {
    for (let child = 0; child <= 32; child++) {
      const result = C.calculate('/' + parent, '/' + child);
      if (child < parent) assert.equal(result.count, 0);
      else {
        let count = 1;
        for (let p = parent; p < child; p++) count *= 2;
        assert.equal(result.count, count);
        assert.equal(result.count * result.addresses, result.parent.addresses);
      }
      assert(Number.isSafeInteger(result.count));
    }
  }
});

test('Malformed, missing and out-of-range prefixes are rejected', () => {
  for (const input of ['', ' ', '/', '/33', '33', '/-1', '-1', '/2.5', '2.5', '1e1', '0x10', '//26', '/ 26', 'abc', '26/24', '32x', null, undefined, 24]) {
    assert.throws(() => C.prefix(input), String(input));
    assert.throws(() => C.calculate('/24', input), String(input));
  }
});

test('Malformed parent CIDRs and unsupported address families are rejected', () => {
  for (const input of ['', ' ', '/33', '/-1', '/24x', '10.0.0.0', '256.0.0.0/24', '10.0.0/24', '10.0.0.0/33', '10.0.0.0/2.5', '10.0.0.0/24/26', '2001:db8::/64', null, undefined]) {
    assert.throws(() => C.parent(input), String(input));
  }
});
