import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {backend_url} from "../../utill/utill.ts";
import Swal from "sweetalert2";
import axios from "axios";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ProceedPayment from "../proceed-payment/proceed-payment.tsx";

interface IProp {
    isAddNewPhoneModelOpen: boolean,
    handleAddNewPhoneModelClose: () => void,
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


export default function ReturnOrder(prop:IProp) {
    const navigate = useNavigate();
    const [shopIdReturn, setShopIdReturn] = useState<string>("");
    const [shopNameReturn, setShopNameReturn] = useState<string>("");
    const [shopContactNumberReturn, setshopContactNumberReturn] = useState<string>("");
    const [outstandingReturn, setOutstandingReturn] = useState<string>("");
    const [addressReturn] = useState<string>("");
    const [shopEmailReturn] = useState<string>("");
    const [shopOwnerNicReturn] = useState<string>("");
    const [shopCreditLimitReturn] = useState<string>("");
    const [returnPhone, setreturnPhone] = useState({
        imei: "",
        modelName: "",  // Include modelName field
        storage: "",
        colour: "",
        price: ""
    });

    const [returnPhones, setreturnPhones] = useState<Array<typeof returnPhone>>([]);
    /*const [multiplereturnPhones, setMultiplereturnPhones] = useState<Array<typeof returnPhone>>([]);*/

    const handleshopContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setshopContactNumberReturn(e.target.value);
    };

    const fetchShopName = async () => {
        try {
            const response = await fetch(`${backend_url}/api/shop/contact/${shopContactNumberReturn}`);
            const result = await response.json();
            console.log("Number : "+shopContactNumberReturn);

            if (result.status === 200 && result.data.length > 0) {
                const customer = result.data[0];
                setShopNameReturn(customer.shop_name);
                setShopIdReturn(customer.shop_id);
                setOutstandingReturn(customer.outstanding);

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
            setShopNameReturn("Error fetching customer data");
        }
    };

    const handleshopContactNumberKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            fetchShopName();
        }
    };

    /*function handleAddreturnPhones() {
        setreturnPhones([...returnPhone, ...multiplereturnPhones]);
        setMultiplereturnPhones([]);
        prop.handleAddNewPhoneModelClose();
    }*/

    function handleAddMultiplereturnPhones() {
        console.log("Works")
        if (returnPhone.imei) {
            setreturnPhones(prevreturnPhones => [...prevreturnPhones, returnPhone]);
            setreturnPhone({
                imei: "",
                modelName: "",
                storage: "",
                colour: "",
                price: ""
            });  // Reset phone form
            prop.handleAddNewPhoneModelClose();
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'IMEI cannot be empty',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }

    async function fetchPhoneDetails(imei: string) {
        try {
            const response = await axios.get(`${backend_url}/api/return/phone/imei/${imei}`);
            const { model, storage, colour, price } = response.data;

            setreturnPhone({
                imei,
                modelName: model,
                storage: storage || 'Unknown Storage',
                colour: colour || 'Default Color',
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
            fetchPhoneDetails(returnPhone.imei);
        }
    }
    const handleProceedToPaymentReturn = (orderType: string) => {
        console.log("ID : " + shopIdReturn);
        navigate(`/orderType/${orderType}`, {
            state: { returnPhones, shopNameReturn, shopContactNumberReturn, shopIdReturn , outstandingReturn,addressReturn,shopEmailReturn,shopOwnerNicReturn,shopCreditLimitReturn},
        });
    };

    return (
        <>
            <div className='mt-4 m-4'>
                <div className={`flex justify-between items-end`}>
                    <input
                        type="text"
                        value={shopContactNumberReturn}
                        onChange={handleshopContactNumberChange}
                        onKeyPress={handleshopContactNumberKeyPress}
                        placeholder="  Contact number"
                        className='text-feild text-white font-semibold'
                    />
                    <input
                        type="text"
                        value={shopNameReturn}
                        placeholder="  Shop name"
                        className='text-feild text-white font-semibold'
                        readOnly
                    />
                </div>
                {+outstandingReturn > 0 && (
                    <div className='mt-2 text-red-500'>
                        Outstanding Amount: {outstandingReturn}
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
                        <th className='px-2 py-1 text-left whitespace-nowrap'>Color</th>
                        <th className='px-2 py-1 text-left whitespace-nowrap'>Price</th>
                    </tr>
                    </thead>
                    <tbody className='overflow-y-auto max-h-80'>
                    {returnPhones.map((returnPhone, index) => (
                        <tr key={index} className='text-white font-semibold hover:bg-gray-700 text-xs'>
                            <td className='px-2 py-1 truncate'>{returnPhone.imei}</td>
                            <td className='px-2 py-1 truncate'>{returnPhone.modelName}</td>  {/* Updated */}
                            <td className='px-2 py-1 truncate'>{returnPhone.storage}</td>
                            <td className='px-2 py-1 truncate'>{returnPhone.colour}</td>
                            <td className='px-2 py-1 truncate'>{returnPhone.price}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className='m-4 flex gap-2 mt-5 justify-end'>
                <button
                    className='bg-[#00900F] p-1 rounded-md text-white font-bold'
                    onClick={() => handleProceedToPaymentReturn('return-order')}
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
                                value={returnPhone.imei}
                                onChange={(ev) => setreturnPhone({ ...returnPhone, imei: ev.target.value })}
                                onKeyDown={handleEnterKeyPress}  // Handle Enter key press
                                placeholder='   IMEI Number'
                            />
                            <div className='flex'>
                                <input
                                    className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                    value={returnPhone.modelName}  // Display modelName
                                    onChange={(ev) => setreturnPhone({ ...returnPhone, modelName: ev.target.value })}
                                    placeholder='   Model Name'
                                />
                                <input
                                    className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                    value={returnPhone.storage}
                                    onChange={(ev) => setreturnPhone({ ...returnPhone, storage: ev.target.value })}
                                    placeholder='   Storage'
                                />
                            </div>
                            <div className='flex'>
                                <input
                                    className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                    value={returnPhone.colour}
                                    onChange={(ev) => setreturnPhone({ ...returnPhone, colour: ev.target.value })}
                                    placeholder='   Colour'
                                />
                                <input
                                    className='text-feild mb-4 md:mb-0 md:w-[30%] lg:mx-2 md:mx-2 sm:mx-1'
                                    value={returnPhone.price}
                                    onChange={(ev) => setreturnPhone({ ...returnPhone, price: ev.target.value })}
                                    placeholder='   Price'
                                />
                            </div>
                            <div className='w-full flex gap-2 mt-5 justify-end'>
                                <Button onClick={handleAddMultiplereturnPhones} variant="contained" color="success">Add</Button>
                                <Button onClick={prop.handleAddNewPhoneModelClose} variant="contained" color="error">Close</Button>
                            </div>
                        </div>
                    </Box>
                </Modal>
            </div>

            <ProceedPayment returnPhones={returnPhones} shopNameReturn={shopNameReturn} shopContactNumberReturn={shopContactNumberReturn} shopIdReturn={shopIdReturn} outstandingReturn={outstandingReturn} addressReturn={addressReturn} shopEmailReturn={shopEmailReturn} shopOwnerNicReturn={shopOwnerNicReturn} shopCreditLimitReturn={shopCreditLimitReturn}/>

        </>
    );
}