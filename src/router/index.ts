import { createBrowserRouter } from 'react-router'

import App from '../App'
import SearchVisualizer from '../pages/SearchVisualizer'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: App
    },
    {
      path: '/visualize/search',
      Component: SearchVisualizer
    }
  ]
)