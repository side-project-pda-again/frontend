import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex-col flex-grow w-full overflow-x-hidden">
      <header className="fixed top-0">
        <Header />
      </header>
      <main className="flex flex-grow flex-col min-h-screen">
        <Outlet />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
