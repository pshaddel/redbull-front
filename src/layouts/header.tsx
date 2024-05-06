import redbull from '/red.png'

function Header() {
  return (
    <>
      <div className='header'>
        <a href="https://www.redbull.com/at-de/" target="_blank">
          <img src={redbull} className="logo" alt="Redbull logo" />
        </a>
      {/* <h2>RedBull Case Study</h2> */}
      </div>
    </>
  )
}

export default Header
