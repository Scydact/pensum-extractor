import { useNavigate } from 'react-router-dom'

function AppFooter() {
    const navigate = useNavigate()

    return (
        <footer className="navbar navbar-expand navbar-light static-bottom app-footer">
            <span>Pensum Extractor DO</span>
            <span>Fernando Rivas, 2025</span>
            <span>
                <a href={`https://${import.meta.env.VITE_HOMEPAGE}`} target="_blank" rel="noreferrer">
                    {import.meta.env.VITE_HOMEPAGE}
                </a>
                <span style={{ margin: '0 .5rem' }}>
                    (
                    <a href={import.meta.env.VITE_REPO_URL} target="_blank" rel="noreferrer">
                        Ver en GitHub
                    </a>
                    )
                </span>
            </span>
            <span className="text-muted">
                [ Revisión {__APP_VERSION__} | pensumV{import.meta.env.VITE_PENSUM_FORMAT_VERSION} ]
            </span>
            <span className="mt-2">
                En caso de problemas o sugerencias, favor escribir a{' '}
                <a href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL}@gmail.com?subject=[Pensum Extractor]`}>
                    {import.meta.env.VITE_CONTACT_EMAIL}
                </a>
                <span className="muted" onClick={() => navigate('debug')} title="Debug">
                    .
                </span>
            </span>
        </footer>
    )
}

export default AppFooter
