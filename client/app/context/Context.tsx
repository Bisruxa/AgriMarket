"use client"

import { createContext, Dispatch, SetStateAction } from "react";

interface ContextType {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  compoqnent: 'add' | 'edit' | null;
  setComponent:(component:'add' | 'edit' | null) => void;
}

export const Context = createContext<ContextType | null>(null);