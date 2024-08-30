import React, { useEffect, useState } from 'react';
import TopNavbar from '../topNavbar';
import Button from '../crudbuttons/buttons';
import Swal from "sweetalert2";
import axios from 'axios';
import { backend_url } from '../../utill/utill';
import addButton from '../../../public/assets/icons/Add Btn.svg';
import updateButton from '../../../public/assets/icons/Update Btn.svg';
import deleteButton from '../../../public/assets/icons/Delete Btn.svg';

interface UserData {
    user_id: number;
    name: string;
    role: string;
    contact_number: string;
    email: string;
    username: string;
    password: string;
}

const User: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [contact_number, setContactNumber] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');

    const [nameError, setNameError] = useState('');
    const [roleError, setRoleError] = useState('');
    const [contactNumberError, setContactNumberError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);


    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateContactNumber = (contact_number: string): boolean => {
        const contactNumberRegex = /^[0-9]{10}$/;
        return contactNumberRegex.test(contact_number);
    };

    const validateForm = (): boolean => {
        let isValid = true;

        if (!name) {
            setNameError('Please enter a name');
            isValid = false;
        } else {
            setNameError('');
        }

        if (!role) {
            setRoleError('Please select a role');
            isValid = false;
        } else {
            setRoleError('');
        }

        if (!contact_number) {
            setContactNumberError('Please enter a contact number');
            isValid = false;
        } else if (!validateContactNumber(contact_number)) {
            setContactNumberError('Please enter a valid contact number (10 digits)');
            isValid = false;
        } else {
            setContactNumberError('');
        }

        if (!email) {
            setEmailError('Please enter an email');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!username) {
            setUsernameError('Please enter a username');
            isValid = false;
        } else {
            setUsernameError('');
        }

        if (!password) {
            setPasswordError('Please enter a password');
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    };

    const fetchItems = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setToken(token);
            try {
                const response = await axios.get(`${backend_url}/api/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.data && Array.isArray(response.data.data)) {
                    setUsers(response.data.data);
                } else {
                    console.error('Invalid data format received from server:', response.data);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        } else {
            console.log('No token found');
        }
    };

    const handleAddUser = async () => {
        if (!validateForm()) {
            return;
        }

        const newUser = {
            name,
            role,
            contact_number,
            email,
            username,
            password,
        };

        try {
            const response = await axios.post(`${backend_url}/auth/register`, newUser, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.data.data != null) {
                Swal.fire({
                    title: 'Success!',
                    text: 'User added successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                setName('');
                setRole('');
                setContactNumber('');
                setEmail('');
                setUsername('');
                setPassword('');
                fetchItems();
            }
        } catch (error) {
            console.error('Error adding user:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to add user',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleItemDeleteOnClick = async (userId: number) => {
        try {
            await axios.delete(`${backend_url}/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const updatedUsers = users.filter(user => user.user_id !== userId);
            setUsers(updatedUsers);
            setSelectedUser(null);

            Swal.fire({
                title: 'Success!',
                text: 'User deleted successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setName('');
            setRole('');
            setContactNumber('');
            setEmail('');
            setUsername('');
            setPassword('');
            fetchItems();

        } catch (error) {
            console.error('Error deleting user:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete user',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleItemUpdateOnClick = async () => {
        if (!validateForm()) {
            return;
        }

        const updatedUser = {
            name,
            role,
            contact_number,
            email,
            username,
            password,
        };

        try {
            const response = await axios.put(`${backend_url}/api/users/${selectedUser?.user_id}`, updatedUser, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log(response);

            Swal.fire({
                title: 'Success!',
                text: 'User updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setName('');
            setRole('');
            setContactNumber('');
            setEmail('');
            setUsername('');
            setPassword('');
            fetchItems();

        } catch (error) {
            console.error('Error updating user:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update user',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleTableRowClick = (user: UserData) => {
        setSelectedUser(user);
        setName(user.name);
        setRole(user.role);
        setContactNumber(user.contact_number);
        setEmail(user.email);
        setUsername(user.username);
        setPassword(user.password);
    };

    return (
        <div className='m-4 w-full'>
            <div className="m-4">
                <TopNavbar />
            </div>
    
            <div className='m-4 text-white font-semibold'>
                <div className='mt-5 flex justify-between'>
                    <div className='flex flex-col'>
                        <input
                            className='text-feild'
                            value={name}
                            onChange={(event) => {
                                setName(event.target.value);
                                setNameError(''); // Clear the name error when typing
                            }}
                            placeholder='   Name'
                        />
                        {nameError && <span className='text-red-500 text-xs ml-[0.5vw]'>{nameError}</span>}
                    </div>
                    <div className='flex flex-col'>
                        <select
                            className='text-feild'
                            value={role}
                            onChange={(event) => {
                                setRole(event.target.value);
                                setRoleError(''); // Clear the role error when typing
                            }}
                        >
                            <option value="">Role</option>
                            <option value="user">User</option>
                        </select>
                        {roleError && <span className='text-red-500 text-xs ml-[0.5vw]'>{roleError}</span>}
                    </div>
                    <div className='flex flex-col'>
                        <input
                            className='text-feild'
                            value={contact_number}
                            onChange={(event) => {
                                setContactNumber(event.target.value);
                                setContactNumberError(''); // Clear the contact number error when typing
                            }}
                            placeholder='   Contact Number'
                        />
                        {contactNumberError && <span className='text-red-500 text-xs ml-[0.5vw]'>{contactNumberError}</span>}
                    </div>
                </div>
    
                <div className='mt-4 flex justify-between'>
                    <div className='flex flex-col'>
                        <input
                            className='text-feild'
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setEmailError(''); // Clear the email error when typing
                            }}
                            placeholder='   Email'
                        />
                        {emailError && <span className='text-red-500 text-xs ml-[0.5vw]'>{emailError}</span>}
                    </div>
                    <div className='flex flex-col'>
                        <input
                            className='text-feild'
                            value={username}
                            onChange={(event) => {
                                setUsername(event.target.value);
                                setUsernameError(''); // Clear the username error when typing
                            }}
                            placeholder='   Username'
                        />
                        {usernameError && <span className='text-red-500 text-xs ml-[0.5vw]'>{usernameError}</span>}
                    </div>
                    <div className='flex flex-col'>
                        <input
                            className='text-feild'
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                setPasswordError(''); // Clear the password error when typing
                            }}
                            placeholder='   Password'
                        />
                        {passwordError && <span className='text-red-500 text-xs ml-[0.5vw]'>{passwordError}</span>}
                    </div>
                </div>
            </div>
    
            <div className='m-4 flex mt-5 justify-end'>
                <Button
                    onClick={() => handleAddUser()}
                    className='mr-[6vw] buttons-styles bg-green-button w-[7vw] h-[5vh] text-center rounded-xl flex justify-center items-center'
                    iconSrc={addButton}
                    iconAlt='add icon'
                >
                    ADD
                </Button>
                <Button
                    onClick={() => handleItemDeleteOnClick(selectedUser?.user_id || 0)}
                    className='mr-[6vw] buttons-styles bg-red-button w-[8vw] h-[5vh] text-center rounded-xl flex justify-center items-center'
                    iconSrc={deleteButton}
                    iconAlt='delete icon'
                >
                    DELETE
                </Button>
                <Button
                    onClick={() => handleItemUpdateOnClick()}
                    className='buttons-styles bg-blue-button w-[8vw] h-[5vh] text-center rounded-xl flex justify-center items-center'
                    iconSrc={updateButton}
                    iconAlt='update icon'
                >
                    UPDATE
                </Button>
            </div>
    
            {/* Table to display users */}
            <div className='mt-5 m-4'>
                <table className='min-w-full divide-y table-styles'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Id</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Contact Number</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Email</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Username</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Password</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Role</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                        {users.map((user) => (
                            <tr key={user.user_id} onClick={() => handleTableRowClick(user)} className='text-white font-semibold hover:bg-gray-50 cursor-pointer'>
                                <td className='px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-500'>{user.user_id}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>{user.name}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>{user.contact_number}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>{user.email}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>{user.username}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>{user.password}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>{user.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}    

export default User;
