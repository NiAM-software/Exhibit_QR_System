import React from 'react'
import {Navbar, Nav, Container, Badge, NavDropdown} from 'react-bootstrap'
import {FaShoppingCart, FaUser} from 'react-icons/fa'
import logo from '../assets/logo.png'

// import user from '../assets/us.jpg'
import {LinkContainer} from 'react-router-bootstrap'
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';



const Header = () => {
  const {userInfo} = useSelector((state) => state.auth)

  console.log(userInfo)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();



  const logoutHadler = async()=>{
    try{
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch(err){
      console.error(err);
    }
  }


  return (
    <header style={{maxHeight:'100px'}}>
       <Navbar expand='md' collapseOnSelect>
            <Container>
                <LinkContainer to='/'>
                  <Navbar.Brand> 
                    <img src={logo} alt='logo' width="120" height="50"/>
                  </Navbar.Brand>
                </LinkContainer>
                

                <LinkContainer to='/'>
                  <Navbar.Brand> 
                    <body>Home</body>
                  </Navbar.Brand>
                </LinkContainer>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  { 
                    userInfo && 
                    <NavDropdown title={userInfo.name} id='username'>
                              <NavDropdown.Item onClick={logoutHadler}> Log out</NavDropdown.Item>
                        </NavDropdown>
                  }
               
                </Navbar.Collapse>
            </Container>
        </Navbar> i
    </header>
  )
}

export default Header
