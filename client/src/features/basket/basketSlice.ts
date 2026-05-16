import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface BasketState {
  itemCount: number
}

const initialState: BasketState = {
  itemCount: 0,
}

const basketSlice = createSlice({
  name: 'basket',
  initialState,
  reducers: {
    setItemCount: (state, action: PayloadAction<number>) => {
      state.itemCount = action.payload
    },
    incrementCount: (state) => {
      state.itemCount += 1
    },
    decrementCount: (state) => {
      state.itemCount = Math.max(0, state.itemCount - 1)
    },
  },
})

export const { setItemCount, incrementCount, decrementCount } = basketSlice.actions
export default basketSlice.reducer
