import { useState } from 'react'
import Header from './components/Header'
import NavBar from './components/NavBar'
import ConceptSection from './components/ConceptSection'
import PositioningDiagram from './components/PositioningDiagram'
import ThrowingTechnique from './components/ThrowingTechnique'
import Quiz from './components/Quiz'

export default function App() {
  const [activeTab, setActiveTab] = useState('learn')

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <NavBar active={activeTab} onChange={setActiveTab} />
      <main>
        {activeTab === 'learn'     && <ConceptSection />}
        {activeTab === 'positions' && <PositioningDiagram />}
        {activeTab === 'technique' && <ThrowingTechnique />}
        {activeTab === 'quiz'      && <Quiz />}
      </main>
      <footer className="text-center py-6 text-gray-400 text-sm">
        Coach Cutoff ⚾ — Teaching baseball one relay at a time
      </footer>
    </div>
  )
}
