'use strict';
(() => {
  const $ = id => document.getElementById(id), C = CidrCalculator;
  const format = n => n.toLocaleString('en-US');

  function errorFor(id, message = '') {
    $(id).setAttribute('aria-invalid', String(!!message));
    $(id + 'Error').textContent = message;
    $(id + 'Error').hidden = !message;
  }

  function render() {
    let base, child;
    errorFor('parentCidr');
    errorFor('childPrefix');
    $('parentAddresses').textContent = '—';
    $('childAddresses').textContent = '—';
    $('fitCount').textContent = '—';
    $('fitDescription').textContent = 'Enter a valid network and subnet prefix.';
    $('fitNote').textContent = '';
    $('networkRange').textContent = '';
    $('networkNote').textContent = '';
    try {
      base = C.parent($('parentCidr').value);
      $('parentAddresses').textContent = format(base.addresses);
      if (base.network) {
        const r = base.network;
        $('networkRange').textContent = r.cidr + ' · ' + Net.ip(r.start) + ' – ' + Net.ip(r.end);
        $('networkNote').textContent = Net.number($('parentCidr').value.trim().split('/')[0]) !== r.start
          ? 'The entered IP belongs to ' + r.cidr + '. Calculations use this network boundary.'
          : 'Full address range of the parent network.';
      } else {
        $('networkRange').textContent = '/' + base.p + ' · ' + format(base.addresses) + ' total IPv4 addresses';
        $('networkNote').textContent = 'Size-only calculation. Enter an IPv4 CIDR to also see its address range.';
      }
    } catch (error) { errorFor('parentCidr', error.message); }
    try {
      child = C.prefix($('childPrefix').value);
      $('childAddresses').textContent = format(Net.size(child));
    } catch (error) { errorFor('childPrefix', error.message); }

    document.querySelectorAll('[data-prefix]').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.prefix) === child));
    });
    $('networkDetail').hidden = !base;
    if (!base || child === undefined) return;
    const result = C.calculate($('parentCidr').value, $('childPrefix').value);
    $('fitCount').textContent = format(result.count);
    $('fitDescription').textContent = '/' + child + ' ' + (result.count === 1 ? 'subnet fits' : 'subnets fit') + ' in ' + base.label;
    $('fitNote').textContent = result.count === 0
      ? 'A /' + child + ' subnet is larger than the parent. Choose /' + base.p + ' or a higher prefix number.'
      : format(base.addresses) + ' ÷ ' + format(result.addresses) + ' = ' + format(result.count) + ' ' + (result.count === 1 ? 'subnet' : 'subnets');
  }

  $('calculatorForm').addEventListener('submit', event => { event.preventDefault(); render(); });
  ['parentCidr', 'childPrefix'].forEach(id => $(id).addEventListener('input', render));
  document.querySelectorAll('[data-prefix]').forEach(button => button.addEventListener('click', () => {
    $('childPrefix').value = '/' + button.dataset.prefix;
    render();
  }));
  render();
})();
