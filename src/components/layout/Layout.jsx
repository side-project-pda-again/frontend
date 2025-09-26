import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <header className="w-full z-10 fixed">
        <Header />
      </header>
      <main className="flex flex-grow flex-col min-h-screen w-full px-20 py-32">
        <Outlet />
      </main>
      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
}
