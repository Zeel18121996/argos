import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { registerSchema, type RegisterFormData } from '@/schemas/register'
import { useAppDispatch } from '@/hooks/useRedux'
import { loginSuccess } from '@/store/slices/authSlice'
import { PATHS } from '@/constants/path'
import InputField from '@/components/Form/InputField'
import type { User } from '@/interfaces/user.interface'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: yupResolver(registerSchema) })

  const onSubmit = async (data: RegisterFormData) => {
    await new Promise((r) => setTimeout(r, 800))
    const mockUser: User = {
      id: 'u2',
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      addresses: [],
    }
    dispatch(loginSuccess({ user: mockUser, token: 'mock-jwt-token' }))
    navigate(PATHS.ACCOUNT)
  }

  return (
    <div className="argos-container py-10 flex justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-argos-green rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <span className="text-white font-bold text-2xl italic">a</span>
          </div>
          <h1 className="text-[24px] font-bold text-argos-dark">Create an account</h1>
        </div>

        <div className="bg-white border border-argos-border rounded-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First name"
                registration={register('firstName')}
                error={errors.firstName}
                required
              />
              <InputField
                label="Last name"
                registration={register('lastName')}
                error={errors.lastName}
                required
              />
            </div>
            <InputField
              label="Email address"
              registration={register('email')}
              error={errors.email}
              type="email"
              required
            />
            <InputField
              label="Password"
              registration={register('password')}
              error={errors.password}
              type="password"
              required
            />
            <InputField
              label="Confirm password"
              registration={register('confirmPassword')}
              error={errors.confirmPassword}
              type="password"
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-argos-green text-white font-bold py-3 rounded-sm hover:bg-argos-green-dark disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-[14px] text-argos-gray mt-5">
            Already have an account?{' '}
            <Link to={PATHS.LOGIN} className="text-argos-green font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
