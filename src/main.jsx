import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { MainContextProvider } from './context/main'
import {
  RouterProvider,
  createHashRouter,
  createBrowserRouter
} from "react-router-dom";
import Detail from './components/detail'
import Watch from './components/watch'
import Menu from './components/layout/menu'
import Welcome from "./components/welcome";
import Settings from './components/settings';
import Task from './components/task';
import Check from './components/check'
import Public from './components/public';
import './utils/i18n';
import { appWindow } from '@tauri-apps/api/window'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Menu />,
    children: [
      {
        path: "/",
        element: <Check />,
      },
      {
        path: "/detail",
        element: <Detail />,
      },
      {
        path: "/public",
        element: <Public />,
      },
      {
        path: "/check",
        element: <Check />,
      },
      {
        path: "/watch",
        element: <Watch />,
      },
      {
        path: "/task",
        element: <Task />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
    ],
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainContextProvider>
      <RouterProvider router={router} />
    </MainContextProvider>
  </React.StrictMode>
)

document
  .getElementById('titlebar-minimize')
  .addEventListener('click', () => appWindow.minimize())
document
  .getElementById('titlebar-maximize')
  .addEventListener('click', () => appWindow.toggleMaximize())
document
  .getElementById('titlebar-close')
  .addEventListener('click', () => appWindow.close())