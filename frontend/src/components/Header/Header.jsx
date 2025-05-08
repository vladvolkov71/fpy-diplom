import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Username from './Username';
import Context from '../../GlobalState/state';
import './Header.css';
import UserStorage from './UserStorage';

function Header() {
  const { sessionId, username, currentStorageUser } = useContext(Context);

  return (
    <section className="header">
      <div
        className="header--logo"
      >
        <Link
          to="/"
        >
          Моё облако
        </Link>
      </div>
      { currentStorageUser
        ? <UserStorage storageUserId={currentStorageUser} />
        : null }
      <div className="header--menu-container">
        {!sessionId
          ? (
            <>
              <div
                className="header--menu-container--item"
              >
                <Link
                  to="/sign-in"
                >
                  Вход
                </Link>
              </div>
              <div
                className="header--menu-container--item"
              >
                <Link
                  to="/sign-up"
                >
                  Регистрация
                </Link>
              </div>
            </>
          )
          : <Username username={username} />}
      </div>

      <div className="header--menu-container">
        {sessionId
          ? (
            <>
              <div
                className="header--menu-container--item"
              >
                <Link
                  to="/admin"
                >
                  Admin
                </Link>
              </div>
              <div
                className="header--menu-container--item"
              >
                <Link
                  to="/my-storage"
                >
                  Файлы
                </Link>
              </div>
            </>
          )
          : null}
      </div>

    </section>
  );
}

export default Header;
