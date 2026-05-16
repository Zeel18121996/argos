import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { loginSchema, type LoginFormData } from '@/schemas/login'
import { useAppDispatch } from '@/hooks/useRedux'
import { loginSuccess } from '@/store/slices/authSlice'
import { PATHS } from '@/constants/path'
import InputField from '@/components/Form/InputField'
import type { User } from '@/interfaces/user.interface'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: yupResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    await new Promise((r) => setTimeout(r, 800))

    const mockUser: User = {
      id: 'u1',
      email: data.email,
      firstName: 'Alex',
      lastName: 'Johnson',
      addresses: [],
    }
    dispatch(loginSuccess({ user: mockUser, token: 'mock-jwt-token' }))
    navigate(PATHS.ACCOUNT)
  }

  return (
    <div className="argos-container py-10 flex justify-center">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-argos-green rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <span className="text-white font-bold text-2xl italic">a</span>
          </div>
          <h1 className="text-[24px] font-bold text-argos-dark">Sign in to Argos</h1>
        </div>

        <div className="bg-white border border-argos-border rounded-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <InputField
              label="Email address"
              registration={register('email')}
              error={errors.email}
              type="email"
              placeholder="your@email.com"
              required
            />
            <InputField
              label="Password"
              registration={register('password')}
              error={errors.password}
              type="password"
              placeholder="Enter your password"
              required
            />

            <div className="text-right">
              <span className="text-[13px] text-argos-blue hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-argos-green text-white font-bold py-3 rounded-sm hover:bg-argos-green-dark disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-argos-border" />
            <span className="text-[12px] text-argos-gray-mid">or</span>
            <div className="flex-1 h-px bg-argos-border" />
          </div>

          <p className="text-center text-[14px] text-argos-gray">
            Don't have an account?{' '}
            <Link to={PATHS.REGISTER} className="text-argos-green font-bold hover:underline">
              Register
            </Link>
          </p>
        </div>

        <p className="text-center text-[12px] text-argos-gray-mid mt-4 leading-relaxed">
          By signing in, you agree to the Argos{' '}
          <span className="text-argos-blue cursor-pointer hover:underline">
            Terms &amp; Conditions
          </span>{' '}
          and <span className="text-argos-blue cursor-pointer hover:underline">Privacy Policy</span>
          .
        </p>
      </div>
    </div>
  )
}

export default Login
