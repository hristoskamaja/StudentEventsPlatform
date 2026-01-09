import {Link, NavLink} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";

export default function Header() {
    const {ready, authenticated, hasRole, username, login, logout} = useAuth();
    const initial = (username || "•").slice(0, 1).toUpperCase();

    return (
        <header className="site-header">
            <div className="container header-inner">
                {/* Brand */}
                <Link to="/" className="brand" aria-label="Home">
                    <span className="dot"/>
                    <span className="brand-main">Student</span>
                    <span className="brand-sub">Events</span>
                </Link>

                {/* Nav */}
                <nav className="nav">
                    <NavLink to="/" end>Почетна</NavLink>
                    <NavLink to="/events">Настани</NavLink>

                    {authenticated && hasRole("STUDENT") && !hasRole("ADMIN") && !hasRole("ORGANIZER") && (
                        <NavLink to="/registrations">Мои Пријави</NavLink>
                    )}


                    {authenticated && (hasRole("ADMIN") || hasRole("ORGANIZER")) && (
                        <NavLink to="/manage">Моја Администрација</NavLink>
                    )}
                </nav>

                {/* User bar */}
                <div className="userbar">
                    {authenticated ? (
                        <>
                            <div className="avatar" title={username || "account"}>{initial}</div>
                            <button className="btn outline" onClick={logout}>Одјава</button>
                        </>
                    ) : (
                        <button className="btn primary" onClick={login}>Најава</button>
                    )}
                </div>
            </div>
        </header>
    );
}
