import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Swal from 'sweetalert2';
import axios from 'axios';
import { backend_url } from '../../utill/utill';
import { isValidEmail, isValidNIC, isValidPhoneNumber, notNullString } from "../../utill/validation.ts";
import {useNavigate} from "react-router-dom";
import ProceedPayment from "../proceed-payment/proceed-payment.tsx";

interface IProp {
    isAddNewCustomerModelOpen: boolean,
    isAddNewPhoneModelOpen: boolean,
    isAddNewItemsModelOpen: boolean,
    handleAddNewCustomerModelClose: () => void,
    handleAddNewPhoneModelClose: () => void,
    handleAddNewItemModelClose: () => void,
}

const style = {
    position: 'absolute' as 'absolute',
    color: "white",
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "fit-content",
    bgcolor: '#14141E',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: "10px"
};
interface Item {
    item_id: string;
    category: string;
    brand: string;
    name: string;
    colour: string;
    warranty_period: string;
    qty: string;
    price: string;
}


export default function RetailOrder(prop: IProp) {

    const [customerEmail, setCustomerEmail] = useState("");
    const [customerContactNumber, setCustomerContactNumber] = useState("");
    const [customerNic, setCustomerNic] = useState("");
    const [phone, setPhone] = useState({
        imei: "",
        modelId: "",
        modelName: "",  // Include modelName field
        storage: "",
        warranty: "",
        colour: "",
        batteryHealth: "",
        price: ""
    });

    const [phones, setPhones] = useState<Array<typeof phone>>([]);
    /*const [multiplePhones, setMultiplePhones] = useState<Array<typeof phone>>([]);*/
    const [contactNumber, setContactNumber] = useState<string>("");
    const [customerName, setCustomerName] = useState<string>("");
    const [customerOutstanding, setCustomerOutstanding] = useState<string>("");
    const [customerId, setCustomerId] = useState<string>("");


    const navigate = useNavigate();
    async function fetchPhoneDetails(imei: string) {
        try {
            const response = await axios.get(`${backend_url}/api/imei/check-sale/${imei}`);
            const { modelId, storage, warranty, colour, batteryHealth, price } = response.data;
            const modelName = modelId ? modelId.name : 'Default Model Name';  // Extract modelId.name

            setPhone({
                imei,
                modelId: modelId?.id || 'Default Model ID',  // Optionally use modelId.id
                modelName,  // Set modelName here
                storage: storage || 'Unknown Storage',
                warranty: warranty,
                colour: colour || 'Default Color',
                batteryHealth: batteryHealth || 'Unknown Battery Health',
                price: price || '0'
            });
        } catch (error) {
            console.error("Error fetching phone details:", error);
            Swal.fire({
                title: 'Error!',
                text: 'Unable to fetch phone details',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }

    function handleEnterKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            event.preventDefault();  // Prevent default form submission
            fetchPhoneDetails(phone.imei);
        }
    }

    async function handleSaveCustomer() {
        try {
            notNullString(customerName);
            isValidNIC(customerNic);
            isValidEmail(customerEmail);
            const phoneNumber = isValidPhoneNumber(customerContactNumber);

            const response = await axios.post(`${backend_url}/api/customer`, {
                name: customerName,
                email: customerEmail,
                contact_phone: phoneNumber,
                nic: customerNic,
            });

            const { id } = response.data; // Adjust this to match the actual response structure

            setCustomerId(id);
            prop.handleAddNewCustomerModelClose();
            await Swal.fire({
                title: 'Success!',
                text: 'Customer saved successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } catch (e) {
            prop.handleAddNewCustomerModelClose();
            console.error(e);
            await Swal.fire({
                title: 'Error!',
                text: 'Something happened, cannot save customer',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }


    /*function handleAddPhone() {
        setPhones([...phones, ...multiplePhones]);
        setMultiplePhones([]);
        prop.handleAddNewPhoneModelClose();
    }*/

    function handleAddMultiplePhones() {
        if (phone.imei) { // Ensure IMEI is not empty
            setPhones(prevPhones => [...prevPhones, phone]);  // Add phone to state
            setPhone({
                imei: "",
                modelId: "",
                modelName: "",  // Reset modelName here
                storage: "",
                warranty: "",
                colour: "",
                batteryHealth: "",
                price: ""
            });  // Reset phone form
            prop.handleAddNewPhoneModelClose();  // Close modal
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'IMEI cannot be empty',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }


    const [itemData, setItemData] = React.useState<Item>({
        item_id: '',
        category: '',
        brand: '',
        name: '',
        colour: '',
        warranty_period: '',
        qty: '',
        price: ''
    });

    const [items, setItems] = React.useState<Item[]>([]);

    const handleFetchItemData = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/items/search/${itemData.name}`);
            if (response.data.status === 200 && response.data.data.length > 0) {
                const item = response.data.data[0];
                setItemData({
                    item_id: item.item_id,
                    category: item.category,
                    brand: item.brand,
                    name: item.name,
                    colour: item.colour,
                    warranty_period: item.warranty_period,
                    qty: item.qty,
                    price: item.price
                });
            } else {
                setItemData({
                    item_id: '',
                    category: '',
                    brand: '',
                    name: '',
                    colour: '',
                    warranty_period: '',
                    qty: '',
                    price: ''
                });
                alert('No items found');
            }
        } catch (error) {
            console.error('Error fetching item data:', error);
        }
    };

    const handleKeyPress = (event:any) => {
        if (event.key === 'Enter') {
            handleFetchItemData();
        }
    };

    const handleAddItem = () => {
        if (itemData.name) {
            setItems([...items, itemData]); // Add the new item to the list
            setItemData({
                item_id: '',
                category: '',
                brand: '',
                name: '',
                colour: '',
                warranty_period: '',
                qty: '',
                price: ''
            });
            prop.handleAddNewItemModelClose(); // Close the modal
        } else {
            alert('Please enter item details before adding.');
        }
    };

    const handleProceedToPayment = (orderType: string) => {
        console.log("ID : " + customerId);
        navigate(`/orderType/${orderType}`, {
            state: { phones, items, customerName, contactNumber, customerId , customerOutstanding},
        });
    };

    const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContactNumber(e.target.value);
    };

    /*const handleCustomerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setcustomerId(e.target.value);
    };*/

    const fetchCustomerName = async () => {
        try {
            const response = await fetch(`${backend_url}/api/customer/contact/${contactNumber}`);
            const result = await response.json();

            if (result.status === 200 && result.data.length > 0) {
                const customer = result.data[0];
                setCustomerName(customer.name);
                setCustomerId(customer.customer_id);
                setCustomerOutstanding(customer.outstandingAmount); // Note the field name here
                console.log(customer.outstandingAmount); // Updated log
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Customer not found',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error("Error fetching customer data:", error);
            setCustomerName("Error fetching customer data");
        }
    };

    const handleContactNumberKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            fetchCustomerName();
        }
    };

    return (
        <>
            {/* ... Existing code ... */}
            <div className='mt-4 m-4'>
                <div className={`flex justify-between items-end`}>
                    <input
                        type="text"
                        value={contactNumber}
                        onChange={handleContactNumberChange}
                        onKeyPress={handleContactNumberKeyPress}
                        placeholder="  Contact number"
                        className='text-feild text-white font-semibold'
                    />
                    <input
                        type="text"
                        value={customerName}
                        placeholder="  Customer name"
                        className='text-feild text-white font-semibold'
                        readOnly
                    />
                </div>
                {+customerOutstanding > 0 && (
                    <div className='mt-2 text-red-500'>
                        Outstanding Amount: {customerOutstanding}
                    </div>
                )}
            </div>

            <div className='mt-5 m-4'>
                <table className='min-w-full divide-y table-styles border-2'>
                    <thead>
                    <tr className='bg-gray-800 text-gray-400 text-xs'>
                        <th className='px-2 py-1 text-left whitespace-nowrap'>IMEI</th>
                        <th className='px-2 py-1 text-left whitespace-nowrap'>Model</th>
                        <th className='px-2 py-1 text-left whitespace-nowrap'>Storage</th>
                        <th className='px-2 py-1 text-left whitespace-nowrap'>Warranty</th>
                        <th className='px-2 py-1 text-left whitespace-nowrap'>Color</th>
                        <th className='px-2 py-1 text-left whitespace-nowrap'>Battery Health</th>
                        <th className='px-2 py-1 text-left whitespace-nowrap'>Price</th>
                    </tr>
                    </thead>
                    <tbody className='overflow-y-auto max-h-80'>
                    {phones.map((phone, index) => (
                        <tr key={index} className='text-white font-semibold hover:bg-gray-700 text-xs'>
                            <td className='px-2 py-1 truncate'>{phone.imei}</td>
                            <td className='px-2 py-1 truncate'>{phone.modelName}</td>  {/* Updated */}
                            <td className='px-2 py-1 truncate'>{phone.storage}</td>
                            <td className='px-2 py-1 truncate'>{phone.warranty}</td>
                            <td className='px-2 py-1 truncate'>{phone.colour}</td>
                            <td className='px-2 py-1 truncate'>{phone.batteryHealth}</td>
                            <td className='px-2 py-1 truncate'>{phone.price}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

                {items.length > 0 && (
                    <div className='mt-5 m-4'>
                        <table className='min-w-full divide-y table-styles border-2'>
                            <thead>
                            <tr className='bg-gray-800 text-gray-400 text-xs'>
                                <th className='px-2 py-1 text-left whitespace-nowrap'>Brand</th>
                                <th className='px-2 py-1 text-left whitespace-nowrap'>Category</th>
                                <th className='px-2 py-1 text-left whitespace-nowrap'>Colour</th>
                                <th className='px-2 py-1 text-left whitespace-nowrap'>Name</th>
                                <th className='px-2 py-1 text-left whitespace-nowrap'>Price</th>
                                <th className='px-2 py-1 text-left whitespace-nowrap'>Qty</th>
                                <th className='px-2 py-1 text-left whitespace-nowrap'>Warranty</th>
                            </tr>
                            </thead>
                            <tbody className='overflow-y-auto max-h-80'>
                            {items.map((item:any, index:number) => (
                                <tr key={index} className='text-white font-semibold hover:bg-gray-700 text-xs'>
                                    <td className='px-2 py-1 truncate'>{item.brand}</td>
                                    <td className='px-2 py-1 truncate'>{item.category}</td>
                                    <td className='px-2 py-1 truncate'>{item.colour}</td>
                                    <td className='px-2 py-1 truncate'>{item.name}</td>
                                    <td className='px-2 py-1 truncate'>{item.price}</td>
                                    <td className='px-2 py-1 truncate'>{item.qty}</td>
                                    <td className='px-2 py-1 truncate'>{item.warranty_period}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className='m-4 flex gap-2 mt-5 justify-end'>
                    <button
                        className='bg-[#00900F] p-1 rounded-md text-white font-bold'
                        onClick={() => handleProceedToPayment('retail-order')}
                    >
                        Proceed To Payment
                    </button>
                    <button className='bg-[#B10000] p-1 rounded-md text-white font-bold'>
                        Cancel Payment
                    </button>
                </div>


                {/* Add Customer Modal */}
            <div>
                {/* <Button onClick={handleOpen}>Open modal</Button> */}
                <Modal
                    className='z-auto'
                    open={prop.isAddNewCustomerModelOpen}
                    onClose={prop.handleAddNewCustomerModelClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Typography className='text-center' id="modal-modal-title" variant="h5" component="h2">
                            Add new customer
                        </Typography>
                        <div className='w-full flex flex-col items-center mt-2'>
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={customerName}
                                onChange={(ev) => setCustomerName(ev.target.value)}
                                placeholder='   Customer Name'
                            />
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={customerEmail}
                                onChange={(ev) => setCustomerEmail(ev.target.value)}
                                placeholder='   Email'
                            />
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={customerContactNumber}
                                onChange={(ev) => setCustomerContactNumber(ev.target.value)}
                                placeholder='   Whatsapp Number'
                            />
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={customerNic}
                                onChange={(ev) => setCustomerNic(ev.target.value)}
                                placeholder='   Nic'
                            />
                        </div>
                        <div className='w-full flex gap-2 mt-5 justify-center'>
                            <Button onClick={handleSaveCustomer} variant="contained" color="success">Add</Button>
                            <Button onClick={prop.handleAddNewCustomerModelClose} variant="contained" color="error">Close</Button>
                        </div>
                    </Box>
                </Modal>
            </div>

            {/* Add Phone Modal */}
            <div>
                <Modal
                    open={prop.isAddNewPhoneModelOpen}
                    onClose={prop.handleAddNewPhoneModelClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Typography className='' id="modal-modal-title" variant="h5" component="h2">
                            Add Phone
                        </Typography>
                        <div className='w-full flex flex-col mt-2'>
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={phone.imei}
                                onChange={(ev) => setPhone({ ...phone, imei: ev.target.value })}
                                onKeyDown={handleEnterKeyPress}  // Handle Enter key press
                                placeholder='   IMEI Number'
                            />
                            <div className='flex'>
                                <input
                                    className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                    value={phone.modelName}  // Display modelName
                                    onChange={(ev) => setPhone({ ...phone, modelName: ev.target.value })}
                                    placeholder='   Model Name'
                                />
                                <input
                                    className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                    value={phone.storage}
                                    onChange={(ev) => setPhone({ ...phone, storage: ev.target.value })}
                                    placeholder='   Storage'
                                />
                                <input
                                    className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                    value={phone.warranty}
                                    onChange={(ev) => setPhone({ ...phone, warranty: ev.target.value })}
                                    placeholder='   Warranty'
                                />
                            </div>
                            <div className='flex'>
                                <input
                                    className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                    value={phone.colour}
                                    onChange={(ev) => setPhone({ ...phone, colour: ev.target.value })}
                                    placeholder='   Colour'
                                />
                                <input
                                    className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                    value={phone.batteryHealth}
                                    onChange={(ev) => setPhone({ ...phone, batteryHealth: ev.target.value })}
                                    placeholder='   Battery Health'
                                />
                                <input
                                    className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                    value={phone.price}
                                    onChange={(ev) => setPhone({ ...phone, price: ev.target.value })}
                                    placeholder='   Price'
                                />
                            </div>
                            <div className='w-full flex gap-2 mt-5 justify-end'>
                                <Button onClick={handleAddMultiplePhones} variant="contained" color="success">Add</Button>
                                <Button onClick={prop.handleAddNewPhoneModelClose} variant="contained" color="error">Close</Button>
                            </div>
                        </div>
                    </Box>
                </Modal>
            </div>

            {/* model add items*/}
             <div>
                    <Modal
                        open={prop.isAddNewItemsModelOpen}
                        onClose={prop.handleAddNewItemModelClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={{ ...style }}>
                            <Typography id="modal-modal-title" variant="h5" component="h2">
                                Add Item
                            </Typography>
                            <div className='w-full flex flex-col mt-2'>
                                <input
                                    className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                    value={itemData.name}
                                    onChange={(ev) => setItemData({...itemData, name: ev.target.value})}
                                    onKeyDown={handleKeyPress}
                                    placeholder='Item Name'
                                />
                                <div className='flex'>
                                    <input
                                        className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                        value={itemData.category}
                                        onChange={(ev) => setItemData({...itemData, category: ev.target.value})}
                                        placeholder='Category'
                                    />
                                    <input
                                        className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                        value={itemData.brand}
                                        onChange={(ev) => setItemData({...itemData, brand: ev.target.value})}
                                        placeholder='Brand'
                                    />
                                </div>
                                <div>
                                    <input
                                        className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                        value={itemData.colour}
                                        onChange={(ev) => setItemData({...itemData, colour: ev.target.value})}
                                        placeholder='Color'
                                    />
                                    <input
                                        className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                        value={itemData.warranty_period}
                                        onChange={(ev) => setItemData({...itemData, warranty_period: ev.target.value})}
                                        placeholder='Warranty Period'
                                    />
                                </div>
                                <div>
                                    <input
                                        className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                        value={itemData.qty}
                                        onChange={(ev) => setItemData({...itemData, qty: ev.target.value})}
                                        placeholder='Quantity'
                                    />
                                    <input
                                        className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                        value={itemData.price}
                                        onChange={(ev) => setItemData({...itemData, price: ev.target.value})}
                                        placeholder='Price'
                                    />
                                </div>
                            </div>

                            <div className='w-full flex gap-2 mt-5 justify-end'>
                                <Button onClick={handleAddItem} variant="contained" color="success">Add</Button>
                                <Button onClick={prop.handleAddNewItemModelClose} variant="contained" color="error">Close</Button>
                            </div>
                        </Box>
                    </Modal>

                </div>
            <ProceedPayment phones={phones} itemData={itemData} customerName={customerName} contactNumber={contactNumber} customerId={customerId} customerOutstanding={customerOutstanding} />
        </>
    );
}
