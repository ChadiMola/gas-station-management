"use client";

import type React from "react";
import { createContext, useContext, useEffect, useReducer } from "react";

// Types
export interface Pump {
  id: string;
  name: string;
  type: "fuel" | "diesel" | "other";
  status: "active" | "inactive" | "maintenance";
  location: string;
  lastService: string;
}

interface PumpState {
  pumps: Pump[];
}

type PumpAction =
  | { type: "INITIALIZE"; payload: PumpState }
  | { type: "ADD_PUMP"; payload: Pump }
  | { type: "UPDATE_PUMP"; payload: Pump }
  | { type: "DELETE_PUMP"; payload: string }
  | { type: "RESET_DATA" };

// Initial state
const initialState: PumpState = {
  pumps: [],
};

// Reducer
const pumpReducer = (state: PumpState, action: PumpAction): PumpState => {
  switch (action.type) {
    case "INITIALIZE":
      return action.payload;
    case "ADD_PUMP":
      return {
        ...state,
        pumps: [...state.pumps, action.payload],
      };
    case "UPDATE_PUMP":
      return {
        ...state,
        pumps: state.pumps.map((pump) =>
          pump.id === action.payload.id ? action.payload : pump
        ),
      };
    case "DELETE_PUMP":
      return {
        ...state,
        pumps: state.pumps.filter((pump) => pump.id !== action.payload),
      };
    case "RESET_DATA":
      return initialState;
    default:
      return state;
  }
};

// Context
const PumpContext = createContext<
  | {
      state: PumpState;
      addPump: (pump: Omit<Pump, "id" | "lastService">) => void;
      updatePump: (pump: Pump) => void;
      deletePump: (id: string) => void;
      resetData: () => void;
    }
  | undefined
>(undefined);

export const PumpProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(pumpReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("pumpState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: "INITIALIZE", payload: parsedState });
      } catch (error) {
        console.error("Échec de l'analyse de l'état sauvegardé:", error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("pumpState", JSON.stringify(state));
  }, [state]);

  const addPump = (pump: Omit<Pump, "id" | "lastService">) => {
    const newPump: Pump = {
      ...pump,
      id: Date.now().toString(),
      lastService: new Date().toISOString(),
    };
    dispatch({ type: "ADD_PUMP", payload: newPump });
  };

  const updatePump = (pump: Pump) => {
    dispatch({
      type: "UPDATE_PUMP",
      payload: { ...pump, lastService: new Date().toISOString() },
    });
  };

  const deletePump = (id: string) => {
    dispatch({ type: "DELETE_PUMP", payload: id });
  };

  const resetData = () => {
    dispatch({ type: "RESET_DATA" });
  };

  return (
    <PumpContext.Provider
      value={{
        state,
        addPump,
        updatePump,
        deletePump,
        resetData,
      }}
    >
      {children}
    </PumpContext.Provider>
  );
};

export const usePump = () => {
  const context = useContext(PumpContext);
  if (context === undefined) {
    throw new Error(
      "usePump doit être utilisé à l'intérieur d'un PumpProvider"
    );
  }
  return context;
};
