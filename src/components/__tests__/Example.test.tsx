import { render, screen } from '@testing-library/react'
import React from 'react'

function Example() {
  return <button>Click me</button>
}

test('renders button', () => {
  render(<Example />)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})

