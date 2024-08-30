import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import {backend_url} from "../../utill/utill.ts";
import Swal from "sweetalert2";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import ProceedPayment from "../proceed-payment/proceed-payment.tsx";

interface IProp {
    isAddNewPhoneModelOpen: boolean,
    isAddNewItemsModelOpen: boolean,
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
interface WholesaleItem {
    item_id: string;
    category: string;
    brand: string;
    name: string;
    colour: string;
    warranty_period: string;
    qty: string;
    price: string;
}

export default function WholeSaleOrder(prop:IProp) {
    const navigate = useNavigate();
    const [shopId, setShopId] = useState<string>("");
    const [shopName, setShopName] = useState<string>("");
    const [shopContactNumber, setshopContactNumber] = useState<string>("");
    const [outstanding, setOutstanding] = useState<string>("");
    const [address] = useState<string>("");
    const [shopEmail] = useState<string>("");
    const [shopOwnerNic] = useState<string>("");
    const [shopCreditLimit] = useState<string>("");
    const [wholesalePhone, setwholesalePhone] = useState({
        imei: "",
        modelId: "",
        modelName: "",  // Include modelName field
        storage: "",
        warranty: "",
        colour: "",
        batteryHealth: "",
        price: ""
    });

    const [wholesalePhones, setwholesalePhones] = useState<Array<typeof wholesalePhone>>([]);
    /*const [multiplewholesalePhones, setMultiplewholesalePhones] = useState<Array<typeof wholesalePhone>>([]);*/

    const handleshopContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setshopContactNumber(e.target.value);
    };

    const fetchShopName = async () => {
        try {
            const response = await fetch(`${backend_url}/api/shop/contact/${shopContactNumber}`);
            const result = await response.json();

            if (result.status === 200 && result.data.length > 0) {
                const customer = result.data[0];
                setShopName(customer.shop_name);
                setShopId(customer.shop_id);
                setOutstanding(customer.outstanding); // Note the field name here

            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Shop not found',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error("Error fetching customer data:", error);
            setShopName("Error fetching customer data");
        }
    };

    const handleshopContactNumberKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            fetchShopName();
        }
    };

    /*function handleAddwholesalePhones() {
        setwholesalePhones([...wholesalePhone, ...multiplewholesalePhones]);
        setMultiplewholesalePhones([]);
        prop.handleAddNewPhoneModelClose();
    }*/

    function handleAddMultiplewholesalePhones() {
        if (wholesalePhone.imei) { // Ensure IMEI is not empty
            setwholesalePhones(prevwholesalePhones => [...prevwholesalePhones, wholesalePhone]);  // Add phone to state
            setwholesalePhone({
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


    const [wholesaleItemData, setwholesaleItemData] = useState<WholesaleItem>({
        item_id: '',
        category: '',
        brand: '',
        name: '',
        colour: '',
        warranty_period: '',
        qty: '',
        price: ''
    });

    const [wholesaleItems, setWholesaleItems] = useState<WholesaleItem[]>([]);

    const handleFetchwholesaleItemData = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/items/search/${wholesaleItemData.name}`);
            if (response.data.status === 200 && response.data.data.length > 0) {
                const item = response.data.data[0];
                setwholesaleItemData({
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
                setwholesaleItemData({
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
            handleFetchwholesaleItemData();
        }
    };

    const handleAddItem = () => {
        setWholesaleItems([...wholesaleItems, wholesaleItemData]);
        // Reset the form after adding the item (optional)
        setwholesaleItemData({
            item_id: '',
            category: '',
            brand: '',
            name: '',
            colour: '',
            warranty_period: '',
            qty: '',
            price: ''
        });
    };

    async function fetchPhoneDetails(imei: string) {
        try {
            const response = await axios.get(`${backend_url}/api/imei/check-sale/${imei}`);
            const { modelId, storage, warranty, colour, batteryHealth, price } = response.data;
            const modelName = modelId ? modelId.name : 'Default Model Name';  // Extract modelId.name

            setwholesalePhone({
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
            fetchPhoneDetails(wholesalePhone.imei);
        }
    }

    const handleProceedToPaymentWholesale = (orderType: string) => {
        console.log("ID : " + shopId);
        navigate(`/orderType/${orderType}`, {
            state: { wholesalePhones, wholesaleItems, shopName, shopContactNumber, shopId , outstanding,address,shopEmail,shopOwnerNic,shopCreditLimit},
        });
    };

    return (
    <>
        <div className='mt-4 m-4'>
            <div className={`flex justify-between items-end`}>
                <input
                    type="text"
                    value={shopContactNumber}
                    onChange={handleshopContactNumberChange}
                    onKeyPress={handleshopContactNumberKeyPress}
                    placeholder="  Contact number"
                    className='text-feild text-white font-semibold'
                />
                <input
                    type="text"
                    value={shopName}
                    placeholder="  Shop name"
                    className='text-feild text-white font-semibold'
                    readOnly
                />
            </div>
            {+outstanding > 0 && (
                <div className='mt-2 text-red-500'>
                    Outstanding Amount: {outstanding}
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
                {wholesalePhones.map((wholesalePhone, index) => (
                    <tr key={index} className='text-white font-semibold hover:bg-gray-700 text-xs'>
                        <td className='px-2 py-1 truncate'>{wholesalePhone.imei}</td>
                        <td className='px-2 py-1 truncate'>{wholesalePhone.modelName}</td>  {/* Updated */}
                        <td className='px-2 py-1 truncate'>{wholesalePhone.storage}</td>
                        <td className='px-2 py-1 truncate'>{wholesalePhone.warranty}</td>
                        <td className='px-2 py-1 truncate'>{wholesalePhone.colour}</td>
                        <td className='px-2 py-1 truncate'>{wholesalePhone.batteryHealth}</td>
                        <td className='px-2 py-1 truncate'>{wholesalePhone.price}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

        {wholesaleItems.length > 0 && (
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
                    {wholesaleItems.map((wholesaleItem:any, index:number) => (
                        <tr key={index} className='text-white font-semibold hover:bg-gray-700 text-xs'>
                            <td className='px-2 py-1 truncate'>{wholesaleItem.brand}</td>
                            <td className='px-2 py-1 truncate'>{wholesaleItem.category}</td>
                            <td className='px-2 py-1 truncate'>{wholesaleItem.colour}</td>
                            <td className='px-2 py-1 truncate'>{wholesaleItem.name}</td>
                            <td className='px-2 py-1 truncate'>{wholesaleItem.price}</td>
                            <td className='px-2 py-1 truncate'>{wholesaleItem.qty}</td>
                            <td className='px-2 py-1 truncate'>{wholesaleItem.warranty_period}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )}
        <div className='m-4 flex gap-2 mt-5 justify-end'>
            <button
                className='bg-[#00900F] p-1 rounded-md text-white font-bold'
                onClick={() => handleProceedToPaymentWholesale('wholesale-order')}
            >
                Proceed To Payment
            </button>
            <button className='bg-[#B10000] p-1 rounded-md text-white font-bold'>
                Cancel Payment
            </button>
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
                            value={wholesalePhone.imei}
                            onChange={(ev) => setwholesalePhone({ ...wholesalePhone, imei: ev.target.value })}
                            onKeyDown={handleEnterKeyPress}  // Handle Enter key press
                            placeholder='   IMEI Number'
                        />
                        <div className='flex'>
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={wholesalePhone.modelName}  // Display modelName
                                onChange={(ev) => setwholesalePhone({ ...wholesalePhone, modelName: ev.target.value })}
                                placeholder='   Model Name'
                            />
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={wholesalePhone.storage}
                                onChange={(ev) => setwholesalePhone({ ...wholesalePhone, storage: ev.target.value })}
                                placeholder='   Storage'
                            />
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={wholesalePhone.warranty}
                                onChange={(ev) => setwholesalePhone({ ...wholesalePhone, warranty: ev.target.value })}
                                placeholder='   Warranty'
                            />
                        </div>
                        <div className='flex'>
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={wholesalePhone.colour}
                                onChange={(ev) => setwholesalePhone({ ...wholesalePhone, colour: ev.target.value })}
                                placeholder='   Colour'
                            />
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={wholesalePhone.batteryHealth}
                                onChange={(ev) => setwholesalePhone({ ...wholesalePhone, batteryHealth: ev.target.value })}
                                placeholder='   Battery Health'
                            />
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={wholesalePhone.price}
                                onChange={(ev) => setwholesalePhone({ ...wholesalePhone, price: ev.target.value })}
                                placeholder='   Price'
                            />
                        </div>
                        <div className='w-full flex gap-2 mt-5 justify-end'>
                            <Button onClick={handleAddMultiplewholesalePhones} variant="contained" color="success">Add</Button>
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
                            value={wholesaleItemData.name}
                            onChange={(ev) => setwholesaleItemData({...wholesaleItemData, name: ev.target.value})}
                            onKeyDown={handleKeyPress}
                            placeholder='Item Name'
                        />
                        <div className='flex'>
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={wholesaleItemData.category}
                                onChange={(ev) => setwholesaleItemData({...wholesaleItemData, category: ev.target.value})}
                                placeholder='Category'
                            />
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={wholesaleItemData.brand}
                                onChange={(ev) => setwholesaleItemData({...wholesaleItemData, brand: ev.target.value})}
                                placeholder='Brand'
                            />
                        </div>
                        <div>
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={wholesaleItemData.colour}
                                onChange={(ev) => setwholesaleItemData({...wholesaleItemData, colour: ev.target.value})}
                                placeholder='Color'
                            />
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={wholesaleItemData.warranty_period}
                                onChange={(ev) => setwholesaleItemData({...wholesaleItemData, warranty_period: ev.target.value})}
                                placeholder='Warranty Period'
                            />
                        </div>
                        <div>
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={wholesaleItemData.qty}
                                onChange={(ev) => setwholesaleItemData({...wholesaleItemData, qty: ev.target.value})}
                                placeholder='Quantity'
                            />
                            <input
                                className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                value={wholesaleItemData.price}
                                onChange={(ev) => setwholesaleItemData({...wholesaleItemData, price: ev.target.value})}
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

        <ProceedPayment wholesalePhones={wholesalePhones} wholesaleItemData={wholesaleItemData} shopName={shopName} shopContactNumber={shopContactNumber} shopId={shopId} outstanding={outstanding} address={address} shopEmail={shopEmail} shopOwnerNic={shopOwnerNic} shopCreditLimit={shopCreditLimit}/>

    </>
  );
}
