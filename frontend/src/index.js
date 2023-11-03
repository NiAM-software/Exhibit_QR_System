import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  createBrowserRouter, 
  createRoutesFromElements,
  Route,
  Router, 
  RouterProvider
} from 'react-router-dom'

import {Provider} from 'react-redux'
import store from './store.js'
import App from './App';
import reportWebVitals from './reportWebVitals';
import PrivateRoute from './components/PrivateRoutes.jsx';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen.jsx';
import RegisterScreen from './screens/RegisterScreen.jsx';
import AdminRoute from './components/AdminRoute.jsx'

import ForgotPasswordScreen from './screens/ForgotPasswordScreen'
import AddExhibitScreen  from './screens/AddExhibitsScreen.jsx';
import EditExhibitScreen from './screens/EditExhibitsScreen.jsx';
import ProductScreen from './screens/productScreen.jsx';
import RecycleBin from './screens/recylcebinScreen.jsx';
import Maintenancescreen from './screens/Maintenancescreen.jsx';

import './assets/styles/bootstrap.custom.css';
import './assets/styles/index.css'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App/>}>
      <Route index={true} path="/" element={<HomeScreen/>}/>
      <Route path="/login" element={<LoginScreen/>}/>
      <Route path="/register" element={<RegisterScreen/>}/>
      <Route path="/forgotpassword" element={<ForgotPasswordScreen/>}/>
      <Route path="/AddExhibitScreen" element={<AddExhibitScreen/>}></Route>
      <Route path="/EditExhibitScreen/:id" element={<EditExhibitScreen/>}></Route>
      <Route path="/ProductScreen/:id" element={<ProductScreen/>}></Route>
      <Route path="/RecycleBin" element={<RecycleBin/>}></Route>
      <Route path="/Maintenancescreen" element={<Maintenancescreen/>}></Route>
    </Route>
  )
)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   <Provider store={store}>
    <RouterProvider router={router}/>
   </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();