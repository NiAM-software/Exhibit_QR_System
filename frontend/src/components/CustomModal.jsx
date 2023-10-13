import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import QRCode from 'react-qr-code';

const CustomModal = ({ show, handleClose, data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const downloadQR = () => {
    
  }
  const {exhibit_id} = data[0]
  const exhibitUrl = `/product-page/${exhibit_id}`

  return (
    <>
      {show && exhibit_id && (
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{`QR Code for exhibit ${exhibitUrl}`}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <QRCode
              size={256}
              style={{ height: '200px', maxWidth: '200px', width: '200px' }}
              value={exhibitUrl}
              viewBox={`0 0 256 256`}
            />
          </Modal.Body>
          <Modal.Footer>
            <button className="btn-primary-sm" onClick={downloadQR}>
              Download
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default CustomModal;

