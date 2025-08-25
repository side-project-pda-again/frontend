import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-gray-100">
      <header className="w-full">
        <Header />
      </header>
      <main className="flex flex-grow flex-col min-h-screen w-full">
        <Outlet />
      </main>
      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
}
