"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

// Types
export interface InventoryItem {
  id: string
  reference: string
  name: string
  category: "oil" | "filter"
  quantity: number
  threshold: number
  price: number
  lastUpdated: string
}

interface InventoryState {
  items: InventoryItem[]
}

type InventoryAction =
  | { type: "INITIALIZE"; payload: InventoryState }
  | { type: "ADD_ITEM"; payload: InventoryItem }
  | { type: "UPDATE_ITEM"; payload: InventoryItem }
  | { type: "DELETE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "RESET_DATA" }

// Initial state
const initialState: InventoryState = {
  items: [],
}

// Reducer
const inventoryReducer = (state: InventoryState, action: InventoryAction): InventoryState => {
  switch (action.type) {
    case "INITIALIZE":
      return action.payload

    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, action.payload],
      }

    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) => (item.id === action.payload.id ? action.payload : item)),
      }

    case "DELETE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: action.payload.quantity,
                lastUpdated: new Date().toISOString(),
              }
            : item,
        ),
      }

    case "RESET_DATA": {
      return initialState
    }

    default:
      return state
  }
}

// Context
const InventoryContext = createContext<
  | {
      state: InventoryState
      addItem: (item: Omit<InventoryItem, "id" | "lastUpdated">) => void
      updateItem: (item: InventoryItem) => void
      deleteItem: (id: string) => void
      updateQuantity: (id: string, quantity: number) => void
      getLowStockItems: () => InventoryItem[]
      resetData: () => void
    }
  | undefined
>(undefined)

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState)

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("inventoryState")
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        dispatch({ type: "INITIALIZE", payload: parsedState })
      } catch (error) {
        console.error("Échec de l'analyse de l'état sauvegardé:", error)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("inventoryState", JSON.stringify(state))
  }, [state])

  const addItem = (item: Omit<InventoryItem, "id" | "lastUpdated">) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
    }
    dispatch({ type: "ADD_ITEM", payload: newItem })
  }

  const updateItem = (item: InventoryItem) => {
    dispatch({ type: "UPDATE_ITEM", payload: { ...item, lastUpdated: new Date().toISOString() } })
  }

  const deleteItem = (id: string) => {
    dispatch({ type: "DELETE_ITEM", payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const getLowStockItems = () => {
    return state.items.filter((item) => item.quantity <= item.threshold)
  }

  const resetData = () => {
    dispatch({ type: "RESET_DATA" })
  }

  return (
    <InventoryContext.Provider
      value={{
        state,
        addItem,
        updateItem,
        deleteItem,
        updateQuantity,
        getLowStockItems,
        resetData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export const useInventory = () => {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory doit être utilisé à l'intérieur d'un InventoryProvider")
  }
  return context
}
