import { useEffect, useRef, useState } from 'react'
import './App.css'
import Header from './layouts/header'
import {
  useQuery,
} from '@tanstack/react-query'

const api = 'http://127.0.0.1:5173/api/v1'
const apis = {
  me: `${api}/users/me`,
  login: `${api}/users/login`,
  register: `${api}/users/register`,
  logout: `${api}/users/logout`
}
function App() {
  const [loginModal, setLoginModal] = useState(false)
  const [registerModal, setRegisterModal] = useState(false)
  const [login, setLogin] = useState('');
  const [search, setSearch] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isPending, error, data } = useQuery({
    queryKey: ['me'],

    queryFn: async () => {
      const response = await fetch(apis.me, {
        method: 'GET',
        credentials: 'include'
      })
      return response.json()
    }
  })
  if (error) {
    console.log('error', error)
  }
  console.log('data', data.user.username)
  const isLogin = !isPending && data.user
  // if (!isPending && data.error) {
  //   setLogin(''); // we are not logged in!
  // } else if (!isPending && data.username) {
  //   setLogin(data.username); // we are logged in!
  // }
  const onSearch = (search: string) => {
    console.log('search', search)
  }

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
      <p>Logged in as {isLogin ? data?.user?.username : ''}</p>
      <div className="card">
        {
          login ? <p>{login}</p> : null
        }
        {
          isLogin ? null :
          <button className='login' onClick={() => {
            handleLoginModal()
          }}>Login</button>
        }
        {
          isLogin ? null :
        <button className='register' onClick={() => {
          handleRegisterModal()
        }}>Register</button>
        }
        {
          isLogin ? <button className='login' onClick={async () => {
            const success = await logout()
            if (success) {
              setLogin('')
            }
          }}>Logout</button> : null
        }
      </div>
      <SearchBox search={search} setSearch={setSearch} onSearch={onSearch} />
    </>
  )
}

function SearchBox({
  search,
  setSearch,
  onSearch
}: {
  search: string,
  setSearch: (search: string) => void
  onSearch: (search: string) => void
}) {
  // only on enter run the function
  return (
    <input
      className='search-box'
      type='text'
      placeholder='Search'
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSearch(search)
        }
      }}
    />
  )
}


function LoginModal({ display, handleOutsideClick, setLogin }: { display: boolean, handleOutsideClick: () => void, setLogin: (login: string) => void}) {
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('')
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
      <button onClick={async () => {
        console.log('login')
        const { success, message } = await fetchLogin(username, password)
        if (!success) {
          setError(message)
          return;
        }
        setLogin(username)
        handleOutsideClick()
      }}>Login</button>
      {
        error ? <p>{error}</p> : null
      }
    </div>
  )
}

function RegisterModal({ display, handleOutsideClick }: { display: boolean, handleOutsideClick: () => void }) {
  const modalRef = useRef(null);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('')
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
      <button onClick={async () => {
        console.log('register')
        const { success, message } = await fetchRegister(username, password)
        if (!success) {
          setError(message)
          return;
        }
        handleOutsideClick()
      }}>Register</button>
      {
        error ? <p>{error}</p> : null
      }
    </div>
  )
}

async function fetchLogin(username: string, password: string): Promise<{ success: boolean, message: string }> {
  try {
    const response = await fetch(apis.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        username,
        password
      })
    })
    const status = response.status
    const data = await response.json()
    const error = data?.error
    return { success: status === 200, message: error }
  } catch (error) {
    return { success: false, message: 'error' }
  }
}

async function fetchRegister(username: string, password: string): Promise<{ success: boolean, message: string }> {
  try {
    const response = await fetch(apis.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    })
    const status = response.status
    const data = await response.json()
    const error = data?.error
    return { success: status === 200, message: error }
  } catch (error) {
    return { success: false, message: 'error' }
  }
}

async function logout() {
  try {
    const response = await fetch(apis.logout, {
      method: 'POST',
      credentials: 'include'
    })
    const status = response.status
    return status === 200
  } catch (error) {
    return false
  }
}

export default App
