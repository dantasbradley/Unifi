import React, { createContext, useContext, useState } from "react";

const HamburgerContext = createContext({
  isSidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

export const HamburgerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <HamburgerContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </HamburgerContext.Provider>
  );
};

export const useHamburger = () => useContext(HamburgerContext);
