import { useEffect, useState } from 'react';
import TopNavbar from '../topNavbar';
import axios from 'axios';
import { backend_url } from '../../utill/utill';
import Swal from 'sweetalert2';

interface expenccessDetails {
    amount: number,
    reason: string,
    date: string,
    time: string
}

export default function Expencess() {
    const [expenccessDetails, setExpenccessDetails] = useState<expenccessDetails[]>([]);
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState<{ amount?: string, reason?: string }>({});
    const [token, setToken] = useState('');
    
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setToken(token);
        }
    }, []);

    useEffect(() => {
        // Fetch data from the backend
        const fetchData = async () => {
            if (!token) return;
            try {
                const response = await axios.get(`${backend_url}/api/dailyCost`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Assuming response.data.data is an array of records
                const formattedData = response.data.data.map((item: any) => {
                    const dateObj = new Date(item.date);
                    return {
                        ...item,
                        date: dateObj.toISOString().split('T')[0], // Extract date in YYYY-MM-DD format
                        time: dateObj.toTimeString().split(' ')[0] // Extract time in HH:MM:SS format
                    };
                });

                setExpenccessDetails(formattedData);
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to fetch expenses data',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        };

        fetchData();
    }, [token]);

    const validateFields = () => {
        const newErrors: { amount?: string, reason?: string } = {};

        if (!amount || isNaN(Number(amount))) {
            newErrors.amount = '  Please enter a valid number';
        }
        if (!reason.trim()) {
            newErrors.reason = '  Reason is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddExpencessOnClick = async () => {
        if (!validateFields()) {
            return;
        }

        const currentDate = new Date();
        const date = currentDate.toISOString().split('T')[0]; 
        const time = currentDate.toTimeString().split(' ')[0]; 

        const newExpencess = {
            amount: parseFloat(amount),
            reason,
            date,
            time
        };

        try {
            await axios.post(`${backend_url}/api/dailyCost`, newExpencess, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Expense added successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            // Update state to reflect new expense in the table
            setExpenccessDetails([...expenccessDetails, { ...newExpencess }]);
            setAmount('');
            setReason('');
            setErrors({}); // Clear errors after successful submission

        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to add expense',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleDeleteExpencessOnClick = ()=>{
        // Implement the delete logic here
    };

    
   return (
    <div className='m-4'>
        <div>
            <TopNavbar />
        </div>

        {/* inputs */}
        <div className="mt-[3vw] flex gap-5">
            <div className="flex flex-col w-1/3">
                <input
                    type="text"
                    className="p-2 text-white border border-gray-300 rounded bg-[#181738] border-[#5356EC] w-[25vw] h-[7vh] rounded-[15px] opacity-50"
                    placeholder="Amount"
                    value={amount}
                    onChange={(ev) => setAmount(ev.target.value)}
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div className="flex flex-col w-2/3">
                <input
                    type="text"
                    className="p-2 border text-white border-gray-300 rounded bg-[#181738] border-[#5356EC] rounded-[15px] opacity-50"
                    placeholder="Reason"
                    value={reason}
                    onChange={(ev) => setReason(ev.target.value)}
                />
                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
            </div>
        </div>

        {/* add buttons */}
        <div className='mt-[5vh] flex justify-end space-x-10'>
            <button onClick={handleAddExpencessOnClick} className='buttons-styles bg-green-button w-[7vw] h-[5vh] text-center rounded-xl flex justify-center items-center'>
                <img src={'src/assets/icons/Add Btn.svg'} alt='add icon' />ADD</button>
            <button onClick={handleDeleteExpencessOnClick} className='buttons-styles bg-red-button w-[8vw] h-[5vh] text-center rounded-xl flex justify-center items-center'>
                <img src={'src/assets/icons/Delete Btn.svg'} alt='delete icon' />DELETE</button>
        </div>

        {/* table */}
        <div className='mt-5 m-4'>
            <table className='min-w-full divide-y table-styles'>
                <thead>
                    <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Amount</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Reason</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {expenccessDetails.map((detail, index) => (
                        <tr key={index} className='text-white font-semibold hover:bg-gray-50'>
                            <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>{detail.amount}</td>
                            <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>{detail.reason}</td>
                            <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>{detail.date}</td>
                            <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>{detail.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
}