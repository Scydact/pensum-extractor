# Notes for myself

## To deploy to gh-pages
Run `npm run predeploy` and then `npm run deploy`. `predeploy` is necessary as it runs the `build` script.

Thanks to [this guide](https://github.com/gitname/react-gh-pages/tree/master).

For more info, check [gh-pages npm package](https://www.npmjs.com/package/gh-pages).

PS: The `npm run start` script may not work on mac/linux, since I modified it to set the env variable `PUBLIC_URL=''` so that localhost is not broken.


## Beautiful hooks
For any "standard hook", copy the definition manually from [useHooks TS](https://usehooks-ts.com/)

## Service worker config
Used the standard workbox from [Google's guide](https://developers.google.com/web/tools/workbox/guides/get-started).

Configured for PWA with react using [Medium's guide](https://imranhsayed.medium.com/setup-pwa-workbox-webpack-plugin-for-react-application-workbox-window-precaching-caching-at-40f9289650e5).

### TODO: Make the app work again
- [ ] Use manually setting a [Local CORS Proxy](https://github.com/dkaoster/local-cors-anywhere)
- [ ] Pensum editor (toggle)
  - [ ] Drag & drop mats around cuats
  - [ ] Undo/redo (Ctrl+Z)
  - [ ] Create new mat (will place at last), automatically scroll to it.
  - [ ] Use selection to delete?

  - [ ] Mat window:
    - [ ] View unhandled loose, and automatically add
    - [ ] Empty cuats have a minimal height
    - [ ] Bulk add from CSV (use export format, but append instead of replace)
    - [ ] Single mat editor, with a select (multiple) for prereqs

  - [ ] Pensum window, set pensum metadata (source, cuat type, university, logo, etc...)

- [X] Allow tracking
  - [X] Use a .clickable class to toggle :hover background.
  - [X] With .clickable done, clean table headers from not():hover
  - [ ] Selection, on a different tracker
    - [ ] To use with tools/selectors (select all post-reqs, prereqs, etc...)
  - [X] Save/load to local storage
    - Save as an object {current: {}, currentName: string | null, others: {}},
      where current is the current thing. 
    - That allows multiple saving/loading profiles!
    - [ ] Custom dialog to select current save
  - [ ] Save/load to backup
    - On same dialog, save either a single profile or all profiles.

- [X] Mat modal dialog
	- [X] Single mat
	- [X] Unknown mat
	- [ ] Mat index (no mat selected)

- [ ] Save to CSV/EXCEL/JSON

- [X] Migrate to Vite
- [X] Treeview thing
	- [X] Dark mode friendly (connection lines are currently black)
  - [X] Export to PDF & PNG
  - [X] On click open mat info
  - [X] Go to reference from matinfo (using url params)

- [X] Mat post-req and processing
  - [X] Use map to associate post-reqs?
- [X] Add src tag to pensum type (check TODO at the end of the page).
- [X] Add period-type to university.json (If its a semester/cuarter/trimester...), with full name and short name (Sm. Tr. ).
- [X] Get dark mode from user preference (using @media stuff thingy, check the original DarkMode class)
- [X] Add labels to the Uni/Career React-Select selectors.
- [X] Display loose mats somewhere
- [X] Do .course and .passed coloring using css variables with hsv().
- [X] TODO: IMPORTANT! Show dialog when service worker has update. Clear SW caches (at least main JS cache).
- [X] Calcular indice
- [X] Enable PWA support


### TODO: Extra new features
  - [ ] Extra colors (custom highlights)
  - [ ] Save tracking to cloud service
  - [ ] Compare pensums :D
    - [ ] Route ./compare
    - [ ] Uses `<PensumSelect>` and a custom version of `<pensumTable`>?
    - [ ] Allow <PensumSelect> to upload a custom pensum.json. Maybe aside the "Cargar" button.  (Cargar / Subir).
- [ ] Overview: Cr, mats/period
- [ ] Etc!

