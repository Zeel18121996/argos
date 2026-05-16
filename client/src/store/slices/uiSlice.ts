import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  isMegaMenuOpen: boolean
  activeMegaMenuCategory: string | null
  isShopMenuOpen: boolean // Argos-style Shop mega menu
  activeShopCategory: string | null // currently hovered sidebar category
  isMobileMenuOpen: boolean
  isSearchFocused: boolean
  toastMessage: string | null
  toastType: 'success' | 'error' | 'info'
}

const initialState: UiState = {
  isMegaMenuOpen: false,
  activeMegaMenuCategory: null,
  isShopMenuOpen: false,
  activeShopCategory: null,
  isMobileMenuOpen: false,
  isSearchFocused: false,
  toastMessage: null,
  toastType: 'success',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openMegaMenu(state, action: PayloadAction<string>) {
      state.isMegaMenuOpen = true
      state.activeMegaMenuCategory = action.payload
    },
    closeMegaMenu(state) {
      state.isMegaMenuOpen = false
      state.activeMegaMenuCategory = null
    },
    openShopMenu(state) {
      state.isShopMenuOpen = true
      state.activeShopCategory = null // first category will be default
    },
    closeShopMenu(state) {
      state.isShopMenuOpen = false
      state.activeShopCategory = null
    },
    setActiveShopCategory(state, action: PayloadAction<string | null>) {
      state.activeShopCategory = action.payload
    },
    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    closeMobileMenu(state) {
      state.isMobileMenuOpen = false
    },
    setSearchFocused(state, action: PayloadAction<boolean>) {
      state.isSearchFocused = action.payload
    },
    showToast(
      state,
      action: PayloadAction<{ message: string; type?: 'success' | 'error' | 'info' }>,
    ) {
      state.toastMessage = action.payload.message
      state.toastType = action.payload.type ?? 'success'
    },
    hideToast(state) {
      state.toastMessage = null
    },
  },
})

export const {
  openMegaMenu,
  closeMegaMenu,
  openShopMenu,
  closeShopMenu,
  setActiveShopCategory,
  toggleMobileMenu,
  closeMobileMenu,
  setSearchFocused,
  showToast,
  hideToast,
} = uiSlice.actions
export default uiSlice.reducer
