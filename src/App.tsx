import { useEffect, useRef, useState } from 'react'
import './App.css'
import Header from './layouts/header'
import {
  useQuery,
} from '@tanstack/react-query'

const api = 'http://127.0.0.1:5173/api/v1'
const apis = {
  me: `${api}/users/me` as const,
  login: `${api}/users/login` as const,
  register: `${api}/users/register` as const,
  logout: `${api}/users/logout` as const,
  searchImage: `${api}/contents/image` as const,
  searchVideo: `${api}/contents/video` as const,
} as const
function App() {
  const [loginModal, setLoginModal] = useState(false)
  const [registerModal, setRegisterModal] = useState(false)
  const [login, setLogin] = useState('');
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState<'image' | 'video'>('image')
  const [page, setPage] = useState(1)
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
    console.log('not logged in')
  }
  // console.log('data', data?.user?.username)
  const isLogin = !isPending && data.user

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
          login ? <p> Welcome {login}</p> : null
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
      {
        !isLogin ? null : <>
      <select onChange={(e) => setSearchType(e.target.value as 'image' | 'video')}>
        <option value='image'>Image</option>
        <option value='video'>Video</option>
      </select>
      <SearchBox setSearch={setSearch} />
      <button disabled={page <= 1 } onClick={() => setPage(page - 1)}>Previous</button>
      <button  onClick={() => setPage(page + 1)}>Next</button>
      <Contents searchPhrase={search} page={page} searchType={searchType} />
        </>
      }
    </>
  )
}

function SearchBox({
  setSearch,
}: {
  setSearch: (search: string) => void
}) {
  const [text, setText] = useState('')
  // only on enter run the function
  return (
    <input
      className='search-box'
      type='text'
      placeholder='Search'
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          setSearch(text)
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

function Contents({ searchPhrase, page = 1, searchType }: { searchPhrase: string, page: number, searchType: 'image' | 'video' }) {
  const { data, error, isPending } = useQuery({
    queryKey: ['search', searchPhrase, 'page', page, 'type', searchType],
    queryFn: async () => {
      const response = await fetch(`${searchType === 'image' ? apis.searchImage : apis.searchVideo }?query=${searchPhrase}&page=${page}`);
      return response.json()
    }
  })


  if (!searchPhrase) {
    return <p>Search for something</p>
  }

  if (isPending) {
    return <p>Loading...</p>
  }
  if (error) {
    return <p>Error getting data</p>
  }

  if (data?.length === 0) {
    return <p>No results</p>
  }


  const {
    contents,
    total,
  } = data as { contents: {
    id: string,
  src: string,
  width: number,
  height: number,
  thumbnail: string,
  thumbnailWidth: number,
  thumbnailHeight: number,
  type: string,
  }[], total: number }
  return <div className='contents'>
    <p>Results for {searchPhrase}</p>
    <p>Total: {total}  - Page {page}</p>
    <div className='content-list'>
      {
        contents?.map((content, index) => {
          return <div key={index} className='content' onClick={() => {
            const link = content.src; // image or png
            window.open(link, '_blank');
          }}>
            <img style={{width: '120px', height: 'auto'}} src={content.thumbnail} alt={content.id} width={content.thumbnailWidth} height={content.thumbnailHeight}/>
          </div>
        })
      }
      </div>
  </div>
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
