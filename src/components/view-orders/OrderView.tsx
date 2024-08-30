import { useEffect, useState } from 'react';
import axios from 'axios';
import Button from '../crudbuttons/buttons';
import { backend_url } from '../../utill/utill';

// Interfaces
interface Shop {
    shop_id: number;
    shop_name: string;
    address: string;
    email: string;
    contact_number: string;
    owner_nic: string;
    credit_limit: number;
    is_deleted: boolean;
    outstanding: number | null;
}

interface WholesaleOrder {
    wholesale_order_id: number;
    discount: number;
    actual_price: number;
    total_amount: number;
    date: string;
    shop: Shop;
    items: string[];
    imeis: Imei[];
}

interface Imei {
    id: number;
    imei: string;
    storage: string;
    colour: string;
    warranty: string | null;
    batteryHealth: number;
    price: number;
    status: string;
    modelId: Model;
    customer: string | null;
    shop: string | null;
    deleted: boolean;
    iosversion: number;
}

interface Model {
    id: number;
    name: string | null;
    imeiNumbers: string | null;
    stockAddedDate: string | null;
}

interface RetailOrder {
    retail_order_id: number;
    discount: number;
    actual_price: number;
    total_amount: number;
    date: string;
    items: string[];
    imeis: Imei[];
    customer: Customer
}

interface ReturnOrder {
    return_order_id: number;
    reason: string;
    price: number;
    date: string;
}
interface Customer {
    customer_id: number;
    name: string;
    email: string;
    contact_phone: string;
    nic: string;
    outstandingAmount: number;
}


// Component
export default function WholesaleOrderView() {
    const [visibleTable, setVisibleTable] = useState<'retail' | 'wholesale' | 'return' | null>(null);
    const [token, setToken] = useState<string>('');
    const [wholesaleOrders, setWholesaleOrders] = useState<WholesaleOrder[]>([]);
    const [retailOrders, setRetailOrders] = useState<RetailOrder[]>([]);
    const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<WholesaleOrder | RetailOrder | ReturnOrder | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setToken(token);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;

            try {
                const [wholesaleResponse, retailResponse, returnResponse] = await Promise.all([
                    axios.get(`${backend_url}/api/wholesaleOrder`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${backend_url}/api/retailOrder`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${backend_url}/api/returnOrder`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setWholesaleOrders(wholesaleResponse.data.data);
                setRetailOrders(retailResponse.data.data);
                setReturnOrders(returnResponse.data.data);
            } catch (error) {
                console.error('No data available', error);
            }
        };

        fetchData();
    }, [token]);

    const handleTableVisibility = (table: 'retail' | 'wholesale' | 'return') => {
        setVisibleTable(table);
    };

    const handleViewOrderDetails = (order: WholesaleOrder | RetailOrder | ReturnOrder) => {
        setSelectedOrder(order);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
    };

    return (
        <div className="m-4">
            {/* Buttons */}
            <div className="m-4 flex mt-5 gap-x-[1vw] justify-between">
                <Button
                    onClick={() => handleTableVisibility('retail')}
                    className="buttons-styles bg-green-button w-full sm:w-[20%] md:w-[15%] lg:w-[15%] xl:w-[10vw] h-[5vh] text-center rounded-xl flex justify-center items-center"
                    iconSrc="src/assets/icons/Add Btn.svg"
                    iconAlt="Retail Orders"
                >
                    Retail Orders
                </Button>
                <Button
                    onClick={() => handleTableVisibility('wholesale')}
                    className="buttons-styles bg-green-button w-full sm:w-[20%] md:w-[15%] lg:w-[15%] xl:w-[10vw] h-[5vh] text-center rounded-xl flex justify-center items-center"
                    iconSrc="src/assets/icons/Add Btn.svg"
                    iconAlt="Wholesale Orders"
                >
                    Wholesale
                </Button>
                <Button
                    onClick={() => handleTableVisibility('return')}
                    className="buttons-styles bg-green-button w-full sm:w-[20%] md:w-[15%] lg:w-[15%] xl:w-[10vw] h-[5vh] text-center rounded-xl flex justify-center items-center"
                    iconSrc="src/assets/icons/Add Btn.svg"
                    iconAlt="Return Orders"
                >
                    Return Orders
                </Button>
            </div>
    
            {/* Conditional rendering of tables */}
            {visibleTable && (
                <div className="m-4 mt-5 overflow-auto max-h-[50vh]">
                    <table className="w-full text-white table-styles">
                        <thead>
                            <tr>
                                {visibleTable === 'return' ? (
                                    <>
                                        <th className="p-2 border">Order ID</th>
                                        <th className="p-2 border">Reason</th>
                                        <th className="p-2 border">Price</th>
                                        <th className="p-2 border">Date</th>
                                        <th className="p-2 border">View</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="p-2 border">Order ID</th>
                                        <th className="p-2 border">Discount</th>
                                        <th className="p-2 border">Actual Price</th>
                                        <th className="p-2 border">Total Amount</th>
                                        <th className="p-2 border">Date</th>
                                        {visibleTable === 'wholesale' && <th className="p-2 border">Shop</th>}
                                        <th className="p-2 border">View</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleTable === 'wholesale' && wholesaleOrders.map((order, index) => (
                                <tr key={index} className="cursor-pointer hover:bg-gray-600 ">
                                    <td className="p-2 border">{order.wholesale_order_id}</td>
                                    <td className="p-2 border">{order.discount}</td>
                                    <td className="p-2 border">{order.actual_price}</td>
                                    <td className="p-2 border">{order.total_amount}</td>
                                    <td className="p-2 border">{order.date}</td>
                                    <td className="p-2 border">{order.shop?.shop_name || 'N/A'}</td>
                                    <td className="p-2 border">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                            onClick={() => handleViewOrderDetails(order)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {visibleTable === 'retail' && retailOrders.map((order, index) => (
                                <tr key={index} className="cursor-pointer hover:bg-gray-600 hover:font-bold">
                                    <td className="p-2 border">{order.retail_order_id}</td>
                                    <td className="p-2 border">{order.discount}</td>
                                    <td className="p-2 border">{order.actual_price}</td>
                                    <td className="p-2 border">{order.total_amount}</td>
                                    <td className="p-2 border">{order.date}</td>
                                    <td className="p-2 border">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                            onClick={() => handleViewOrderDetails(order)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {visibleTable === 'return' && returnOrders.map((order, index) => (
                                <tr key={index} className="cursor-pointer hover:bg-gray-600 hover:font-bold">
                                    <td className="p-2 border">{order.return_order_id}</td>
                                    <td className="p-2 border">{order.reason}</td>
                                    <td className="p-2 border">{order.price}</td>
                                    <td className="p-2 border">{order.date}</td>
                                    <td className="p-2 border">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                            onClick={() => handleViewOrderDetails(order)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
    
           {/* Modal for order details */}
        {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg max-w-md w-full shadow-lg overflow-y-auto max-h-[80vh]">
                    <h2 className="text-3xl font-bold mb-4 text-purple-600">Order Details</h2>
                    <div>
                        {visibleTable === 'wholesale' && (
                            <div>
                                <p><strong>Order ID:</strong> {(selectedOrder as WholesaleOrder).wholesale_order_id || 'N/A'}</p>
                                <p><strong>Discount:</strong> {(selectedOrder as WholesaleOrder).discount || 'N/A'}</p>
                                <p><strong>Actual Price:</strong> {(selectedOrder as WholesaleOrder).actual_price || 'N/A'}</p>
                                <p><strong>Total Amount:</strong> {(selectedOrder as WholesaleOrder).total_amount || 'N/A'}</p>
                                <p><strong>Date:</strong> {(selectedOrder as WholesaleOrder).date || 'N/A'}</p>
                                <br/>
                                <h2 className="text-2xl font-bold mb-4 text-blue-500">Shop Details</h2>
                                <p><strong>Shop Name :</strong> {(selectedOrder as WholesaleOrder).shop?.shop_name || 'N/A'}</p>
                                <p><strong>Address :</strong> {(selectedOrder as WholesaleOrder).shop?.address || 'N/A'}</p>
                                <p><strong>Email :</strong> {(selectedOrder as WholesaleOrder).shop?.email || 'N/A'}</p>
                                <p><strong>Contact:</strong> {(selectedOrder as WholesaleOrder).shop?.contact_number || 'N/A'}</p>
                                <p><strong>Owner nic:</strong> {(selectedOrder as WholesaleOrder).shop?.owner_nic || 'N/A'}</p>
                                <p><strong>Credit limit :</strong> {(selectedOrder as WholesaleOrder).shop?.credit_limit || 'N/A'}</p>
                                <p><strong>Outstanding :</strong> {(selectedOrder as WholesaleOrder).shop?.outstanding || 'N/A'}</p>

                                <br/>
                                <h2 className="text-2xl font-bold mb-4 text-green-500">Item Details</h2>
                                <p><strong>Items:</strong> {(selectedOrder as WholesaleOrder).items?.join(', ') || 'N/A'}</p>

                                <br/>
                                <h2 className="text-2xl font-bold mb-4 text-red-500">Phones Details</h2>
                                <ul className="mt-4 space-y-2">
                                    {(selectedOrder as WholesaleOrder).imeis.map((imei, index) => (
                                        <li key={index} className="p-2 border-2 border-black rounded-lg">
                                            <p><strong>IMEI:</strong> {imei.imei || 'N/A'}</p>
                                            <p><strong>Storage:</strong> {imei.storage || 'N/A'}</p>
                                            <p><strong>Colour:</strong> {imei.colour || 'N/A'}</p>
                                            <p><strong>Warranty:</strong> {imei.warranty || 'N/A'}</p>
                                            <p><strong>Battery Health:</strong> {imei.batteryHealth || 'N/A'}</p>
                                            <p><strong>Price:</strong> {imei.price || 'N/A'}</p>
                                            <p><strong>Status:</strong> {imei.status || 'N/A'}</p>
                                            <p><strong>Model Name:</strong> {imei.modelId?.name || 'N/A'}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {visibleTable === 'retail' && (
                            <div>
                                <p><strong>Order ID:</strong> {(selectedOrder as RetailOrder).retail_order_id || 'N/A'}</p>
                                <p><strong>Discount:</strong> {(selectedOrder as RetailOrder).discount || 'N/A'}</p>
                                <p><strong>Actual Price:</strong> {(selectedOrder as RetailOrder).actual_price || 'N/A'}</p>
                                <p><strong>Total Amount:</strong> {(selectedOrder as RetailOrder).total_amount || 'N/A'}</p>
                                <br />
                                <h2 className="text-2xl font-bold mb-4 text-blue-500">Customer Details</h2>
                                <p><strong>Customer Name:</strong> {(selectedOrder as RetailOrder).customer?.name || 'N/A'}</p>
                                <p><strong>Email:</strong> {(selectedOrder as RetailOrder).customer?.email || 'N/A'}</p>
                                <p><strong>Contact:</strong> {(selectedOrder as RetailOrder).customer?.contact_phone || 'N/A'}</p>
                                <p><strong>NIC:</strong> {(selectedOrder as RetailOrder).customer?.nic || 'N/A'}</p>
                                <p><strong>Outstanding Amount:</strong> {(selectedOrder as RetailOrder).customer?.outstandingAmount || 'N/A'}</p>

                                <br />
                                <h2 className="text-2xl font-bold mb-4 text-green-500">Item Details</h2>
                                <p><strong>Items:</strong> {(selectedOrder as RetailOrder).items?.join(', ') || 'N/A'}</p>

                                <br />
                                <h2 className="text-2xl font-bold mb-4 text-red-500">Phones Details</h2>
                                <ul className="mt-4 space-y-2">
                                    {(selectedOrder as RetailOrder).imeis.map((imei, index) => (
                                        <li key={index} className="p-2 border-2 border-black rounded-lg">
                                            <p><strong>IMEI:</strong> {imei.imei || 'N/A'}</p>
                                            <p><strong>Model Name:</strong> {imei.modelId?.name || 'N/A'}</p>
                                            <p><strong>Storage:</strong> {imei.storage || 'N/A'}</p>
                                            <p><strong>Colour:</strong> {imei.colour || 'N/A'}</p>
                                            <p><strong>Warranty:</strong> {imei.warranty || 'N/A'}</p>
                                            <p><strong>Battery Health:</strong> {imei.batteryHealth || 'N/A'}</p>
                                            <p><strong>Price:</strong> {imei.price || 'N/A'}</p>
                                            <p><strong>Status:</strong> {imei.status || 'N/A'}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {visibleTable === 'return' && (
                            <div>
                                <p><strong>Order ID:</strong> {(selectedOrder as ReturnOrder).return_order_id || 'N/A'}</p>
                                <p><strong>Reason:</strong> {(selectedOrder as ReturnOrder).reason || 'N/A'}</p>
                                <p><strong>Price:</strong> {(selectedOrder as ReturnOrder).price || 'N/A'}</p>
                                <p><strong>Date:</strong> {(selectedOrder as ReturnOrder).date || 'N/A'}</p>
                            </div>
                        )}
                    </div>
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
                        onClick={handleCloseModal}
                    >
                        Close
                    </button>
                </div>
            </div>
        )}

        </div>
    );
}    