import type { GameState, Action } from './types'

export const initialState: GameState = {
  phase: 'start',
  currentPair: null,
  category: null,
  streak: 0,
  record: 0,
  choice: null,
  history: [],
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        phase: 'comparing',
        category: action.category,
        currentPair: action.pair,
        streak: 0,
        choice: null,
        history: [action.pair[0].id, action.pair[1].id],
      }

    case 'CHOOSE':
      return {
        ...state,
        phase: 'revealing',
        choice: action.choice,
      }

    case 'REVEAL_COMPLETE': {
      if (action.isCorrect) {
        const newStreak = state.streak + 1
        return {
          ...state,
          streak: newStreak,
          record: Math.max(newStreak, state.record),
        }
      }
      return {
        ...state,
        phase: 'game_over',
      }
    }

    case 'NEXT_ROUND':
      return {
        ...state,
        phase: 'comparing',
        currentPair: action.pair,
        choice: null,
        history: [...new Set([...state.history, action.pair[0].id, action.pair[1].id])],
      }

    case 'RESET':
      return {
        ...initialState,
        record: state.record,
      }

    case 'QUIT':
      return {
        ...initialState,
        record: state.record,
      }

    default:
      return state
  }
}
