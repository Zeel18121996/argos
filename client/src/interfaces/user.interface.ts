export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  addresses: Address[]
}

export interface Address {
  id: string
  label?: string
  line1: string
  line2?: string
  city: string
  county?: string
  postcode: string
  isDefault: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
