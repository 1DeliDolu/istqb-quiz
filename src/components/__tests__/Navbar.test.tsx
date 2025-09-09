import { render, screen } from '@testing-library/react'
import fs from 'fs'
import path from 'path'
import Navbar from '@/components/Navbar'

function readCredentials() {
  const ymlPath = path.resolve(process.cwd(), 'provisioning/datasources/datasources.yml')
  const content = fs.readFileSync(ymlPath, 'utf8')
  const userMatch = content.match(/user:\s*'?([^'\n]+)'?/)
  const passMatch = content.match(/\bpassword:\s*'?([^'\n]+)'?/)
  const username = userMatch?.[1] || 'testuser'
  const password = passMatch?.[1] || 'secret'
  return { username, password }
}

describe('Navbar', () => {
  it('shows login/register links when logged out', () => {
    localStorage.removeItem('user')
    render(<Navbar />)
    expect(screen.getByText('Giriş')).toBeInTheDocument()
    expect(screen.getByText('Kayıt Ol')).toBeInTheDocument()
  })

  it('shows welcome with username when logged in (from datasources.yml)', async () => {
    const { username } = readCredentials()
    localStorage.setItem('user', JSON.stringify({ id: 1, username }))
    localStorage.setItem('authToken', 'mock-token')

    render(<Navbar />)
    expect(await screen.findByText('Hoş geldin', { exact: false })).toBeInTheDocument()
    expect(screen.getByText(username)).toBeInTheDocument()

    // cleanup
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
  })
})
