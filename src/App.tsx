import { useEffect, useRef, useState } from 'react'
import './App.css'
import Header from './layouts/header'

function App() {
  const [loginModal, setLoginModal] = useState(false)
  const [registerModal, setRegisterModal] = useState(false)
  const [login, setLogin] = useState('');

  const handleLoginModal = () => {
    setLoginModal(!loginModal)
  }
  const handleRegisterModal = () => {
    setRegisterModal(!registerModal)
  }

  return (
    <>
      <Header />
      <LoginModal display={loginModal} handleOutsideClick={handleLoginModal} setLogin={setLogin}/>
      <RegisterModal display={registerModal} handleOutsideClick={handleRegisterModal} />

      <div className="card">
        {
          login ? <p>{login}</p> : null
        }
        {
          login ? null :
          <button className='login' onClick={() => {
            handleLoginModal()
          }}>Login</button>
        }
        {
          login ? null :
        <button className='register' onClick={() => {
          handleRegisterModal()
        }}>Register</button>
        }
      </div>
    </>
  )
}

function LoginModal({ display, handleOutsideClick, setLogin }: { display: boolean, handleOutsideClick: () => void, setLogin: (login: string) => void}) {
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const modalRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (modalRef.current && !(modalRef.current as any).contains(event.target as Node)) {
        handleOutsideClick();
        setPassword('');
        setUsername('');
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleOutsideClick]);
  if (!display) {
    return null
  }

  return (
    <div ref={modalRef} className='modal'>
      <p>Login</p>
      <input type='text' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => {
        console.log('login')
        setLogin('Here I am')
        handleOutsideClick()
      }}>Login</button>
    </div>
  )
}

function RegisterModal({ display, handleOutsideClick }: { display: boolean, handleOutsideClick: () => void }) {
  const modalRef = useRef(null);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (modalRef.current && !(modalRef.current as any).contains(event.target as Node)) {
        handleOutsideClick();
        setUsername('')
        setPassword('')
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleOutsideClick]);
  if (!display) {
    return null
  }

  return (
    <div ref={modalRef} className='modal'>
      <p>Register</p>
      <input type='text' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => {
        console.log('register')
      }}>Register</button>
    </div>
  )
}

export default App
