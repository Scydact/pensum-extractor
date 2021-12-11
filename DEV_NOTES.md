# Notes for myself

## To deploy to gh-pages
Run `npm run predeploy` and then `npm run deploy`. `predeploy` is necessary as it runs the `build` script.

Thanks to [this guide](https://github.com/gitname/react-gh-pages/tree/master).

For more info, check [gh-pages npm package](https://www.npmjs.com/package/gh-pages).

PS: The `npm run start` script may not work on mac/linux, since I modified it to set the env variable `PUBLIC_URL=''` so that localhost is not broken.


## Beautiful hooks
This React page is using [Beautiful React Hooks](https://antonioru.github.io/beautiful-react-hooks/).

## Service worker config
Used the standard workbox from [Google's guide](https://developers.google.com/web/tools/workbox/guides/get-started).

Configured for PWA with react using [Medium's guide](https://imranhsayed.medium.com/setup-pwa-workbox-webpack-plugin-for-react-application-workbox-window-precaching-caching-at-40f9289650e5).

### TODO: Make the app work again
- [ ] [dx-react-grid](https://devexpress.github.io/devextreme-reactive/react/grid/docs/guides/getting-started/) for the pensum-editor, since it allows easy data binding.
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
- [X] Enable PWA support
- [X] Calcular indice
- [ ] Save to CSV/EXCEL/JSON
- [ ] Treeview thing
	- [ ] Dark mode friendly (connection lines are currently black)
	- [ ] Consider migration to [mermaid-js](https://mermaid-js.github.io/mermaid/#/)
- [X] Mat post-req and processing
  - [X] Use map to associate post-reqs?
- [X] Add src tag to pensum type (check TODO at the end of the page).
- [X] Add period-type to university.json (If its a semester/cuarter/trimester...), with full name and short name (Sm. Tr. ).
- [X] Get dark mode from user preference (using @media stuff thingy, check the original DarkMode class)
- [X] Add labels to the Uni/Career React-Select selectors.
- [X] Display loose mats somewhere
- [X] Do .course and .passed coloring using css variables with hsv().


### TODO: Extra new features
  - [ ] Extra colors (custom highlights)
  - [ ] Save tracking to cloud service
  - [ ] Compare pensums :D
    - [ ] Route ./compare
    - [ ] Uses `<PensumSelect>` and a custom version of `<pensumTable`>?
    - [ ] Allow <PensumSelect> to upload a custom pensum.json. Maybe aside the "Cargar" button.  (Cargar / Subir).
- [ ] Overview: Cr, mats/period
- [ ] Etc!

