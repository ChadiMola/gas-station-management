"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

// Types
export interface Employee {
  id: string
  name: string
  shift: "morning" | "night" | "both"
  salary: number
  position: string
  hireDate: string
  status: "active" | "inactive"
}

interface EmployeeState {
  employees: Employee[]
}

type EmployeeAction =
  | { type: "INITIALIZE"; payload: EmployeeState }
  | { type: "ADD_EMPLOYEE"; payload: Employee }
  | { type: "UPDATE_EMPLOYEE"; payload: Employee }
  | { type: "DELETE_EMPLOYEE"; payload: string }
  | { type: "RESET_DATA" }

// Initial state
const initialState: EmployeeState = {
  employees: [],
}

// Reducer
const employeeReducer = (state: EmployeeState, action: EmployeeAction): EmployeeState => {
  switch (action.type) {
    case "INITIALIZE":
      return action.payload

    case "ADD_EMPLOYEE":
      return {
        ...state,
        employees: [...state.employees, action.payload],
      }

    case "UPDATE_EMPLOYEE":
      return {
        ...state,
        employees: state.employees.map((employee) => (employee.id === action.payload.id ? action.payload : employee)),
      }

    case "DELETE_EMPLOYEE":
      return {
        ...state,
        employees: state.employees.filter((employee) => employee.id !== action.payload),
      }

    case "RESET_DATA": {
      return initialState
    }

    default:
      return state
  }
}

// Context
const EmployeeContext = createContext<
  | {
      state: EmployeeState
      addEmployee: (employee: Omit<Employee, "id">) => void
      updateEmployee: (employee: Employee) => void
      deleteEmployee: (id: string) => void
      getActiveEmployees: () => Employee[]
      getTotalSalaries: () => number
      getEmployeesByShift: (shift: "morning" | "night" | "both") => Employee[]
      resetData: () => void
    }
  | undefined
>(undefined)

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(employeeReducer, initialState)

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("employeeState")
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
    localStorage.setItem("employeeState", JSON.stringify(state))
  }, [state])

  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString(),
    }
    dispatch({ type: "ADD_EMPLOYEE", payload: newEmployee })
  }

  const updateEmployee = (employee: Employee) => {
    dispatch({ type: "UPDATE_EMPLOYEE", payload: employee })
  }

  const deleteEmployee = (id: string) => {
    dispatch({ type: "DELETE_EMPLOYEE", payload: id })
  }

  const getActiveEmployees = () => {
    return state.employees.filter((employee) => employee.status === "active")
  }

  const getTotalSalaries = () => {
    return getActiveEmployees().reduce((total, employee) => total + employee.salary, 0)
  }

  const getEmployeesByShift = (shift: "morning" | "night" | "both") => {
    return getActiveEmployees().filter((employee) => employee.shift === shift || employee.shift === "both")
  }

  const resetData = () => {
    dispatch({ type: "RESET_DATA" })
  }

  return (
    <EmployeeContext.Provider
      value={{
        state,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getActiveEmployees,
        getTotalSalaries,
        getEmployeesByShift,
        resetData,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  )
}

export const useEmployee = () => {
  const context = useContext(EmployeeContext)
  if (context === undefined) {
    throw new Error("useEmployee doit être utilisé à l'intérieur d'un EmployeeProvider")
  }
  return context
}
