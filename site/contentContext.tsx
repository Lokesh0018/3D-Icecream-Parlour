import React, { createContext, useContext, useState, ReactNode } from "react";
import * as icecreamContent from "./icecreamContent";
import * as cakesContent from "./cakesContent";

type ContentType = typeof icecreamContent;

interface ContentContextType extends ContentType {
  isCake: boolean;
  toggleCake: () => void;
}

import { flushSync } from "react-dom";

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [isCake, setIsCake] = useState(false);

  const toggleCake = () => {
    if (!document.startViewTransition) {
      setIsCake((prev) => !prev);
      return;
    }
    const style = document.createElement('style');
    style.textContent = `:root { view-transition-name: none !important; }`;
    document.head.appendChild(style);
    
    const transition = document.startViewTransition(() => {
      flushSync(() => setIsCake((prev) => !prev));
    });
    transition.finished.finally(() => document.head.removeChild(style));
  };

  const currentContent = isCake ? cakesContent : icecreamContent;

  const value = {
    ...currentContent,
    isCake,
    toggleCake,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
