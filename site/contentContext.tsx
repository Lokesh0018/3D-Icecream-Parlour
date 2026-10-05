import React, { createContext, useContext, useState, ReactNode } from "react";
import * as icecreamContent from "./icecreamContent";
import * as cakesContent from "./cakesContent";

type ContentType = typeof icecreamContent;

interface ContentContextType extends ContentType {
  isCake: boolean;
  toggleCake: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [isCake, setIsCake] = useState(false);

  const toggleCake = () => setIsCake(!isCake);

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
