import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Swal from 'sweetalert2';

// Authentication check function
const isAuthenticated = () => {
    return localStorage.getItem('authToken') !== null;
};

function NavigationMenu() {
    const [selectedItem, setSelectedItem] = useState<string>("");
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        navigate('/');
    };

    const handleNavigation = (location: string) => {
        if (isAuthenticated()) {
            navigate(location);
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Access Denied',
                text: 'Please log in to access this page.',
                confirmButtonText: 'Login',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/');
                }
            });
        }
    };

    return (
        <nav className="fixed top-8 left-0 pt-3 flex flex-col min-w-[270px] w-[270px] h-[95%] bg-[#1D1D27] rounded-r-[40px] items-center overflow-hidden">
            <div className='mt-2 self-start pl-8'>
                <img width="120px" src="../../../../public/assets/images/logo.png" alt="company logo" />
            </div>
            <div className="w-full h-full flex flex-col">
                <div className="w-full flex-1">
                    <ul className='mt-10 w-full pl-8 flex flex-col gap-10 mb-2'>
                        <NavItems
                            logo='src/assets/images/navbar/layer1.svg'
                            name='Reports'
                            location='/dashboard'
                            selected={selectedItem}
                            setSelected={setSelectedItem}
                            onClick={() => handleNavigation('/dashboard')}
                        />
                        <NavItems
                            logo='src/assets/images/navbar/Stock Phones.svg'
                            name='Stock Phones'
                            location='/StockPhones'
                            selected={selectedItem}
                            setSelected={setSelectedItem}
                            onClick={() => handleNavigation('/StockPhones')}
                        />
                        <NavItems
                            logo='src/assets/images/navbar/Return Phones.svg'
                            name='Return Phones'
                            location='/returnPhone'
                            selected={selectedItem}
                            setSelected={setSelectedItem}
                            onClick={() => handleNavigation('/returnPhone')}
                        />
                        <NavItems
                            logo='src/assets/images/navbar/Items.svg'
                            name='Items'
                            location='/item'
                            selected={selectedItem}
                            setSelected={setSelectedItem}
                            onClick={() => handleNavigation('/item')}
                        />
                        <NavItems
                            logo='src/assets/images/navbar/Return item.svg'
                            name='Return Items'
                            location='/returnItem'
                            selected={selectedItem}
                            setSelected={setSelectedItem}
                            onClick={() => handleNavigation('/returnItem')}
                        />
                        <NavItems
                            logo='src/assets/images/navbar/Users.svg'
                            name='Users'
                            location='/user'
                            selected={selectedItem}
                            setSelected={setSelectedItem}
                            onClick={() => handleNavigation('/user')}
                        />
                        <NavItems
                            logo='src/assets/images/navbar/Shops.svg'
                            name='Shops'
                            location='/shop'
                            selected={selectedItem}
                            setSelected={setSelectedItem}
                            onClick={() => handleNavigation('/shop')}
                        />
                    </ul>
                </div>

                <div className='w-full px-8 mb-5'>
                    <NavLink
                        to="/order"
                        className="mt-5 flex text-[25px] w-full justify-center rounded-md bg-[#5356EC] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 items-center gap-3"
                    >
                        <img src="../../../../public/assets/images/navbar/cart-svgrepo-com 1.svg" alt="cart" />
                        Place Order
                    </NavLink>
                </div>

                <div className='w-full px-8 mb-5'>
                    <button
                        onClick={handleLogout}
                        className="mt-5 flex text-[25px] w-full justify-center rounded-md bg-[#FF4D4D] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 items-center gap-3"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default NavigationMenu;

interface INavItems {
    name: string;
    location: string;
    selected: string;
    setSelected: (name: string) => void;
    logo?: string;
    onClick: () => void;
}

function NavItems({ name, selected, setSelected, location, logo, onClick }: INavItems) {
    const isSelected = selected === name;

    return (
        <li
            className={clsx("flex items-center gap-4 cursor-pointer", {
                "text-[#5356EC]": isSelected,  // Apply blue color to text and icon when selected
                "text-[#959595]": !isSelected  // Apply grey color when not selected
            })}
            onClick={() => {
                setSelected(name);
                onClick();
            }}
        >
            <NavLink to={location} className="flex items-center gap-4">
                <img
                    width="30px"
                    src={logo}
                    alt={name}
                    className={clsx({
                        "text-[#5356EC]": isSelected,  // Apply blue color when selected
                        "text-[#959595]": !isSelected  // Apply grey color when not selected
                    })}
                />
                <p className={clsx('text-[19px] font-medium', {
                    'text-[#5356EC]': isSelected,  // Apply blue color when selected
                    'text-[#959595]': !isSelected  // Apply grey color when not selected
                })}>{name}</p>
            </NavLink>
        </li>
    );
}