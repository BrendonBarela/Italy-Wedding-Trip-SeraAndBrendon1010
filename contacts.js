(() => {
  'use strict';
  const heist = {
    Sera: ['The Bride', "The reason we're all in Italy. What she says goes."],
    Brendon: ['The Groom', 'Co-mastermind. Has a plan. Probably has a spreadsheet.'],
    Sierra: ['The Voice', 'Runs the ceremony. Controls the music. Nobody moves until she gives the cue.'],
    Mike: ['The Escort', 'One job: get the bride down the aisle. No pressure.'],
    Alex: ['The Keeper', 'Best man. Guardian of the rings. Lose them and we have a problem.'],
    Megan: ['The Provisioner', 'Rehearsal dinner. Wedding-day food. Nobody goes hungry on her watch.'],
    Anna: ['The Fixer', "Bride prep specialist. If something's crooked, wrinkled, or missing—she handles it."],
    Gina: ['The Finisher', 'Part of the bride-prep crew. Handles the details nobody else noticed.'],
    Katie: ['The Clock', "Bride prep and schedule enforcement. When she says it's time to move, we move."],
    Cindy: ['The Cleaner', 'Something went wrong? Not anymore.'],
    Colleen: ['The Wildcard', 'No fixed assignment. Exactly where you want her when the plan goes sideways.']
  };
  function render(data) {
    const contacts = data?.contacts;
    if (!Array.isArray(contacts) || !contacts.length) {
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
      const persona = heist[contact.name];
      if (persona) {
        const alias = document.createElement('div');
        alias.className = 'contact-heist-name';
        alias.textContent = persona[0];
        const description = document.createElement('p');
        description.className = 'contact-heist-description';
        description.textContent = persona[1];
        card.append(title, alias, description);
      } else {
        card.append(title);
      }
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
      card.append(number, actions);
      list.append(card);
    });
    document.getElementById('contacts-content').hidden = false;
  }
  document.addEventListener('DOMContentLoaded', () => render(window.SB_TRIP));
})();
