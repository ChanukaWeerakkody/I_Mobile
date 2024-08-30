import { useEffect, useState } from 'react';
import TopNavbar from "../topNavbar.tsx";
import Button from "../crudbuttons/buttons.tsx";
import axios from "axios";
import { backend_url } from "../../utill/utill.ts";
import Swal from "sweetalert2";
import Combobox from '../combobox/combobox.tsx';
import addButton from '../../../public/assets/icons/Add Btn.svg';
import updateButton from '../../../public/assets/icons/Update Btn.svg';
import deleteButton from '../../../public/assets/icons/Delete Btn.svg';

const brandOptions = [
    { value: 'Samsung', label: 'Samsung' },
    { value: 'Apple', label: 'Apple' },
    { value: 'OMS', label: 'OMS' },
];

interface ReturnPhones {
    return_phone_id: number;
    brand: string;
    category: string;
    contact_number: string;
    name: string;
    reason: string;
}

export default function ReturnItem() {
    const [returnPhones, setReturnPhones] = useState<ReturnPhones[]>([]);
    const [selectedReturnPhone, setSelectedReturnPhone] = useState<ReturnPhones | null>(null);
    const [category, setCategory] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [brand, setBrand] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [contact_number, setContact_number] = useState<string>('');
    const [token, setToken] = useState<string>('');

    const [errors, setErrors] = useState({
        category: '',
        name: '',
        brand: '',
        reason: '',
        contact_number: ''
    });

    useEffect(() => {
        fetchReturnItem();
    }, []);

    const validateFields = () => {
        const newErrors = {
            category: typeof category === 'string' && category.trim() === '' ? 'Category is required' : '',
            name: typeof name === 'string' && name.trim() === '' ? 'Name is required' : '',
            brand: typeof brand === 'string' && brand.trim() === '' ? 'Brand is required' : '',
            reason: typeof reason === 'string' && reason.trim() === '' ? 'Reason is required' : '',
            contact_number: typeof contact_number === 'string' && (contact_number.trim() === '' || contact_number.length !== 10)
                ? 'Contact number must be 10 digits' 
                : '',
        };
    
        setErrors(newErrors);
    
        return Object.values(newErrors).every(error => error === '');
    };
    

    const fetchReturnItem = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setToken(token);
            try {
                const response = await axios.get(`${backend_url}/api/returnItem`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.data && Array.isArray(response.data.data)) {
                    setReturnPhones(response.data.data);
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

    const handleAddReturnItem = async () => {
        if (!validateFields()) return;

        const newReturnPhone = {
            category,
            name,
            brand,
            reason,
            contact_number
        };

        try {
            const response = await axios.post(`${backend_url}/api/returnItem`, newReturnPhone, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.data.status === 200) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Item added successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                setName('');
                setCategory('');
                setBrand('');
                setReason('');
                setContact_number('');

                setReturnPhones(prevState => [...prevState, response.data.data]);

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

    const handleTableRowClick = (user: ReturnPhones) => {
        setSelectedReturnPhone(user);
        setBrand(user.brand);
        setCategory(user.category);
        setContact_number(user.contact_number);
        setName(user.name);
        setReason(user.reason);
        setErrors({
            category: '',
            name: '',
            brand: '',
            reason: '',
            contact_number: ''
        });
    };

    const handleItemUpdateOnClick = async () => {
        if (!selectedReturnPhone) {
            Swal.fire({
                title: 'Error!',
                text: 'No item selected for update',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!validateFields()) return;

        const updatedPhoneData: ReturnPhones = {
            ...selectedReturnPhone,
            brand,
            category,
            contact_number,
            name,
            reason
        };

        try {
            const response = await axios.put(`${backend_url}/api/returnItem/${selectedReturnPhone.return_phone_id}`, updatedPhoneData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Phone data updated successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                // Update the local state with the updated item
                setReturnPhones(prevItems =>
                    prevItems.map(item => item.return_phone_id === selectedReturnPhone.return_phone_id ? updatedPhoneData : item)
                );

                setSelectedReturnPhone(null);
                setCategory('');
                setName('');
                setBrand('');
                setReason('');
                setContact_number('');
            }

        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update return phone data',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleItemDeleteOnClick=()=>{

    }

    // Modified onChange handlers to update error state dynamically
    const handleCategoryChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setCategory(ev.target.value);
        if (ev.target.value.trim() !== '') {
            setErrors(prev => ({ ...prev, category: '' }));
        }
    };

    const handleNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setName(ev.target.value);
        if (ev.target.value.trim() !== '') {
            setErrors(prev => ({ ...prev, name: '' }));
        }
    };
    const handleReasonChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setReason(ev.target.value);
        if (ev.target.value.trim() !== '') {
            setErrors(prev => ({ ...prev, reason: '' }));
        }
    };

    const handleContactNumberChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setContact_number(ev.target.value);
        if (ev.target.value.trim() !== '' && ev.target.value.length === 10) {
            setErrors(prev => ({ ...prev, contact_number: '' }));
        }
    };

    const handleBrandChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        setBrand(ev.target.value);
        if (ev.target.value !== '') {
            setErrors(prev => ({ ...prev, brand: '' }));
        }
    };

    
    return (
        <div className='m-4 w-full'>
            <div className="m-4">
                <TopNavbar />
            </div>

            {/* inputs */}
            <div className='m-4 text-white font-semibold'>
                <div className='mt-5 flex flex-col sm:flex-row justify-between '>
                    <div className='flex flex-col'>
                        <input
                            className={`text-feild mb-1 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1 ${errors.category ? 'border-red-500' : ''}`}
                            value={category}
                            onChange={handleCategoryChange}
                            placeholder='   Category'
                        />
                        {errors.category && <span className='text-red-500 ml-[1vw] text-xs'>{errors.category}</span>}
                    </div>
                    <div className='flex flex-col'>
                        <input
                            className={`text-feild mb-1 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1 ${errors.name ? 'border-red-500' : ''}`}
                            value={name}
                            onChange={handleNameChange}
                            placeholder='   Name'
                        />
                        {errors.name && <span className='text-red-500 ml-[1vw] text-xs'>{errors.name}</span>}
                    </div>
                    <div className='flex flex-col'>
                    <Combobox
                            value={brand}
                            onChange={handleBrandChange}
                            options={brandOptions}
                            placeholder='  Brand'
                            
                        />
                        {errors.brand && <span className='text-red-500 ml-[1vw] text-xs'>{errors.brand}</span>}
                    </div>
                </div>

                <div className='mt-5 flex flex-col sm:flex-row justify-between'>
                    <div className='flex flex-col'>
                        <input
                            className={`text-feild mb-1 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1 ${errors.reason ? 'border-red-500' : ''}`}
                            value={reason}
                            onChange={handleReasonChange}
                            placeholder='   Reason'
                        />
                        {errors.reason && <span className='text-red-500 ml-[1vw] text-xs'>{errors.reason}</span>}
                    </div>
                    <div className='flex flex-col'>
                        <input
                            className={`text-feild mb-1 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1 ${errors.contact_number ? 'border-red-500' : ''}`}
                            value={contact_number}
                            onChange={handleContactNumberChange}
                            placeholder='   Contact Number'
                        />
                        {errors.contact_number && <span className='text-red-500 ml-[1vw] text-xs'>{errors.contact_number}</span>}
                    </div>
                </div>
            </div>


            {/* buttons */}
            <div className='m-4 flex mt-5 gap-x-[3vw] justify-end'>
                <Button
                    onClick={handleAddReturnItem}
                    className='buttons-styles bg-green-button w-full sm:w-[20%] md:w-[15%] lg:w-[15%] xl:w-[10vw] h-[5vh] text-center rounded-xl flex justify-center items-center'
                    iconSrc={addButton}
                    iconAlt='add icon'
                >
                    ADD
                </Button>
                <Button
                    onClick={handleItemDeleteOnClick}
                    className='buttons-styles bg-red-button w-full sm:w-[20%] md:w-[15%] lg:w-[15%] xl:w-[10vw] h-[5vh] text-center rounded-xl flex justify-center items-center'
                    iconSrc={deleteButton}
                    iconAlt='delete icon'
                >
                    DELETE
                </Button>
                <Button
                    onClick={handleItemUpdateOnClick}
                    className='buttons-styles bg-blue-button w-full sm:w-[20%] md:w-[15%] lg:w-[15%] xl:w-[10vw] h-[5vh] text-center rounded-xl flex justify-center items-center'
                    iconSrc={updateButton}
                    iconAlt='update icon'
                >
                    UPDATE
                </Button>
            </div>

    {/* Table to display users */}
            <div className='m-4 mt-5 overflow-x-auto'>
                <table className='min-w-full divide-y table-styles'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'>Id</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'>Brand</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'>Category</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'>Contact Number</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'>Reason</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                        {returnPhones.filter(user => user !== null && user !== undefined).map((user) => (
                            <tr 
                                key={user.return_phone_id} 
                                onClick={() => handleTableRowClick(user)} 
                                className='hover:bg-gray-600 cursor-pointer'
                            >
                                <td className='px-6 py-2 whitespace-nowrap transition-colors duration-300 hover:text-black hover:font-bold'>{user.return_phone_id}</td>
                                <td className='px-6 py-2 whitespace-nowrap transition-colors duration-300 hover:text-black hover:font-bold'>{user.brand}</td>
                                <td className='px-6 py-2 whitespace-nowrap transition-colors duration-300 hover:text-black hover:font-bold'>{user.category}</td>
                                <td className='px-6 py-2 whitespace-nowrap transition-colors duration-300 hover:text-black hover:font-bold'>{user.contact_number}</td>
                                <td className='px-6 py-2 whitespace-nowrap transition-colors duration-300 hover:text-black hover:font-bold'>{user.name}</td>
                                <td className='px-6 py-2 whitespace-nowrap transition-colors duration-300 hover:text-black hover:font-bold'>{user.reason}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </div>
    );
}
