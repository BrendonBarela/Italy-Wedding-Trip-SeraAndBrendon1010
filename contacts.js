(() => {
  'use strict';
  const heist = {
    Sera: ['The Bride', "The reason we're all in Italy. What she says goes."],
    Brendon: ['The Groom', 'Co-mastermind. Has a plan. Probably has a spreadsheet.'],
    Sierra: ['The Voice', "Brendon's sister and the officiant. Runs the ceremony, controls the music cues, and has full authority until the mission is complete."],
    Mike: ['The Escort', "Sera's dad. His most important assignment: get his daughter down the aisle safely and on cue. No pressure."],
    Alex: ['The Keeper', "Brendon's friend and best man. Guardian of the rings and trusted backup when the groom needs reinforcements."],
    Megan: ['The Provisioner', "Sera's friend and the crew's chef. Rehearsal dinner, wedding-day brunch and snacks—nobody goes hungry on her watch."],
    Anna: ['The Fixer', "Sera's friend and part of the bride-prep crew. If something's crooked, wrinkled, missing, or suddenly urgent—she handles it."],
    Gina: ['The Finisher', "Sera's mom and part of the bride-prep crew. Knows the bride, spots the details everyone else missed, and makes sure the final look is right."],
    Katie: ['The Clock', "Sera's friend, bride-prep crew, and keeper of the timeline. Her second mission: make sure everyone gets to dinner on time."],
    Cindy: ['The Bubbly Boss', "Brendon's mom and commander of the champagne operation. Keeps the bottles cold, the glasses full, and the celebration flowing right on cue."],
    Colleen: ['The Wildcard', "Brendon's friend and the crew's free agent. No fixed assignment—which makes her exactly who you want when the plan suddenly needs improvisation."],
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
