import { ReactNode } from "react";
import Navbar from "../common/Navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

export default Layout;
