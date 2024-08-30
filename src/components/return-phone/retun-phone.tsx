import React, { useState, useEffect } from 'react';
import TopNavbar from '../topNavbar';
import Combobox from '../combobox/combobox';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '../crudbuttons/buttons';
import Swal from 'sweetalert2';
import axios from 'axios';
import { backend_url } from '../../utill/utill';

const storageOptions = [
    { value: '64GB', label: '64GB' },
    { value: '128GB', label: '128GB' },
    { value: '256GB', label: '256GB' },
    { value: '512GB', label: '512GB' },
    { value: '1TB', label: '1TB' },
];

const colourOptions = [
    { value: 'Gold', label: 'Gold' },
    { value: 'White', label: 'White' },
];

interface PhoneData {
    return_phone_id?: string;
    imei: string;
    model: string;
    storage: string;
    colour: string;
    reason: string;
    name: string;
    outStanding: string;
    date: string;
    contact_number: string;
    customer_id?: string;
    shop_id?:string;
}

export default function ReturnPhone() {
    const [imei, setImei] = useState<string>('');
    const [model, setModel] = useState<string>('');
    const [storage, setStorage] = useState<string>('');
    const [colour, setColour] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [outStanding, setOutStanding] = useState<string>('');
    const [date, setDate] = useState<Date | null>(null);
    const [contact_number, setContact_number] = useState<string>('');
    const [customer_id, setCustomer_id] = useState<string>('');
    const [shop_id, setShop_id] = useState<string>('');
    const [return_phone_id, setReturn_phone_id] = useState<string>('');
    const [token, setToken] = useState<string>('');
    const [items, setItems] = useState<PhoneData[]>([]);
    const [selectedItem, setSelectedItem] = useState<PhoneData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    console.log(return_phone_id);
    console.log(isLoading);

    useEffect(() => {
        // Retrieve token from localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
            setToken(token);
        }
    }, []);

    useEffect(() => {
        // Fetch data from the backend
        const fetchData = async () => {
            if (!token) return;

            setIsLoading(true);
            try {
                const response = await axios.get(`${backend_url}/api/return/phone`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setItems(response.data.data);
                console.log(response.data.data);
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to fetch return phone data',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const validateForm = (): boolean => {
        if (!imei || !name || !model || !colour || !storage || !reason || !outStanding || !date || !contact_number) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill all fields',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return false;
        }
        return true;
    };

    const handleItemDeleteOnClick = async () => {
        if (!selectedItem?.return_phone_id) {
            Swal.fire({
                title: 'Error!',
                text: 'No item selected for deletion',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const response = await axios.delete(`${backend_url}/api/return/phone/${selectedItem.return_phone_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Phone data deleted successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                setItems(items.filter(item => item.return_phone_id !== selectedItem.return_phone_id));
                setSelectedItem(null);
                clearForm();
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete return phone data',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const phoneData: PhoneData = {
            imei,
            model,
            storage,
            colour,
            reason,
            name,
            outStanding,
            date: date?.toISOString() || '',
            contact_number,
            customer_id,
            shop_id
        };

        try {
            const response = await axios.post(`${backend_url}/api/return/phone`, phoneData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Phone data saved successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                setItems([...items, response.data]);
                clearForm();
                setTimeout(() => {
                    window.location.reload();
                }, 4000);
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to save return phone data',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleItemUpdateOnClick = async () => {
        if (!selectedItem?.return_phone_id) {
            Swal.fire({
                title: 'Error!',
                text: 'No item selected for update',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!validateForm()) return;

        const updatedPhoneData: PhoneData = {
            ...selectedItem,
            imei,
            model,
            storage,
            colour,
            reason,
            name,
            outStanding,
            date: date?.toISOString() || '',
            contact_number
        };

        try {
            const response = await axios.put(`${backend_url}/api/return/phone/${selectedItem.return_phone_id}`, updatedPhoneData, {
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
                setItems(prevItems =>
                    prevItems.map(item => item.return_phone_id === selectedItem.return_phone_id ? updatedPhoneData : item)
                );
                clearForm();
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

    const handleTableRowClick = (item: PhoneData) => {
        setSelectedItem(item);
        setImei(item.imei);
        setModel(item.model);
        setStorage(item.storage);
        setColour(item.colour);
        setReason(item.reason);
        setName(item.name);
        setOutStanding(item.outStanding);
        setDate(new Date(item.date));
        setContact_number(item.contact_number);
        setCustomer_id(item.customer_id || '');
        setShop_id(item.shop_id || '');
        setReturn_phone_id(item.return_phone_id || '');
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearch = async () => {
        if (!imei) {
            Swal.fire({
                title: 'Error!',
                text: 'Please enter an IMEI Number',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const response = await axios.get(`${backend_url}/api/imei/return/${imei}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const phoneData = response.data; 
            console.log(phoneData.shop.shop_id)  
            if (phoneData) {
                setSelectedItem(phoneData);
                setModel(phoneData.modelId.name);
                setStorage(phoneData.storage);
                setColour(phoneData.colour);
                setReason(phoneData.reason);

                if (phoneData.customer!=null) {
                    setName(phoneData.customer.name);
                    setContact_number(phoneData.customer.contact_phone);
                    setCustomer_id(phoneData.customer.customer_id || '');
                } else if (phoneData.shop!=null) {
                    setName(phoneData.shop.shop_name);
                    setContact_number(phoneData.shop.contact_number);
                    setShop_id(phoneData.shop.shop_id);
                }

                setOutStanding(phoneData.price);
                // setDate(new Date(phoneData.date));
                setReturn_phone_id(phoneData.return_phone_id || '');

            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'IMEI not found',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                clearForm();

            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to fetch return phone data',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const clearForm = () => {
        setImei('');
        setModel('');
        setStorage('');
        setColour('');
        setReason('');
        setName('');
        setOutStanding('');
        setDate(null);
        setContact_number('');
        setCustomer_id('');
        setReturn_phone_id('');
        setSelectedItem(null);
    };

    
    return (
        <div className='m-4 w-full'>
            <div className="m-4">
                <TopNavbar />
            </div>

            {/* inputs */}
            <div className='m-4 text-white font-semibold'>
                <div className='mt-5 flex flex-col sm:flex-row justify-between '>
                    <input
                        className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                        value={imei || ''}
                        onChange={(ev) => setImei(ev.target.value)}
                        placeholder='   IMEI Number'
                        onKeyDown={handleKeyDown}

                    />
                    <input
                        className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                        value={model || ''}
                        onChange={(ev) => setModel(ev.target.value)}
                        placeholder='   Model'
                    />
                    <Combobox
                        value={storage || ''}
                        onChange={(ev) => setStorage(ev.target.value)}
                        options={storageOptions}
                        placeholder='Storage'
                    />
                </div>

                <div className='mt-3 flex flex-col sm:flex-row justify-between '>
                    <input
                            className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                            value={name}
                            onChange={(ev) => setName(ev.target.value)}
                            placeholder='   Name'
                        />

                    <input
                        className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                        value={contact_number || ''}
                        onChange={(ev) => setContact_number(ev.target.value)}
                        placeholder='   Contact Number'
                    />
                
                    <Combobox
                        value={colour || ''}
                        onChange={(ev) => setColour(ev.target.value)}
                        options={colourOptions}
                        placeholder='  Colour'
                    />
                </div>

                <div className='mt-3 flex flex-col sm:flex-row justify-between'>
                    <DatePicker
                        className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                        selected={date || null}
                        onChange={(date) => setDate(date)}
                        placeholderText='   Date'
                        dateFormat='MM/dd/yyyy'
                        showPopperArrow={false}
                    />

                    <input
                        className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                        value={reason}
                        onChange={(ev) => setReason(ev.target.value)}
                        placeholder='   Reason'
                    />
                   
                    <input
                        className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                        value={outStanding}
                        onChange={(ev) => setOutStanding(ev.target.value)}
                        placeholder='   Unit Price'
                    />
                </div>
            </div>

            <div className='m-4 flex mt-5 gap-x-[3vw] justify-end'>
                <Button
                    onClick={handleSave}
                    className='buttons-styles bg-green-button w-full sm:w-[20%] md:w-[15%] lg:w-[15%] xl:w-[10vw] h-[5vh] text-center rounded-xl flex justify-center items-center'
                    iconSrc={'src/assets/icons/Add Btn.svg'}
                    iconAlt='add icon'
                >
                    ADD
                </Button>
                <Button
                    onClick={handleItemDeleteOnClick}
                    className='buttons-styles bg-red-button w-full sm:w-[20%] md:w-[15%] lg:w-[15%] xl:w-[10vw] h-[5vh] text-center rounded-xl flex justify-center items-center'
                    iconSrc={'src/assets/icons/Delete Btn.svg'}
                    iconAlt='delete icon'
                >
                    DELETE
                </Button>
                <Button
                    onClick={handleItemUpdateOnClick}
                    className='buttons-styles bg-blue-button w-full sm:w-[20%] md:w-[15%] lg:w-[15%] xl:w-[10vw] h-[5vh] text-center rounded-xl flex justify-center items-center'
                    iconSrc={'src/assets/icons/Update Btn.svg'}
                    iconAlt='update icon'
                >
                    UPDATE
                </Button>
            </div>

            {/* table */}
            <div className='m-4 mt-5 overflow-auto max-h-[50vh]'>
                <table className='w-full text-white table-styles'>
                    <thead>
                        <tr>
                           <th className='p-2 border'>ID</th>
                            <th className='p-2 border'>Model</th>
                            <th className='p-2 border'>IMEI Number</th>
                            <th className='p-2 border'>Storage</th>
                            <th className='p-2 border'>Colour</th>
                            <th className='p-2 border'>Name</th>
                            <th className='p-2 border'>outStanding</th>
                            <th className='p-2 border'>Date</th>
                            <th className='p-2 border'>contact_number</th>
                            <th className='p-2 border'>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index} className='cursor-pointer' onClick={() => handleTableRowClick(item)}>
                                <td className='p-2 border'>{item.return_phone_id}</td>
                                <td className='p-2 border'>{item.model}</td>
                                <td className='p-2 border'>{item.imei}</td>
                                <td className='p-2 border'>{item.storage}</td>
                                <td className='p-2 border'>{item.colour}</td>
                                <td className='p-2 border'>{item.name}</td>
                                <td className='p-2 border'>{item.outStanding}</td>
                                <td className='p-2 border'>{new Date(item.date).toLocaleDateString()}</td>
                                <td className='p-2 border'>{item.contact_number}</td>
                                <td className='p-2 border'>{item.reason}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
