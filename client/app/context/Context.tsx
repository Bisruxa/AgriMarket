"use client"

import { createContext, Dispatch, SetStateAction } from "react";

interface ContextType {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}

export const Context = createContext<ContextType | null>(null);