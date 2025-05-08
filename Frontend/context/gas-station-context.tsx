"use client";

import type React from "react";
import { createContext, useContext, useEffect, useReducer } from "react";

// Types
export interface Pump {
  id: number;
  name: string;
  currentIndex: number;
  previousIndex: number;
  pricePerLiter: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  date: string;
  shift: "morning" | "night"; // Ajout du champ shift
  previousIndex: number;
  currentIndex: number;
  litersDispensed: number;
  pricePerLiter: number;
  revenue: number;
}

interface GasStationState {
  pumps: Pump[];
  totalLitersDispensed: number;
  totalRevenue: number;
}

type GasStationAction =
  | { type: "INITIALIZE"; payload: GasStationState }
  | {
      type: "UPDATE_PUMP_INDEX";
      payload: {
        pumpId: number;
        newIndex: number;
        date: Date;
        shift: "morning" | "night";
      };
    }
  | { type: "UPDATE_PUMP_PRICE"; payload: { pumpId: number; newPrice: number } }
  | { type: "UPDATE_PUMP_NAME"; payload: { pumpId: number; newName: string } }
  | {
      type: "DELETE_TRANSACTION";
      payload: { pumpId: number; transactionId: string };
    }
  | {
      type: "EDIT_TRANSACTION";
      payload: { pumpId: number; transactionId: string; newIndex: number };
    }
  | { type: "ADD_PUMP" }
  | { type: "RESET_DATA" };

// Initial state
const initialPumps: Pump[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: `Pompe ${i + 1}`,
  currentIndex: 0,
  previousIndex: 0,
  pricePerLiter: 1.5,
  transactions: [],
}));

const initialState: GasStationState = {
  pumps: initialPumps,
  totalLitersDispensed: 0,
  totalRevenue: 0,
};

// Helper function to recalculate totals
const recalculateTotals = (
  pumps: Pump[]
): { totalLitersDispensed: number; totalRevenue: number } => {
  let totalLitersDispensed = 0;
  let totalRevenue = 0;

  pumps.forEach((pump) => {
    pump.transactions.forEach((transaction) => {
      totalLitersDispensed += transaction.litersDispensed;
      totalRevenue += transaction.revenue;
    });
  });

  return { totalLitersDispensed, totalRevenue };
};

// Reducer
const gasStationReducer = (
  state: GasStationState,
  action: GasStationAction
): GasStationState => {
  switch (action.type) {
    case "INITIALIZE":
      return action.payload;

    case "UPDATE_PUMP_INDEX": {
      const { pumpId, newIndex, date, shift } = action.payload;

      if (newIndex <= state.pumps[pumpId - 1].currentIndex) {
        return state; // Don't allow decreasing the index
      }

      const updatedPumps = state.pumps.map((pump) => {
        if (pump.id === pumpId) {
          const previousIndex = pump.currentIndex;
          const litersDispensed = newIndex - previousIndex;
          const revenue = litersDispensed * pump.pricePerLiter;

          const newTransaction: Transaction = {
            id: Date.now().toString(),
            date: date.toISOString(),
            shift,
            previousIndex,
            currentIndex: newIndex,
            litersDispensed,
            pricePerLiter: pump.pricePerLiter,
            revenue,
          };

          return {
            ...pump,
            previousIndex,
            currentIndex: newIndex,
            transactions: [...pump.transactions, newTransaction],
          };
        }
        return pump;
      });

      const { totalLitersDispensed, totalRevenue } =
        recalculateTotals(updatedPumps);

      return {
        ...state,
        pumps: updatedPumps,
        totalLitersDispensed,
        totalRevenue,
      };
    }

    case "UPDATE_PUMP_PRICE": {
      const { pumpId, newPrice } = action.payload;

      const updatedPumps = state.pumps.map((pump) => {
        if (pump.id === pumpId) {
          return {
            ...pump,
            pricePerLiter: newPrice,
          };
        }
        return pump;
      });

      return {
        ...state,
        pumps: updatedPumps,
      };
    }

    case "UPDATE_PUMP_NAME": {
      const { pumpId, newName } = action.payload;

      const updatedPumps = state.pumps.map((pump) => {
        if (pump.id === pumpId) {
          return {
            ...pump,
            name: newName,
          };
        }
        return pump;
      });

      return {
        ...state,
        pumps: updatedPumps,
      };
    }

    case "DELETE_TRANSACTION": {
      const { pumpId, transactionId } = action.payload;

      const updatedPumps = state.pumps.map((pump) => {
        if (pump.id === pumpId) {
          // Find the transaction to delete
          const transactionIndex = pump.transactions.findIndex(
            (t) => t.id === transactionId
          );

          if (transactionIndex === -1) return pump;

          // If it's the last transaction, we need to update the current index
          const isLastTransaction =
            transactionIndex === pump.transactions.length - 1;

          // Create a new transactions array without the deleted transaction
          const newTransactions = pump.transactions.filter(
            (t) => t.id !== transactionId
          );

          // If it was the last transaction, set the current index to the previous transaction's current index
          // or to 0 if there are no more transactions
          const newCurrentIndex = isLastTransaction
            ? newTransactions.length > 0
              ? newTransactions[newTransactions.length - 1].currentIndex
              : 0
            : pump.currentIndex;

          const newPreviousIndex =
            newTransactions.length > 0 ? newTransactions[0].previousIndex : 0;

          return {
            ...pump,
            currentIndex: newCurrentIndex,
            previousIndex: newPreviousIndex,
            transactions: newTransactions,
          };
        }
        return pump;
      });

      const { totalLitersDispensed, totalRevenue } =
        recalculateTotals(updatedPumps);

      return {
        ...state,
        pumps: updatedPumps,
        totalLitersDispensed,
        totalRevenue,
      };
    }

    case "EDIT_TRANSACTION": {
      const { pumpId, transactionId, newIndex } = action.payload;

      const updatedPumps = state.pumps.map((pump) => {
        if (pump.id === pumpId) {
          // Find the transaction to edit
          const transactionIndex = pump.transactions.findIndex(
            (t) => t.id === transactionId
          );

          if (transactionIndex === -1) return pump;

          // Get the transaction
          const transaction = pump.transactions[transactionIndex];

          // Calculate new values
          const litersDispensed = newIndex - transaction.previousIndex;
          const revenue = litersDispensed * transaction.pricePerLiter;

          // Create updated transaction
          const updatedTransaction = {
            ...transaction,
            currentIndex: newIndex,
            litersDispensed,
            revenue,
          };

          // Create new transactions array with the updated transaction
          const newTransactions = [...pump.transactions];
          newTransactions[transactionIndex] = updatedTransaction;

          // If it's the last transaction, update the current index of the pump
          const isLastTransaction =
            transactionIndex === pump.transactions.length - 1;
          const newCurrentIndex = isLastTransaction
            ? newIndex
            : pump.currentIndex;

          return {
            ...pump,
            currentIndex: newCurrentIndex,
            transactions: newTransactions,
          };
        }
        return pump;
      });

      const { totalLitersDispensed, totalRevenue } =
        recalculateTotals(updatedPumps);

      return {
        ...state,
        pumps: updatedPumps,
        totalLitersDispensed,
        totalRevenue,
      };
    }

    case "ADD_PUMP": {
      // Get the highest pump ID
      const highestId = Math.max(...state.pumps.map((pump) => pump.id), 0);
      const newPumpId = highestId + 1;

      // Create a new pump
      const newPump: Pump = {
        id: newPumpId,
        name: `Pompe ${newPumpId}`,
        currentIndex: 0,
        previousIndex: 0,
        pricePerLiter: 1.5,
        transactions: [],
      };

      return {
        ...state,
        pumps: [...state.pumps, newPump],
      };
    }

    case "RESET_DATA": {
      return initialState;
    }

    default:
      return state;
  }
};

// Context
const GasStationContext = createContext<
  | {
      state: GasStationState;
      updatePumpIndex: (
        pumpId: number,
        newIndex: number,
        date?: Date,
        shift?: "morning" | "night"
      ) => void;
      updatePumpPrice: (pumpId: number, newPrice: number) => void;
      updatePumpName: (pumpId: number, newName: string) => void;
      deleteTransaction: (pumpId: number, transactionId: string) => void;
      editTransaction: (
        pumpId: number,
        transactionId: string,
        newIndex: number
      ) => void;
      getFilteredTransactions: (
        startDate: string,
        endDate: string,
        shift?: "morning" | "night" | "all"
      ) => Transaction[];
      addPump: () => void;
      resetData: () => void;
    }
  | undefined
>(undefined);

export const GasStationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gasStationReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("gasStationState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Ensure we always have 6 pumps
        if (
          !parsedState.pumps ||
          !Array.isArray(parsedState.pumps) ||
          parsedState.pumps.length !== 6
        ) {
          dispatch({ type: "INITIALIZE", payload: initialState });
        } else {
          dispatch({ type: "INITIALIZE", payload: parsedState });
        }
      } catch (error) {
        console.error("Échec de l'analyse de l'état sauvegardé:", error);
        dispatch({ type: "INITIALIZE", payload: initialState });
      }
    } else {
      dispatch({ type: "INITIALIZE", payload: initialState });
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("gasStationState", JSON.stringify(state));
  }, [state]);

  const updatePumpIndex = (
    pumpId: number,
    newIndex: number,
    date = new Date(),
    shift: "morning" | "night" = "morning"
  ) => {
    dispatch({
      type: "UPDATE_PUMP_INDEX",
      payload: { pumpId, newIndex, date, shift },
    });
  };

  const updatePumpPrice = (pumpId: number, newPrice: number) => {
    dispatch({ type: "UPDATE_PUMP_PRICE", payload: { pumpId, newPrice } });
  };

  const updatePumpName = (pumpId: number, newName: string) => {
    dispatch({ type: "UPDATE_PUMP_NAME", payload: { pumpId, newName } });
  };

  const deleteTransaction = (pumpId: number, transactionId: string) => {
    dispatch({
      type: "DELETE_TRANSACTION",
      payload: { pumpId, transactionId },
    });
  };

  const editTransaction = (
    pumpId: number,
    transactionId: string,
    newIndex: number
  ) => {
    dispatch({
      type: "EDIT_TRANSACTION",
      payload: { pumpId, transactionId, newIndex },
    });
  };

  // Add the addPump function
  const addPump = () => {
    dispatch({ type: "ADD_PUMP" });
  };

  const getFilteredTransactions = (
    startDate: string,
    endDate: string,
    shift: "morning" | "night" | "all" = "all"
  ) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Set to end of day

    const allTransactions: Transaction[] = [];

    state.pumps.forEach((pump) => {
      pump.transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.date);
        if (
          transactionDate >= start &&
          transactionDate <= end &&
          (shift === "all" || transaction.shift === shift)
        ) {
          allTransactions.push({
            ...transaction,
            id: `${pump.id}-${transaction.id}`, // Add pump ID to transaction ID for identification
          });
        }
      });
    });

    return allTransactions;
  };

  const resetData = () => {
    dispatch({ type: "RESET_DATA" });
  };

  return (
    <GasStationContext.Provider
      value={{
        state,
        updatePumpIndex,
        updatePumpPrice,
        updatePumpName,
        deleteTransaction,
        editTransaction,
        getFilteredTransactions,
        addPump,
        resetData,
      }}
    >
      {children}
    </GasStationContext.Provider>
  );
};

export const useGasStation = () => {
  const context = useContext(GasStationContext);
  if
