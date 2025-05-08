import React from 'react';
import PropTypes from 'prop-types';
import './AdminPanel.css';

function IsStaffBtn({ isStaff, onClickHandler, setIsStaff }) {
  const isStaffHandler = () => {
    setIsStaff(!isStaff);
    onClickHandler('PATCH');
  };

  return (
  // eslint-disable-next-line jsx-a11y/control-has-associated-label
    <div className={`is-staff-btn-container ${isStaff ? 'on' : 'off'}`} role="button" onClick={isStaffHandler} onKeyDown={isStaffHandler} tabIndex={0}>
      <div className="is-staff-btn" />
    </div>
  );
}

IsStaffBtn.propTypes = {
  isStaff: PropTypes.bool.isRequired,
  onClickHandler: PropTypes.func.isRequired,
  setIsStaff: PropTypes.func.isRequired,
};

export default IsStaffBtn;
