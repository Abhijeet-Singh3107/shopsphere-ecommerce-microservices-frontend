import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Notification from '../common/Notification.jsx';

export default function RootLayout() {
  return (
    <>
      <Navbar />
      <Notification />
      <main>
        <Outlet />
      </main>
    </>
  );
}
