
function AppFooter() {
  return <footer className="mt-3 navbar navbar-expand navbar-light static-bottom">
    <span>Pensum Extractor DO</span>
    <span>Fernando Rivas, 2021</span>
    <span><a href="http://scydact.github.io/">scydact.github.io</a></span>
    <span>Version v{process.env.REACT_APP_VERSION} | save v{process.env.REACT_APP_SAVE_VERSION}</span>
    <span>
      En caso de problemas o sugerencias,
      favor escribir a <a
        href="mailto:scydact@gmail.com?subject=[Pensum Extractor]">
        scydact@gmail.com</a>.
    </span>
  </footer>
}

export default AppFooter;