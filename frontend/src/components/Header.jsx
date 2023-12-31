import React from "react";
import { Navbar, Nav, Container, Badge, NavDropdown } from "react-bootstrap";
import logo from "../assets/logo.png";

// import user from '../assets/us.jpg'
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);

  console.log(userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      console.log("logou");
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="__header">
      <Navbar expand="sm" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img src={logo} alt="Museum" />
            </Navbar.Brand>
          </LinkContainer>
          {userInfo && (
            <div className="primary-nav-menu">
              <Nav.Link as={NavLink} to="/" end activeClassName="active">
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/maintenance" activeClassName="active">
                Maintenance
              </Nav.Link>
              <Nav.Link as={NavLink} to="/recycle-bin" activeClassName="active">
                Recycle bin
              </Nav.Link>
            </div>
          )}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {userInfo ? (
                <>
                  <NavDropdown title={userInfo.name} id="username">
                    <NavDropdown.Item onClick={logoutHandler}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <></>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
