import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import { TooltipProvider } from './components/ui/tooltip'

import { router } from './router'

import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <RouterProvider
        router={router}
      />
    </TooltipProvider>
  </StrictMode>,
)
