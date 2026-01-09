export default function Footer() {
    const y = new Date().getFullYear();
    return (
        <footer className="site-footer">
            <div className="container footer-inner">
                <div>© {y} Student Events</div>
                <div className="footer-links">
                    <a href="#" onClick={(e)=>e.preventDefault()}>About</a>
                    <a href="#" onClick={(e)=>e.preventDefault()}>Contact</a>
                    <a href="#" onClick={(e)=>e.preventDefault()}>Terms</a>
                </div>
            </div>
        </footer>
    );
}
