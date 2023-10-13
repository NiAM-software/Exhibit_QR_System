import React, { useEffect } from 'react';
import {Navbar,  Nav, Container, Badge, NavDropdown, InputGroup, Modal} from 'react-bootstrap'

const Notification = ({ message, onClose }) => {
   //
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, 3000); 
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <Modal>
      {message}
    </Modal>
  );
};

export default Notification;
