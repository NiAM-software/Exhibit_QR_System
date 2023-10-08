import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
const SearchBar = () => {
  const navigate = useNavigate();
  const { keyword: urlKeyword } = useParams();

  // FIX: uncontrolled input - urlKeyword may be undefined
  const [keyword, setKeyword] = useState(urlKeyword || '');
  
  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword) {
      
      setKeyword('');
    } else {
      navigate('/');
    }
  };

  return (
    <Form onSubmit={submitHandler} className='d-flex' style={{'font-size':'12px'}}>
      <Form.Control
        type='text'
        name='q'
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        placeholder='Search Products...'
        className='mr-sm-2 ml-sm-5'
        style={{width:'250px', height:'30px'}}
      ></Form.Control>
      <StyledButton type='submit' variant='outline-success' className='p-2 mx-2'>
      <FontAwesomeIcon icon={faSearch} style={{margin:0}}/>

      </StyledButton>
    </Form>
  );
};

const StyledButton = styled(Button)`
width: 40px;
  height: 30px;
  border: 1px solid #EAEAEA;
  background: #BBB;
  text-align: center;
  color: #fff;
  margin:0;
  cursor: pointer;
  font-size: 20px;
  display:flex;
  align-items:center;
`;


export default SearchBar;
