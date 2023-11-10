import {Container} from 'react-bootstrap'
import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import HomeScreen from './screens/HomeScreen'
import toast, { Toaster } from "react-hot-toast";
import styled from 'styled-components';
import {Outlet,useLocation} from 'react-router-dom'
// import necessary dependencies
import { QueryClient, QueryClientProvider } from 'react-query';

// create a new QueryClient
const queryClient = new QueryClient();
const excludeHeaderRoutes = ['/UserScreen'];

const App = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const shouldExcludeHeader = excludeHeaderRoutes.some(route => {
    return currentPath.startsWith(route);
  });

  if (shouldExcludeHeader) {
    return (
      <>
        <Toaster />
        <main className='py-1'>
          <QueryClientProvider client={queryClient}>
            <Outlet />
          </QueryClientProvider>
        </main>
      </>
    );
  } else{
  return (
   <>
       <Toaster/>
      <Header />
      <main className='py-1'>
      <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
      </main>
     
   </>
  )
}
};
// const CustomToast = styled(ToastContainer)`
//  height:60px; 
//   background-color: red;
//   color: white;
//   font-size: 16px;
//  
// `;
export default App
