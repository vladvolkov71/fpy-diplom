import React from 'react';
import PropTypes from 'prop-types';
import './File.css';

function FileDescription({
  upload, download, size, comment,
}) {
  return (
    <div className="file-description">
      <div className="file-description--item">
        <div className="file-description--item--name">Дата загрузки</div>
        <div className="file-description--item--content">{ upload }</div>
      </div>
      <div className="file-description--item">
        <div className="file-description--item--name">Последняя загрузка</div>
        <div className="file-description--item--content">{ download }</div>
      </div>
      <div className="file-description--item">
        <div className="file-description--item--name">Размер</div>
        <div className="file-description--item--content">{ size }</div>
      </div>
      <div className="file-description--item">
        <div className="file-description--item--name">Комментарий</div>
        <div className="file-description--item--content">{ comment }</div>
      </div>
    </div>
  );
}

FileDescription.propTypes = {
  upload: PropTypes.string.isRequired,
  download: PropTypes.string,
  size: PropTypes.number.isRequired,
  comment: PropTypes.string.isRequired,
};

FileDescription.defaultProps = {
  download: '-',
};

export default FileDescription;
