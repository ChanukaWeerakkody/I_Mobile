import React, { useState } from 'react';
import TopNavbar from '../topNavbar';
import RetailOrder from './reatail-order.tsx';
import WholeSaleOrder from './wholesale-order';
import ReturnOrder from "./return-order.tsx";


export default function Order() {
    const [open, setOpen] = React.useState(false);
    const [openAddItem, setOpenAddItem] = React.useState(false);
    const [openAddPhone, setOpenAddPhone] = React.useState(false);
    const [openAddPhoneWholeSale, setOpenAddPhoneWholeSale] = React.useState(false);
    const [openAddItemWholeSale, setOpenAddItemWholeSale] = React.useState(false);
    const [orderType, setOrderType] = useState<string>("retail");

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleAddPhoneOpenModel = () => setOpenAddPhone(true);
    const handleAddPhoneCloseModel = () => setOpenAddPhone(false);
    const handleAddItemOpenModel = () => setOpenAddItem(true);
    const handleAddItemCloseModel = () => setOpenAddItem(false);
    const handleWholesaleAddPhoneCloseModel = () => setOpenAddPhoneWholeSale(false);
    const handleWholesaleAddPhoneOpenModel = () => setOpenAddPhoneWholeSale(true);
    const handleWholesaleAddItemCloseModel = () => setOpenAddItemWholeSale(false);
    const handleWholesaleAddItemOpenModel = () => setOpenAddItemWholeSale(true);

    return (
        <div className='m-4 w-full'>
            <div className="m-4">
                <TopNavbar />
            </div>

            <div className='mt-4 m-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-10'>
                        <p className='font-bold text-[#5386ED] text-3xl'>#00000253</p>
                        {
                            orderType === "retail" ? (
                                <>
                                    <button onClick={handleOpen} className='border-2 border-[#5386ED] text-white rounded-full py-1 px-3'>Add Customer</button>
                                    <button onClick={handleAddPhoneOpenModel} className='border-2 border-[#5386ED] text-white rounded-full py-1 px-3'>Add Phone</button>
                                    <button onClick={handleAddItemOpenModel} className='border-2 border-[#5386ED] text-white rounded-full py-1 px-3' >Add Item</button>
                                </>
                            ) : (
                                orderType === "wholesale" ? (
                                    <>
                                        <button onClick={handleWholesaleAddPhoneOpenModel} className='border-2 border-[#5386ED] text-white rounded-full py-1 px-3'>Add Phone</button>
                                        <button onClick={handleWholesaleAddItemOpenModel} className='border-2 border-[#5386ED] text-white rounded-full py-1 px-3'>Add Item</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleWholesaleAddPhoneOpenModel} className='border-2 border-[#5386ED] text-white rounded-full py-1 px-3'>Add Phone</button>
                                    </>
                                )
                            )
                        }
                    </div>
                    <div>
                        <select onChange={(e) => setOrderType(e.target.value)} name="choice" className='bg-[#5386ED] text-white font-bold p-2 rounded-md'>
                            <option className='bg-black text-white' value="retail" selected>Retail Order</option>
                            <option className='bg-black text-white' value="wholesale">Wholesale Order</option>
                            <option className='bg-black text-white' value="return">Return Order</option>
                        </select>
                    </div>
                </div>
            </div>
            <div>
                {
                    orderType === "retail" ? (
                        <RetailOrder
                            isAddNewCustomerModelOpen={open}
                            isAddNewItemsModelOpen={openAddItem}
                            isAddNewPhoneModelOpen={openAddPhone}
                            handleAddNewCustomerModelClose={handleClose}
                            handleAddNewItemModelClose={handleAddItemCloseModel}
                            handleAddNewPhoneModelClose={handleAddPhoneCloseModel}
                        />
                    ) : (
                        orderType === "wholesale" ? (
                            <WholeSaleOrder
                                isAddNewPhoneModelOpen={openAddPhoneWholeSale}
                                handleAddNewPhoneModelClose={handleWholesaleAddPhoneCloseModel}
                                isAddNewItemsModelOpen={openAddItemWholeSale}
                                handleAddNewItemModelClose={handleWholesaleAddItemCloseModel}
                            />
                        ) : (
                            orderType === "return" ? (
                                <ReturnOrder
                                    isAddNewPhoneModelOpen={openAddPhoneWholeSale}
                                    handleAddNewPhoneModelClose={handleWholesaleAddPhoneCloseModel}
                                />
                            ) : null
                        )
                    )
                }
            </div>
        </div>
    );
}
