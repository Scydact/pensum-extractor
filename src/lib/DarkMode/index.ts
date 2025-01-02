// Src: https://github.com/vinorodrigues/bootstrap-dark-5/blob/main/examples/cheatsheet-night.html
// parts from: https://radek.io/posts/secret-darkmode-toggle/

let isCssInit = false

function setColorPreference(color_p: string, persist = false, initial = false) {
    const new_s = color_p
    const old_s = color_p === 'light' ? 'dark' : 'light'

    const el = document.body // gets root <html> tag
    el.classList.add('color-scheme-' + new_s)
    el.classList.remove('color-scheme-' + old_s)
    el.dataset.colorScheme = new_s

    // Background transitions ONLY on switching theme
    if (!initial) {
        el.classList.add('color-scheme-transition')
        setTimeout(() => {
            el.classList.remove('color-scheme-transition')
        }, 500)
    }

    if (persist) {
        localStorage.setItem('preferred-color-scheme', color_p)
    }
}

function updateUI(color_p: string, id = 'css') {
    // toggle_btn.checked = color_p === 'dark';

    if (isCssInit) {
        const el = document.querySelector('#' + id) as HTMLElement
        const data = el.dataset
        if (color_p === 'dark') {
            el.setAttribute('href', data.hrefDark || '')
        } else {
            el.setAttribute('href', data.hrefLight || '')
        }
        data.colorScheme = color_p
    }
}

function initColorCSS(color_p: string, id = 'css') {
    isCssInit = true

    let elOg = document.querySelector('#' + id) as HTMLElement
    let el: HTMLElement
    if (elOg !== null) elOg.remove()
    const elLight = document.querySelector('#' + id + '-light') as HTMLElement
    const elDark = document.querySelector('#' + id + '-dark') as HTMLElement
    if (color_p === 'dark') {
        el = elDark
        elOg = elLight
    } else {
        el = elLight
        elOg = elDark
    }
    el.setAttribute('data-href-light', elLight.getAttribute('href') || '')
    el.setAttribute('data-href-dark', elDark.getAttribute('href') || '')
    el.setAttribute('data-color-scheme', color_p)
    el.setAttribute('media', 'all')
    el.setAttribute('id', id)
    elOg.remove()
}

export function setDarkmode(dark: boolean) {
    const color_p = dark ? 'dark' : 'light'

    if (!isCssInit) initColorCSS(color_p)

    setColorPreference(color_p, true)
    updateUI(color_p)
}

export function getDarkmode() {
    return document.body.dataset.colorScheme === 'dark'
}

export function setThemePreferenceOnLoad() {
    /* Set Preference on load */
    const osColorPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    // console.log('OS wants ' + osColorPreference);
    let preferredColorScheme = localStorage.getItem('preferred-color-scheme')
    if (preferredColorScheme !== null) {
        initColorCSS(preferredColorScheme)
    } else {
        preferredColorScheme = osColorPreference
    }
    setColorPreference(preferredColorScheme, false, true)
    updateUI(preferredColorScheme)
}
