import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUESTIONS } from '../data/quizData'

function ScoreScreen({ score, total, onRetry }) {
  const pct = Math.round((score / total) * 100)
  const { emoji, message, sub } =
    pct === 100 ? { emoji: '🏆', message: 'Perfect Score!', sub: 'You\'re a cutoff expert! Your team is lucky to have you.' }
    : pct >= 75  ? { emoji: '⭐', message: 'Great Job!', sub: 'You know your cutoffs! Review the ones you missed and try again.' }
    : pct >= 50  ? { emoji: '👍', message: 'Good Start!', sub: 'You\'re getting there! Study the Positions and Technique sections and try again.' }
    :               { emoji: '📖', message: 'Keep Learning!', sub: 'Head back to the Learn and Positions sections — you\'ll get it!' }

  return (
    <motion.div
      className="text-center py-12"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <div className="text-8xl mb-4">{emoji}</div>
      <h3 className="text-3xl font-bold text-navy mb-2">{message}</h3>
      <p className="text-6xl font-bold text-gold mb-2">{score}/{total}</p>
      <p className="text-gray-500 mb-2">{pct}% correct</p>
      <p className="text-gray-600 max-w-md mx-auto mb-8">{sub}</p>

      {/* Score bar */}
      <div className="w-64 h-4 bg-gray-200 rounded-full mx-auto mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>

      <button
        onClick={onRetry}
        className="px-8 py-3 bg-field text-white font-bold text-lg rounded-xl hover:bg-field-light transition-colors shadow-md"
      >
        Try Again ⚾
      </button>
    </motion.div>
  )
}

export default function Quiz() {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = QUESTIONS[current]
  const isCorrect = selected === q.correct

  function handleSelect(idx) {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    if (idx === q.correct) setScore(s => s + 1)
  }

  function handleNext() {
    if (current + 1 >= QUESTIONS.length) {
      setDone(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  function handleRetry() {
    setCurrent(0)
    setSelected(null)
    setAnswered(false)
    setScore(0)
    setDone(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-navy mb-2">Knowledge Check</h2>
        <p className="text-gray-600">Test what you've learned about cutoff plays</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 min-h-96">
        <AnimatePresence mode="wait">
          {done ? (
            <ScoreScreen key="score" score={score} total={QUESTIONS.length} onRetry={handleRetry} />
          ) : (
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-500">
                  Question {current + 1} of {QUESTIONS.length}
                </span>
                <span className="text-sm font-semibold text-field">
                  Score: {score}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                <motion.div
                  className="h-full bg-field rounded-full"
                  animate={{ width: `${((current) / QUESTIONS.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Question */}
              <h3 className="text-xl font-bold text-navy mb-6 leading-snug">{q.question}</h3>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {q.options.map((opt, i) => {
                  let style = 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-field hover:bg-field-light hover:bg-opacity-10'
                  if (answered) {
                    if (i === q.correct) style = 'bg-green-50 border-2 border-green-500 text-green-800'
                    else if (i === selected) style = 'bg-red-50 border-2 border-red-400 text-red-800'
                    else style = 'bg-gray-50 border-2 border-gray-200 text-gray-400 opacity-60'
                  }

                  return (
                    <motion.button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={answered}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${style}`}
                    >
                      <span className="font-bold mr-2 text-gray-400">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {opt}
                      {answered && i === q.correct && <span className="float-right text-green-600 font-bold">✓</span>}
                      {answered && i === selected && i !== q.correct && <span className="float-right text-red-500 font-bold">✗</span>}
                    </motion.button>
                  )
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`rounded-xl p-4 mb-5 ${isCorrect ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}
                  >
                    <p className={`font-bold mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {isCorrect ? '🎉 Correct!' : '❌ Not quite!'}
                    </p>
                    <p className="text-gray-700 text-sm">{q.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next button */}
              {answered && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleNext}
                  className="w-full py-3 bg-field text-white font-bold text-lg rounded-xl hover:bg-field-light transition-colors shadow-sm"
                >
                  {current + 1 >= QUESTIONS.length ? 'See My Score 🏆' : 'Next Question →'}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
