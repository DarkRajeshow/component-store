import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="max-w-7xl mx-auto p-4 pt-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
