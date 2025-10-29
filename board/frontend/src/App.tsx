import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BoardList from './pages/BoardList'
import BoardDetail from './pages/BoardDetail'
import BoardForm from './pages/BoardForm'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout>
      {children}
    </Layout>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute><BoardList /></ProtectedRoute>} />
            <Route path="/boards/new" element={<ProtectedRoute><BoardForm /></ProtectedRoute>} />
            <Route path="/boards/:id" element={<ProtectedRoute><BoardDetail /></ProtectedRoute>} />
            <Route path="/boards/:id/edit" element={<ProtectedRoute><BoardForm /></ProtectedRoute>} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
