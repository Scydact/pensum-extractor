
// Src: https://github.com/vinorodrigues/bootstrap-dark-5/blob/main/examples/cheatsheet-night.html
// parts from: https://radek.io/posts/secret-darkmode-toggle/

var isCssInit = false;
var darkmode = false;

function setColorPreference(color_p: string, persist = false, initial = false) {
  const new_s = color_p;
  const old_s = color_p === 'light' ? 'dark' : 'light'

  const el = document.body;  // gets root <html> tag
  el.classList.add('color-scheme-' + new_s);
  el.classList.remove('color-scheme-' + old_s);

  // Background transitions ONLY on switching theme
  if (!initial) {
    el.classList.add('color-scheme-transition');
    setTimeout(() => {
      el.classList.remove('color-scheme-transition');
    }, 500);
  }

  if (persist) {
    localStorage.setItem('preferred-color-scheme', color_p);
  }
}

function updateUI(color_p: string, id = 'css') {
  // toggle_btn.checked = color_p === 'dark';

  if (isCssInit) {
    const el = document.querySelector('#' + id) as HTMLElement;
    const data = el.dataset;
    if (color_p === 'dark') {
      el.setAttribute('href', data.hrefDark || '');
      darkmode = true;
    } else {
      el.setAttribute('href', data.hrefLight || '');
      darkmode = false;
    }
    data.colorScheme = color_p;
  }
}

function initColorCSS(color_p: string, id = 'css') {
  isCssInit = true;

  var el_o = document.querySelector('#' + id) as HTMLElement;
  var el: HTMLElement;
  if (el_o !== null) el_o.remove();
  var el_l = document.querySelector('#' + id + '-light') as HTMLElement;
  var el_d = document.querySelector('#' + id + '-dark') as HTMLElement;
  if (color_p === 'dark') {
    el = el_d;
    el_o = el_l;
  } else {
    el = el_l;
    el_o = el_d;
  }
  el.setAttribute('data-href-light', el_l.getAttribute('href') || '');
  el.setAttribute('data-href-dark', el_d.getAttribute('href') || '');
  el.setAttribute('data-color-scheme', color_p);
  el.setAttribute('media', 'all');
  el.setAttribute('id', id);
  el_o.remove();
}


export function setDarkmode(dark: boolean) {
  const color_p = dark ? 'dark' : 'light';

  if (!isCssInit) initColorCSS(color_p);

  setColorPreference(color_p, true);
  updateUI(color_p);
}

export function getDarkmode() {
  return darkmode;
}

export function setThemePreferenceOnLoad() {
  /* Set Preference on load */
  const osColorPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  // console.log('OS wants ' + osColorPreference);
  var preferredColorScheme = localStorage.getItem('preferred-color-scheme');
  if (preferredColorScheme !== null) {
    initColorCSS(preferredColorScheme);
  } else {
    preferredColorScheme = osColorPreference;
  }
  setColorPreference(preferredColorScheme, false, true);
  updateUI(preferredColorScheme);
}
