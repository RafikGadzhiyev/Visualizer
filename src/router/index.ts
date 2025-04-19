import { createBrowserRouter } from 'react-router'

import App from '../App'
import SearchVisualizer from '../pages/SearchVisualizer'
import PathFindingPage from '@/pages/PathFinding'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: App
    },
    {
      path: '/visualize/search',
      Component: SearchVisualizer
    },
    {
      path: '/visualize/path-finding',
      Component: PathFindingPage
    }
  ]
)