// import React, { createContext, useContext, useState } from "react";

// const HamburgerContext = createContext({
//   isSidebarOpen: false,
//   toggleSidebar: () => {},
//   closeSidebar: () => {},
// });

// export const HamburgerProvider = ({ children }: { children: React.ReactNode }) => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
//   const closeSidebar = () => setIsSidebarOpen(false);

//   return (
//     <HamburgerContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
//       {children}
//     </HamburgerContext.Provider>
//   );
// };

// export const useHamburger = () => useContext(HamburgerContext);

import React, { createContext, useContext, useState } from "react";

// Define types for context value
interface HamburgerContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

// Create context with default values
const HamburgerContext = createContext<HamburgerContextType>({
  isSidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

// Provider component
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

// Custom hook for accessing the context
export const useHamburger = () => useContext(HamburgerContext);

