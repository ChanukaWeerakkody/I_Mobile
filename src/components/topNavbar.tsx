import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function TopNavbar(): JSX.Element {
  const [token, setToken] = useState<string>('');
  const [name, setName] = useState<string>('');
  const navigate = useNavigate();
  console.log(token);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedName = localStorage.getItem('username');
    if (storedToken && storedName) {
      setToken(storedToken);
      setName(storedName);
    }
  }, []);

  const logoutFunction = (): void => {
    Swal.fire({
      title: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        navigate('/');
        Swal.fire(
            'Logged Out!',
            'You have been successfully logged out.',
            'success'
        );
      }
    });
  };

  const getFormattedDate = (): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(today);
    const dateParts = formattedDate.split(' ');
    return `${dateParts[0]}, ${dateParts.slice(1).join(' ')}`;
  };

  return (
      <div className='flex justify-between '>
        <div className='flex-grow sm:mr-[10vw] mb-4 sm:mb-0'>
          <span className='text-2xl text-white block sm:inline'>Hi, {name} Welcome Back!</span>
          <p className='text-white opacity-40 text-lg'>{getFormattedDate()}</p>
        </div>
        <div className='flex items-center sm:items-start'>
          <input
              placeholder='  search reports'
              className='w-full sm:w-[300px] p-1 text-xl rounded-xl mb-4 sm:mb-0 sm:mr-2 input-bg-gradient-custom'
          />
          <button
              onClick={logoutFunction}
              className='input-bg-gradient-custom p-2 bg-blue-500 rounded-full text-white'
          >
            <img src={'src/assets/icons/Logout.svg'} className='w-fit h-[3vh]' alt="Logout Icon"/>
          </button>
        </div>
      </div>
  );
}
