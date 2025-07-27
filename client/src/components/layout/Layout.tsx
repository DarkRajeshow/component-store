import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen">
            <main className="p-4">
                <Navbar />
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
