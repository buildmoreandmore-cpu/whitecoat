'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import QuestionnairePanel from './QuestionnairePanel'

interface QuestionnaireContextType {
  openQuestionnaire: () => void
}

const QuestionnaireContext = createContext<QuestionnaireContextType>({
  openQuestionnaire: () => {},
})

export const useQuestionnaire = () => useContext(QuestionnaireContext)

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openQuestionnaire = () => setIsOpen(true)
  const closeQuestionnaire = () => setIsOpen(false)

  return (
    <QuestionnaireContext.Provider value={{ openQuestionnaire }}>
      {children}
      <QuestionnairePanel isOpen={isOpen} onClose={closeQuestionnaire} />
    </QuestionnaireContext.Provider>
  )
}
