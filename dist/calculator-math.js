/* IPv4 capacity only: counts all addresses, without enumerating subnets. */
(function (global) {
  'use strict';
  const N = typeof module !== 'undefined' ? require('./network.js') : global.Net;

  function prefix(value) {
    if (typeof value !== 'string' || !/^\/?\d{1,2}$/.test(value.trim())) {
      throw Error('Enter a prefix from /0 to /32, such as /26 or 26.');
    }
    const p = Number(value.trim().replace('/', ''));
    if (p > 32) throw Error('IPv4 prefixes must be between /0 and /32.');
    return p;
  }

  function parent(value) {
    if (typeof value !== 'string' || !value.trim()) {
      throw Error('Enter an IPv4 network or prefix, such as 10.0.0.0/24 or /24.');
    }
    const input = value.trim();
    if (input.includes('.') && !/^\d{1,3}(\.\d{1,3}){3}\/\d{1,2}$/.test(input)) {
      throw Error('Enter an IPv4 CIDR such as 10.0.0.0/24.');
    }
    const network = input.includes('.') ? N.parse(input) : null;
    const p = network ? network.p : prefix(input);
    return { p, addresses: N.size(p), network, label: network ? network.cidr : '/' + p };
  }

  function calculate(parentInput, childInput) {
    const base = parent(parentInput), p = prefix(childInput);
    return { parent: base, p, addresses: N.size(p), count: p >= base.p ? 2 ** (p - base.p) : 0 };
  }

  const api = { prefix, parent, calculate };
  if (typeof module !== 'undefined') module.exports = api;
  else global.CidrCalculator = api;
})(globalThis);
