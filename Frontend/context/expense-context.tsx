"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

// Types
export interface Expense {
  id: string
  date: string
  category: "fuel" | "oil" | "filter" | "salary" | "maintenance" | "other"
  description: string
  amount: number
}

interface ExpenseState {
  expenses: Expense[]
}

type ExpenseAction =
  | { type: "INITIALIZE"; payload: ExpenseState }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "UPDATE_EXPENSE"; payload: Expense }
  | { type: "DELETE_EXPENSE"; payload: string }
  | { type: "RESET_DATA" }

// Initial state
const initialState: ExpenseState = {
  expenses: [],
}

// Reducer
const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  switch (action.type) {
    case "INITIALIZE":
      return action.payload

    case "ADD_EXPENSE":
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
      }

    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((expense) => (expense.id === action.payload.id ? action.payload : expense)),
      }

    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter((expense) => expense.id !== action.payload),
      }
    case "RESET_DATA": {
      return initialState
    }

    default:
      return state
  }
}

// Context
const ExpenseContext = createContext<
  | {
      state: ExpenseState
      addExpense: (expense: Omit<Expense, "id">) => void
      updateExpense: (expense: Expense) => void
      deleteExpense: (id: string) => void
      getFilteredExpenses: (startDate: string, endDate: string) => Expense[]
      getTotalExpenses: (startDate: string, endDate: string) => number
      resetData: () => void
    }
  | undefined
>(undefined)

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState)

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("expenseState")
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
    localStorage.setItem("expenseState", JSON.stringify(state))
  }, [state])

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    }
    dispatch({ type: "ADD_EXPENSE", payload: newExpense })
  }

  const updateExpense = (expense: Expense) => {
    dispatch({ type: "UPDATE_EXPENSE", payload: expense })
  }

  const deleteExpense = (id: string) => {
    dispatch({ type: "DELETE_EXPENSE", payload: id })
  }

  const getFilteredExpenses = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Set to end of day

    return state.expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= start && expenseDate <= end
    })
  }

  const getTotalExpenses = (startDate: string, endDate: string) => {
    const filteredExpenses = getFilteredExpenses(startDate, endDate)
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0)
  }

  const resetData = () => {
    dispatch({ type: "RESET_DATA" })
  }

  return (
    <ExpenseContext.Provider
      value={{
        state,
        addExpense,
        updateExpense,
        deleteExpense,
        getFilteredExpenses,
        getTotalExpenses,
        resetData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

export const useExpense = () => {
  const context = useContext(ExpenseContext)
  if (context === undefined) {
    throw new Error("useExpense doit être utilisé à l'intérieur d'un ExpenseProvider")
  }
  return context
}
