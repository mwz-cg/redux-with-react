function counterReducer(state, action) {
  if (action.type === 'INCREMENT') {
    return state + 1
  } else if (action.type === 'DECREMENT') {
    return state //FIXME: - 1
  }
}

export default counterReducer
