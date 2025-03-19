import {Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom';
import './App.css'

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ExpensesPage from './pages/ExpensesPage';
import IncomePage from './pages/IncomePage';
import AllowancePage from './pages/AllowancePage';
import LearningPage from './pages/LearningPage';
import ToolsPage from './pages/ToolsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';




const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path='/expenses' element={<ExpensesPage />} />
      <Route path='/income' element={<IncomePage />} />
      <Route path='/allowance' element={<AllowancePage />} />
      <Route path='/learning' element={<LearningPage />} /> 
      <Route path='/tools' element={<ToolsPage />} /> 
      <Route path='/settings' element={<SettingsPage />} /> 
      <Route path='*' element={<NotFoundPage />} />
    </Route>
  )
);

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
