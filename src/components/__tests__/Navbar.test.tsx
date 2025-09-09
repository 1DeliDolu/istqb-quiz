import { render, screen } from '@testing-library/react'
import React from 'react'
import Navbar from '@/components/Navbar'

describe('Navbar', () => {
  it('shows login/register links when logged out', () => {
    localStorage.removeItem('user')
    render(<Navbar />)
    expect(screen.getByText('Giriş')).toBeInTheDocument()
    expect(screen.getByText('Kayıt Ol')).toBeInTheDocument()
  })
})

