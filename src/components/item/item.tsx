import React, { useState, useEffect } from 'react';
import TopNavbar from '../topNavbar';
import '../item/item.css'; // Ensure this file does not override Tailwind classes
import axios from 'axios';
import { backend_url } from '../../utill/utill';
import Swal from "sweetalert2";
import addButton from '../../../public/assets/icons/Add Btn.svg';
import updateButton from '../../../public/assets/icons/Update Btn.svg';
import deleteButton from '../../../public/assets/icons/Delete Btn.svg';

interface ItemData {
    category: string;
    name: string;
    brand: string;
    colour: string;
    price: number; 
    warranty_period: string;
    qty: string;
}

interface TableItemData extends ItemData {
    item_id: number;
}

const Item = () => {
    const [category, setCategory] = useState('');
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [colour, setColour] = useState('');
    const [price, setPrice] = useState('');
    const [warranty_period, setWarrantyPeriod] = useState('');
    const [qty, setQty] = useState('');
    const [token, setToken] = useState('');
    const [items, setItems] = useState<TableItemData[]>([]);
    const [selectedItem, setSelectedItem] = useState<TableItemData | null>(null); 
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Function to fetch items from backend
    const fetchItems = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setToken(token);
            try {
                const response = await axios.get(`${backend_url}/api/items`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.data && Array.isArray(response.data.data)) {
                    setItems(response.data.data); 
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

    useEffect(() => {
        fetchItems();
    }, []);

    // Function to handle clicking on a table row
    const handleTableRowClick = (item: TableItemData) => {
        setSelectedItem(item); 
        setCategory(item.category);
        setName(item.name);
        setBrand(item.brand);
        setColour(item.colour);
        setPrice(item.price.toString()); // Convert number to string for input field
        setWarrantyPeriod(item.warranty_period);
        setQty(item.qty);
    };

    // Function to handle adding an item
    const handleItemAddOnClick = async () => {
        if (!validateForm()) {
            return;
        }
        
        const newItemData: ItemData = {
            category,
            name,
            brand,
            colour,
            price: parseFloat(price),
            warranty_period,
            qty
        };

        try {
            const response = await axios.post(
                `${backend_url}/api/items`, newItemData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            console.log(response);
            // Show success alert
            Swal.fire({
                title: 'Success!',
                text: 'Item added successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            // Clear input fields after successful addition
            setCategory('');
            setName('');
            setBrand('');
            setColour('');
            setPrice('');
            setWarrantyPeriod('');
            setQty('');

            // Refresh items list after adding item
            fetchItems();
        } catch (error) {
            console.error('Error adding item:', error);

            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'Failed to add item',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    // Function to handle deleting an item
    const handleItemDeleteOnClick = async () => {
        if (!selectedItem) {
            console.error('No item selected for deletion');
            return;
        }

        try {
            const response = await axios.delete(
                `${backend_url}/api/items/${selectedItem.item_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            console.log(response)

            // Show success alert
            Swal.fire({
                title: 'Success!',
                text: 'Item deleted successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            // Clear selected item and input fields after deletion
            setSelectedItem(null);
            setCategory('');
            setName('');
            setBrand('');
            setColour('');
            setPrice('');
            setWarrantyPeriod('');
            setQty('');

            // Refresh items list after deletion
            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);

            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete item',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    // Function to handle updating an item
    const handleItemUpdateOnClick = async () => {
        if (!validateForm() || !selectedItem) {
            return;
        }

        const updatedItemData: ItemData = {
            category,
            name,
            brand,
            colour,
            price: parseFloat(price),
            warranty_period,
            qty,
        };

        try {
            const response = await axios.put(
                `${backend_url}/api/items/${selectedItem.item_id}`,
                updatedItemData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            console.log(response);

            // Show success alert
            Swal.fire({
                title: 'Success!',
                text: 'Item updated successfully',
                icon: 'success',
                confirmButtonText: 'OK',
            });

            // Clear selected item and input fields after update
            setSelectedItem(null);
            setCategory('');
            setName('');
            setBrand('');
            setColour('');
            setPrice('');
            setWarrantyPeriod('');
            setQty('');

            // Refresh items list after update
            fetchItems();
        } catch (error) {
            console.error('Error updating item:', error);

            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update item',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };


    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        /*if (!category) newErrors.category = 'Category is required';
        if (!name) newErrors.name = 'Name is required';
        if (!brand) newErrors.brand = 'Brand is required';
        if (!colour) newErrors.colour = 'Colour is required';
        if (!price) newErrors.price = 'Price is required';
        if (!warranty_period) newErrors.warranty_period = 'Warranty period is required';
        if (!qty) newErrors.qty = 'Quantity is required';*/
    
        // Validate numeric price
        if (price && isNaN(parseFloat(price))) {
            newErrors.price = 'Price must be a number';
        }
    
        // Validate numeric quantity
        if (qty && isNaN(parseFloat(qty))) {
            newErrors.qty = 'Quantity must be a number';
        }
    
        setErrors(newErrors);
    
        // Return true if no errors
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string) => (ev: React.ChangeEvent<HTMLInputElement>) => {
        setter(ev.target.value);
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };
    


    return (
        <div className='m-4 w-full'>
            <div className='m-4'>
                <TopNavbar />
            </div>

            {/* Inputs row */}
            <div className='m-4 text-white font-semibold'>
                <div className='mt-5 flex justify-between'>
                     <div className='flex flex-col'>
                        <input className='text-feild' value={category} onChange={handleInputChange(setCategory, 'category')} placeholder='   category' />
                        {errors.category && <span className='text-red-500 text-xs ml-[0.5vw]'>{errors.category}</span>}
                    </div>
                    <div className='flex flex-col'>
                        <input className='text-feild' value={name} onChange={handleInputChange(setName, 'name')} placeholder='   name' />
                        {errors.name && <span className='text-red-500 text-xs ml-[0.5vw]'>{errors.name}</span>}
                    </div>
                    <div className='flex flex-col'>
                        <input className='text-feild' value={brand} onChange={handleInputChange(setBrand, 'brand')} placeholder='   brand' />
                        {errors.brand && <span className='text-red-500 text-xs ml-[0.5vw]'>{errors.brand}</span>}
                    </div>
                </div>
                <div className='mt-4 flex justify-between'>
                    <div className='flex flex-col'>
                            <input className='text-feild' value={colour} onChange={handleInputChange(setColour, 'colour')} placeholder='   colour' />
                            {errors.colour && <span className='text-red-500 text-xs ml-[0.5vw]'>{errors.colour}</span>}
                        </div>
                        <div className='flex flex-col'>
                            <input className='text-feild' value={price} onChange={handleInputChange(setPrice, 'price')} placeholder='   price' />
                            {errors.price && <span className='text-red-500 text-xs ml-[0.5vw]'>{errors.price}</span>}
                        </div>
                        <div className='flex flex-col'>
                            <input className='text-feild' value={warranty_period} onChange={handleInputChange(setWarrantyPeriod, 'warranty_period')} placeholder='   warranty period' />
                            {errors.warranty_period && <span className='text-red-500 text-xs ml-[0.5vw]'>{errors.warranty_period}</span>}
                        </div>
                </div>
               
            </div>

            {/* Buttons for add, delete, update */}
            <div className='m-4 flex justify-between items-end'>
                <div className='flex flex-col'>
                        <input className='text-feild text-white' value={qty} onChange={handleInputChange(setQty, 'qty')} placeholder='   qty' />
                        {errors.qty && <span className='text-red-500 text-xs ml-[0.5vw]'>{errors.qty}</span>}
                    </div>

                <div className='flex  mt-5'>
                <button onClick={handleItemAddOnClick} className='mr-[6vw] buttons-styles bg-green-button w-[7vw] h-[5vh] text-center rounded-xl flex justify-center items-center'>
                    <img src={addButton} className='mr-[0.3vw]' alt='add icon' />ADD</button>
                <button onClick={handleItemDeleteOnClick} className='mr-[6vw] buttons-styles bg-red-button w-[8vw] h-[5vh] text-center rounded-xl flex justify-center items-center'>
                    <img src={deleteButton} className='mr-[0.3vw]' alt='delete icon' />DELETE</button>
                <button onClick={handleItemUpdateOnClick} className='buttons-styles bg-blue-button w-[8vw] h-[5vh] text-center rounded-xl flex justify-center items-center'>
                    <img src={updateButton} className='mr-[0.3vw]' alt='update icon' />UPDATE</button>
            </div>
            </div>
            

            {/* Table to display items */}
            <div className='mt-5 m-4 text-white'>
                <table className='min-w-full divide-y table-styles'>
                    <thead>
                        <tr className=''>
                            <th className='px-6 py-3 text-left text-xs text-white font-medium text-gray-500 uppercase tracking-wider'>Id</th>
                            <th className='px-6 py-3 text-left text-xs text-white font-medium text-gray-500 uppercase tracking-wider'>Category</th>
                            <th className='px-6 py-3 text-left text-xs text-white font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-3 text-left text-xs text-white font-medium text-gray-500 uppercase tracking-wider'>Brand</th>
                            <th className='px-6 py-3 text-left text-xs text-white font-medium text-gray-500 uppercase tracking-wider'>Color</th>
                            <th className='px-6 py-3 text-left text-xs text-white font-medium text-gray-500 uppercase tracking-wider'>Price</th>
                            <th className='px-6 py-3 text-left text-xs text-white font-medium text-gray-500 uppercase tracking-wider'>Warranty Period</th>
                            <th className='px-6 py-3 text-left text-xs text-white font-medium text-gray-500 uppercase tracking-wider'>Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr
                                key={item.item_id}
                                className=' text-white font-semibold hover:cursor-pointer'
                                onClick={() => handleTableRowClick(item)}
                            >
                                <td className='px-6 py-2 whitespace-nowrap text-white text-sm font-medium text-gray-500'>{item.item_id}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-white text-sm text-gray-500'>{item.category}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-white text-sm text-gray-500'>{item.name}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-white text-sm text-gray-500'>{item.brand}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-white text-sm text-gray-500'>{item.colour}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-white text-sm text-gray-500'>{item.price}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-white text-sm text-gray-500'>{item.warranty_period}</td>
                                <td className='px-6 py-2 whitespace-nowrap text-white text-sm text-gray-500'>{item.qty}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
};

export default Item;
