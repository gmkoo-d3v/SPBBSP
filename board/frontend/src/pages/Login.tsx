import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import Swal from 'sweetalert2'

const Login: React.FC = () => {
  const { login } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '아이디와 비밀번호를 입력해주세요.',
      })
      return
    }

    setLoading(true)
    try {
      await login(username, password)
      Swal.fire({
        icon: 'success',
        title: '로그인 성공',
        text: '환영합니다!',
        timer: 1000,
        showConfirmButton: false,
      })
      nav('/')
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: '로그인 실패',
        text: err?.response?.data?.message || '로그인에 실패했습니다.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg mb-4">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">로그인</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">게시판에 접속하세요</p>
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
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요"
              className="input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login

