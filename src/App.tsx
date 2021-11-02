import { FormEventHandler, useEffect, useState } from 'react';
import './App.css';
import PensumExtractor from '@components/PensumExtractor';
import { fetchUniversities } from '@functions/metadata-fetch';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null as any);
  const [universities, setUniversities] = useState([] as DataJson.University[]);
  
  // Constructor?
  useEffect(() => {
    fetchUniversities()
      .then(unis => {
        setUniversities(unis.universities);
      })
      .catch(e => {
        setError(e)
      })
      .finally(() => setLoading(false))
  },[])


  return (
    <div className="App">
      
      {
        (loading) ?
          "Loading..." :
          <PensumExtractor
            universityList={universities}/>
      }

      {(error) ? <p>{String(error)}</p> : null}
      


      


      <footer>
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
    </div>
  );
}

export default App;
