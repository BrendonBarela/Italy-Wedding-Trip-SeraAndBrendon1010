(() => {
  'use strict';
  function render(data) {
    const contacts = data?.contacts;
    if (!Array.isArray(contacts) || !contacts.length) {
      document.getElementById('contacts-help').textContent = 'If you already unlocked the app, tap Lock and unlock again to load the new contacts.';
      return;
    }
    const list = document.getElementById('contacts-list');
    list.replaceChildren();
    contacts.slice().sort((a,b) => a.name.localeCompare(b.name)).forEach(contact => {
      if (!/^\+1\d{10}$/.test(contact.phone)) return;
      const card = document.createElement('article');
      card.className = 'contact-card';
      const title = document.createElement('h2');
      title.textContent = contact.name;
      const number = document.createElement('a');
      number.className = 'contact-number';
      number.href = 'tel:' + contact.phone;
      number.textContent = contact.phone.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '+1 ($1) $2-$3');
      const actions = document.createElement('div');
      actions.className = 'sb-private-actions';
      [['Call', 'tel:' + contact.phone], ['Text', 'sms:' + contact.phone], ['WhatsApp', 'https://wa.me/' + contact.phone.slice(1)]].forEach(([label, href]) => {
        const link = document.createElement('a');
        link.textContent = label;
        link.href = href;
        link.setAttribute('aria-label', label + ' ' + contact.name);
        if (label === 'WhatsApp') { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
        actions.append(link);
      });
      card.append(title, number, actions);
      list.append(card);
    });
    document.getElementById('contacts-locked').hidden = true;
    document.getElementById('contacts-content').hidden = false;
  }
  document.addEventListener('sb:private-unlocked', event => render(event.detail));
  document.addEventListener('DOMContentLoaded', () => {
    const api = window.SBPrivateTrip;
    if (!api?.isStandalone) return;
    const unlock = document.getElementById('contacts-unlock');
    unlock.hidden = false;
    unlock.addEventListener('click', () => api.unlock());
    if (api.isUnlocked()) render(api.getData());
  });
})();

