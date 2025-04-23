import React, { createContext, useContext, useState } from "react";

//define types for context value
interface HamburgerContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

//create context with default values
const HamburgerContext = createContext<HamburgerContextType>({
  isSidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

//provider component
export const HamburgerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <HamburgerContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </HamburgerContext.Provider>
  );
};

//hook for accessing the context
export const useHamburger = () => useContext(HamburgerContext);

