'use client'
import TopBar from './TopBar';
import BottomBar from './BottomBar';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <TopBar />
      <BottomBar />
    </header>
  );
};

export default Navbar;