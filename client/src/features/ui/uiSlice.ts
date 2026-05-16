import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  isMegaMenuOpen: boolean
  isMobileNavOpen: boolean
  isBasketDrawerOpen: boolean
  isSearchOpen: boolean
  toastMessage: string | null
  toastType: 'success' | 'error' | 'info'
}

const initialState: UIState = {
  isMegaMenuOpen: false,
  isMobileNavOpen: false,
  isBasketDrawerOpen: false,
  isSearchOpen: false,
  toastMessage: null,
  toastType: 'success',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMegaMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMegaMenuOpen = action.payload
    },
    setMobileNavOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileNavOpen = action.payload
    },
    setBasketDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isBasketDrawerOpen = action.payload
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchOpen = action.payload
    },
    closeAllOverlays: (state) => {
      state.isMegaMenuOpen = false
      state.isMobileNavOpen = false
      state.isBasketDrawerOpen = false
      state.isSearchOpen = false
    },
    showToast: (
      state,
      action: PayloadAction<{ message: string; type?: 'success' | 'error' | 'info' }>,
    ) => {
      state.toastMessage = action.payload.message
      state.toastType = action.payload.type ?? 'success'
    },
    hideToast: (state) => {
      state.toastMessage = null
    },
  },
})

export const {
  setMegaMenuOpen,
  setMobileNavOpen,
  setBasketDrawerOpen,
  setSearchOpen,
  closeAllOverlays,
  showToast,
  hideToast,
} = uiSlice.actions

export default uiSlice.reducer
