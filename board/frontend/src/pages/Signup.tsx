import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import Swal from 'sweetalert2'

const Signup: React.FC = () => {
  const { signup } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim() || !email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '모든 필드를 입력해주세요.',
      })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '유효한 이메일을 입력해주세요.',
      })
      return
    }

    if (password.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '비밀번호는 최소 6자 이상이어야 합니다.',
      })
      return
    }

    setLoading(true)
    try {
      await signup(username, password, email)
      Swal.fire({
        icon: 'success',
        title: '회원가입 성공',
        text: '로그인 페이지로 이동합니다.',
        timer: 1500,
        showConfirmButton: false,
      })
      nav('/login')
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: '회원가입 실패',
        text: err?.response?.data?.message || '회원가입에 실패했습니다.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-lg mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">회원가입</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">새 계정을 생성하세요</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력해주세요"
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요"
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요 (6자 이상)"
              className="input"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">최소 6자 이상의 비밀번호를 입력하세요</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup

