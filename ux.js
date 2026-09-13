(() => {
  const currentPage = () => (window.location.pathname.split('/').pop() || 'index.html').split('?')[0];

  const closeMobileMenu = () => {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.mobile-nav-toggle');
    if (!header || !toggle) return;
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    const label = toggle.querySelector('.mobile-nav-label');
    const icon = toggle.querySelector('.mobile-nav-icon');
    if (label) label.textContent = 'Menu';
    if (icon) icon.textContent = '☰';
  };

  const compactNavigation = () => {
    const nav = document.getElementById('site-nav');
    if (!nav || nav.dataset.uxReady === 'true') return;
    nav.dataset.uxReady = 'true';
    nav.classList.add('ux-nav');
    nav.innerHTML = `
      <a class="ux-nav-link" href="index.html" data-page="index.html">Home</a>
      <a class="ux-nav-link ux-today-link" href="today.html" data-page="today.html">Today</a>
      <div class="ux-nav-group" data-pages="verona.html,parma.html,ispra.html,santa-margherita.html,nice.html">
        <button class="ux-nav-group-toggle" type="button" aria-expanded="false">Trip <span aria-hidden="true">⌄</span></button>
        <div class="ux-nav-menu">
          <a href="verona.html">Verona <small>Oct 1–4</small></a>
          <a href="parma.html">Parma <small>Oct 4–7</small></a>
          <a href="ispra.html">Ispra <small>Oct 7–11</small></a>
          <a href="santa-margherita.html">Santa Margherita <small>Oct 11–14</small></a>
          <a href="nice.html">French Riviera <small>Oct 14–18</small></a>
        </div>
      </div>
      <a class="ux-nav-link" href="wedding.html" data-page="wedding.html">Wedding</a>
      <div class="ux-nav-group" data-pages="recommendations.html,essentials.html,transportation.html,credits.html">
        <button class="ux-nav-group-toggle" type="button" aria-expanded="false">More <span aria-hidden="true">⌄</span></button>
        <div class="ux-nav-menu">
          <a href="recommendations.html">Food & Events</a>
          <a href="essentials.html">Essentials</a>
          <a href="transportation.html">Transport</a>
          <a href="credits.html">Photo credits</a>
        </div>
      </div>`;

    const page = currentPage();
    nav.querySelectorAll('[data-page]').forEach(link => {
      const active = link.dataset.page === page;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
    });
    nav.querySelectorAll('.ux-nav-group').forEach(group => {
      const pages = (group.dataset.pages || '').split(',');
      if (pages.includes(page)) group.classList.add('active');
    });

    const closeGroups = except => {
      nav.querySelectorAll('.ux-nav-group').forEach(group => {
        if (group === except) return;
        group.classList.remove('open');
        const button = group.querySelector('.ux-nav-group-toggle');
        if (button) button.setAttribute('aria-expanded', 'false');
      });
    };

    nav.querySelectorAll('.ux-nav-group-toggle').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const group = button.closest('.ux-nav-group');
        const willOpen = !group.classList.contains('open');
        closeGroups(group);
        group.classList.toggle('open', willOpen);
        button.setAttribute('aria-expanded', String(willOpen));
      });
    });

    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      closeGroups();
      closeMobileMenu();
    }));

    document.addEventListener('click', event => {
      if (!nav.contains(event.target)) closeGroups();
    });
  };

  const tripMode = () => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const live = key >= '2026-10-01' && key <= '2026-10-18';
    document.body.classList.toggle('ux-trip-live', live);
  };

  const destinationProgressiveDisclosure = () => {
    const layout = document.querySelector('.city-map-layout');
    if (!layout || layout.dataset.uxReady === 'true') return;
    layout.dataset.uxReady = 'true';
    layout.classList.add('ux-explore-section');

    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.className = 'ux-explore-toggle';
    reveal.setAttribute('aria-expanded', 'false');
    reveal.innerHTML = '<span>Explore nearby</span><small>Map, restaurants, groceries, sights & more</small><b aria-hidden="true">＋</b>';
    layout.parentNode.insertBefore(reveal, layout);

    const setOpen = open => {
      layout.classList.toggle('is-open', open);
      reveal.classList.toggle('is-open', open);
      reveal.setAttribute('aria-expanded', String(open));
      const icon = reveal.querySelector('b');
      if (icon) icon.textContent = open ? '−' : '＋';
      if (open) setTimeout(() => window.dispatchEvent(new Event('resize')), 80);
    };

    reveal.addEventListener('click', () => setOpen(!layout.classList.contains('is-open')));
    document.querySelectorAll('a[href="#map"],a[href="#restaurants"]').forEach(link => {
      link.addEventListener('click', () => setOpen(true));
    });
    if (['#map','#restaurants'].includes(window.location.hash)) setOpen(true);
  };

  const collapseRecommendations = () => {
    document.querySelectorAll('.reco-block').forEach((block, index) => {
      const grid = block.querySelector('.pick-grid');
      if (!grid || grid.children.length < 2 || grid.dataset.uxReady === 'true') return;
      grid.dataset.uxReady = 'true';
      grid.classList.add('ux-pick-grid');
      [...grid.children].forEach((card, i) => card.classList.toggle('ux-extra-pick', i > 0));

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ux-show-more';
      button.setAttribute('aria-expanded', 'false');
      const total = grid.children.length;
      button.textContent = `See ${total - 1} more ${total - 1 === 1 ? 'option' : 'options'}`;
      block.insertBefore(button, grid.nextSibling);
      button.addEventListener('click', () => {
        const expanded = grid.classList.toggle('ux-expanded');
        button.setAttribute('aria-expanded', String(expanded));
        button.textContent = expanded ? 'Show less' : `See ${total - 1} more ${total - 1 === 1 ? 'option' : 'options'}`;
      });
    });
  };

  const todayCorrections = () => {
    if (currentPage() !== 'today.html') return;
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    const setHref = (id, value) => { const el = document.getElementById(id); if (el) el.href = value; };

    if (key === '2026-10-10') {
      set('dashboard-stay', 'Gemma’s Nest • honeymoon night');
      set('dashboard-stay-name', 'Gemma’s Nest');
      set('dashboard-address', 'Via Milite Ignoto 18, 21027 Ispra VA, Italy');
      setHref('dashboard-directions-link', 'https://www.google.com/maps/search/?api=1&query=Via%20Milite%20Ignoto%2018%2C%2021027%20Ispra%20VA%2C%20Italy');
    }
    if (key >= '2026-10-14' && key <= '2026-10-18') {
      set('dashboard-address', '13 Boulevard Eugène Gauthier, 06310 Beaulieu-sur-Mer, France');
      setHref('dashboard-directions-link', 'https://www.google.com/maps/search/?api=1&query=13%20Boulevard%20Eug%C3%A8ne%20Gauthier%2C%2006310%20Beaulieu-sur-Mer%2C%20France');
    }
  };

  const openTodayDetailsWhenLinked = () => {
    if (currentPage() !== 'today.html') return;
    document.querySelectorAll('details.ux-details a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        const target = document.querySelector(link.getAttribute('href'));
        const details = target && target.closest('details');
        if (details) details.open = true;
      });
    });
  };


  const destinationLoveNotes = () => {
    const notes = {
      'verona.html': {
        kicker: 'Why it feels like us',
        text: 'A Roman city with a 1st-century arena and the love story that made Verona famous. Two thousand years of history, but somehow it still feels built for an evening walk together.'
      },
      'parma.html': {
        kicker: 'Why it feels like us',
        text: 'Once an elegant little duchy and a stop on Europe’s Grand Tour, Parma is now a UNESCO Creative City of Gastronomy. In other words: art, opera, cheese, prosciutto, and a very convincing case for falling in love over dinner.'
      },
      'ispra.html': {
        kicker: 'Why it feels like us',
        text: 'This quiet Lake Maggiore village has prehistoric and Roman roots, plus old lime kilns along the shore from its 19th-century industrial days. Now the lake has a softer job: being the backdrop for our wedding.'
      },
      'santa-margherita.html': {
        kicker: 'Why it feels like us',
        text: 'Villa Durazzo has looked over the Gulf of Tigullio since 1678, surrounded by gardens, sea air and grand Riviera style. Santa Margherita feels polished without trying too hard — basically a honeymoon town that already knows how to dress for dinner.'
      },
      'nice.html': {
        kicker: 'Why it feels like us',
        text: 'Beaulieu grew into a Belle Époque winter escape for European royalty and still carries that old Riviera elegance. It is our quiet little “pearl of the Côte d’Azur” between Nice and Monaco — a fitting place to let the honeymoon slow down.'
      }
    };
    const cfg = notes[currentPage()];
    const chips = document.querySelector('.destination-chips');
    if (!cfg || !chips) return;
    const note = document.createElement('div');
    note.className = 'destination-love-note';
    note.innerHTML = `<span>${cfg.kicker}</span><p>${cfg.text}</p>`;
    chips.replaceWith(note);
  };

  const privateBookingLocker = () => {
    const locker = document.getElementById('private-booking-codes');
    if (!locker) return;
    const status = document.getElementById('private-code-status');
    const fields = [...locker.querySelectorAll('[data-private-code]')];
    fields.forEach(input => {
      try { input.value = localStorage.getItem(`sb-private-${input.dataset.privateCode}`) || ''; } catch {}
    });
    const say = message => {
      if (!status) return;
      status.textContent = message;
      clearTimeout(say.timer);
      say.timer = setTimeout(() => { status.textContent = ''; }, 3000);
    };
    locker.querySelector('[data-save-private]')?.addEventListener('click', () => {
      try {
        fields.forEach(input => localStorage.setItem(`sb-private-${input.dataset.privateCode}`, input.value.trim()));
        say('Saved only on this device ✓');
      } catch { say('This browser could not save the codes.'); }
    });
    locker.querySelector('[data-clear-private]')?.addEventListener('click', () => {
      try {
        fields.forEach(input => { localStorage.removeItem(`sb-private-${input.dataset.privateCode}`); input.value=''; });
        say('Private codes cleared from this device.');
      } catch {}
    });
    locker.querySelectorAll('[data-copy-private]').forEach(button => {
      button.addEventListener('click', async () => {
        const input = locker.querySelector(`[data-private-code="${button.dataset.copyPrivate}"]`);
        if (!input?.value.trim()) { say('Enter and save that code first.'); return; }
        try { await navigator.clipboard.writeText(input.value.trim()); say('Copied ✓'); }
        catch { input.select(); document.execCommand('copy'); say('Copied ✓'); }
      });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    compactNavigation();
    destinationLoveNotes();
    privateBookingLocker();
    tripMode();
    destinationProgressiveDisclosure();
    collapseRecommendations();
    todayCorrections();
    openTodayDetailsWhenLinked();
  });
})();
