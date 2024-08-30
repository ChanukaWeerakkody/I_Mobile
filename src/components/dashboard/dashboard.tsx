import  { useEffect, useState } from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import TopNavbar from '../topNavbar.tsx';
import axios from "axios";
import html2canvas from "html2canvas";
import {jsPDF} from "jspdf";
import logo from '../../../public/assets/images/logo.png';
import { useNavigate } from 'react-router-dom';

interface StockData {
  [model: string]: number;
}


const data = [
  { name: 'Label 1', value: 36638465.14 },
  { name: 'Label 2', value: 8141881.2 },
  { name: 'Label 3', value: 4070940.6 },
  { name: 'Label 4', value: 12212821.83 },
  { name: 'Label 5', value: 12212821.83 }
];

/*const productData = [
  { name: 'iPhone 13 Pro', popularity: 46, color: '#FFBB28' },
  { name: 'iPhone 12 Pro', popularity: 17, color: '#00C49F' },
  { name: 'iPhone 8+', popularity: 19, color: '#0088FE' },
  { name: 'iPhone X', popularity: 29, color: '#FF8042' }
];*/

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4848'];



/*
const salesData = [
  { month: 'January', sales: 1000 },
  { month: 'February', sales: 2000 },
  { month: 'March', sales: 3000 },
  { month: 'April', sales: 1500 },
  { month: 'May', sales: 2000 },
  { month: 'June', sales: 2500 },
  { month: 'July', sales: 3000 },
  { month: 'August', sales: 3500 },
  { month: 'September', sales: 4000 },
  { month: 'October', sales: 4500 },
  { month: 'November', sales: 5000 },
  { month: 'December', sales: 5500 }
];

const weeklyOrderIncrementData = [
  { day: 'Monday', orders: 10 },
  { day: 'Tuesday', orders: 15 },
  { day: 'Wednesday', orders: 20 },
  { day: 'Thursday', orders: 25 },
  { day: 'Friday', orders: 30 },
  { day: 'Saturday', orders: 35 },
  { day: 'Sunday', orders: 40 }
];*/

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [orders, setOrders] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [stockData, setStockData] = useState<StockData>({});
  const [totalIncomeMonth, setTotalIncomeMonth] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [orderCountWholesale, setOrderCountWholesale] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const retailResponse = await axios.get('http://localhost:8080/api/retailOrder/today');
        const wholesaleResponse = await axios.get('http://localhost:8080/api/retailOrder/wholesale/today');
        const returnResponse = await axios.get('http://localhost:8080/api/retailOrder/return/today');
        const combinedOrders:any = [...retailResponse.data, ...wholesaleResponse.data, ...returnResponse.data];
        setOrders(combinedOrders);
        calculateTotalIncome(combinedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const calculateTotalIncome = (orders:any) => {
    const total = orders.reduce((sum:any, order:any) => sum + order.total_amount, 0);
    setTotalIncome(total);
  };

  const today = new Date().toLocaleDateString();

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleModal1 = () => {
    setIsModalOpen1(!isModalOpen1);
  };

  const saveToPDF = () => {
    const input = document.getElementById('pdf-content');
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        // Add header
        pdf.setFontSize(12);
        pdf.setTextColor(40);
        pdf.addImage(logo, 'PNG', 10, 10, 30, 30);
        pdf.text('I Mobile Crazy', 50, 20);
        pdf.text('Income Report', 50, 30);
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 50, 40);
        pdf.text(`Total Income: ${totalIncome.toFixed(2)}`, 50, 50);

        pdf.addImage(imgData, 'PNG', 0, 60, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 60);

        while (heightLeft >= 0) {
          pdf.addPage();
          pdf.addImage(logo, 'PNG', 10, 10, 30, 30);
          pdf.text('Shop Name', 50, 20);
          pdf.text('Income Report', 50, 30);
          pdf.text(`Date: ${new Date().toLocaleDateString()}`, 50, 40);
          pdf.text(`Total Income: ${totalIncome.toFixed(2)}`, 50, 50);

          position = heightLeft - imgHeight;
          pdf.addImage(imgData, 'PNG', 0, position + 60, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.text(`Total Income: ${totalIncome.toFixed(2)}`, 50, 50);
        pdf.save('income-report.pdf');
      });
    } else {
      console.error('The element with the specified ID was not found.');
    }
  };

  useEffect(() => {
    if (isModalOpen1) {
      const fetchData = async () => {
        try {
          const response = await axios.get('http://localhost:8080/api/imei/count/sale');
          console.log('Fetched stock data:', response.data); // Log the fetched data
          setStockData(response.data);
        } catch (error) {
          console.error('Error fetching stock data:', error);
        }
      };

      fetchData();
    }
  }, [isModalOpen1]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/imei/count/sale');
        console.log('Fetched stock data:', response.data); // Log the fetched data
        setStockData(response.data);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchData();
  }, []);

  const saveToPDFStock = () => {
    const input = document.getElementById('pdf-content');
    if(input){
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        // Add header
        pdf.setFontSize(12);
        pdf.setTextColor(40);
        pdf.text('Stock Report', 14, 20);
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

        pdf.addImage(imgData, 'PNG', 0, 40, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 40);

        while (heightLeft >= 0) {
          pdf.addPage();
          pdf.text('Stock Report', 14, 20);
          pdf.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

          position = heightLeft - imgHeight;
          pdf.addImage(imgData, 'PNG', 0, position + 40, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('stock-report.pdf');
      });
    }
  };
  useEffect(() => {
  const fetchTotalIncome = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/retailOrder/monthly');
        const income = response.data; // Assuming the response is a number
        setTotalIncomeMonth(income);
      } catch (error) {
        console.error('Error fetching total income:', error);
      }
    };

  fetchTotalIncome();
  }, []);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/retailOrder/order/count');
        setOrderCount(Math.floor(response.data)); // Convert the float to an integer
      } catch (error) {
        console.error('Error fetching order count:', error);
      }
    };

    fetchOrderCount();
  }, []);

  useEffect(() => {
    const fetchSoldCount = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/imei/sold-count-this-month');
        setSoldCount(response.data);
      } catch (error) {
        console.error('Error fetching sold count:', error);
      }
    };

    fetchSoldCount();
  }, []);

  useEffect(() => {
    // Function to fetch wholesale order count from API
    const fetchOrderCountWholesale = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/wholesaleOrder/count-this-month');

        // Directly set the state with the response data, assuming it is a plain number
        setOrderCountWholesale(response.data);
      } catch (error) {
        console.error('Error fetching the wholesale order count:', error);
      }
    };

    fetchOrderCountWholesale(); // Call the fetch function on component mount
  }, []);

  const productData = Object.keys(stockData).map(key => ({
    name: key,
    popularity: stockData[key],
    color: stockData[key]
  }));
  const navigation = useNavigate();

const hanldeDailyCostOnClick=()=>{
  navigation('/expencess')
}


  console.log('Product data:', productData);

  return (
    <div className='m-4 w-full'>
      <div className='m-4'>
        <TopNavbar />

        {/* Buttons */}
        <div className='flex flex-wrap justify-around mt-5 gap-5'>
          {/*Income Report*/}
          <div>
            <button className='buttons-styles w-full sm:w-auto' onClick={toggleModal}>
              Income Report
            </button>

            {isModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                  <div className='bg-white p-8 rounded shadow-lg w-full max-w-full max-h-full z-60'>
                    <h2 className='text-xl mb-4'>Income Report</h2>
                    <div id='pdf-content'>
                      <table className='min-w-full bg-white'>
                        <thead>
                        <tr>
                          <th className='py-2 px-4 border'>OrderId</th>
                          <th className='py-2 px-4 border'>Brand</th>
                          <th className='py-2 px-4 border'>Name</th>
                          <th className='py-2 px-4 border'>Customer/Shop Name</th>
                          <th className='py-2 px-4 border'>Date</th>
                          <th className='py-2 px-4 border'>Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order:any) => (
                            <>
                              {/* Display items */}
                              {order.items?.map((item:any) => (
                                  <tr key={`${order.retail_order_id || order.wholesale_order_id || order.return_order_id}-item-${item.item_id}`}>
                                    <td className='py-2 px-4 border'>{order.retail_order_id || order.wholesale_order_id || order.return_order_id}</td>
                                    <td className='py-2 px-4 border'>{item.brand}</td>
                                    <td className='py-2 px-4 border'>{item.name}</td>
                                    <td className='py-2 px-4 border'>{order.customer ? order.customer.name : order.shop.shop_name}</td>
                                    <td className='py-2 px-4 border'>{new Date(order.date).toLocaleDateString()}</td>
                                    <td className='py-2 px-4 border'>{order.total_amount}</td>
                                  </tr>
                              ))}

                              {/* Display imeis */}
                              {order.imeis?.map((imei:any) => (
                                  <tr key={`${order.retail_order_id || order.wholesale_order_id || order.return_order_id}-imei-${imei.id}`}>
                                    <td className='py-2 px-4 border'>{order.retail_order_id || order.wholesale_order_id || order.return_order_id}</td>
                                    <td className='py-2 px-4 border'>{imei.modelId?.name || 'N/A'}</td>
                                    <td className='py-2 px-4 border'>{imei.imei}</td>
                                    <td className='py-2 px-4 border'>{order.customer ? order.customer.name : order.shop.shop_name}</td>
                                    <td className='py-2 px-4 border'>{new Date(order.date).toLocaleDateString()}</td>
                                    <td className='py-2 px-4 border'>{order.total_amount}</td>
                                  </tr>
                              ))}
                            </>
                        ))}
                        </tbody>
                      </table>
                    </div>
                    <div className='mt-4'>
                      <h3 className='text-lg font-semibold'>Total Income of {today}</h3>
                      <p className='text-xl'>{totalIncome.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button className="buttons-styles bg-danger text-white rounded px-4 py-2" onClick={toggleModal}>
                        Close
                      </button>
                      <button className="buttons-styles bg-primary text-white rounded px-4 py-2 ml-4" onClick={saveToPDF}>
                        Save as PDF
                      </button>
                    </div>


                  </div>
                </div>
            )}
          </div>

          {/*Stock Report*/}
          <div>
            <button className='buttons-styles w-full sm:w-auto' onClick={toggleModal1}>
              Stock Report
            </button>

            {isModalOpen1 && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                  <div className='bg-white p-8 rounded shadow-lg w-full max-w-md z-60'>
                    <h2 className='text-xl mb-4'>Stock Report</h2>
                    <div id='pdf-content'>
                      <table className='w-full border-collapse'>
                        <thead>
                        <tr className='bg-gray-200'>
                          <th className='border px-4 py-2 text-left'>Model Name</th>
                          <th className='border px-4 py-2 text-left'>Count</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.entries(stockData).map(([model, count]) => (
                            <tr key={model}>
                              <td className='border px-4 py-2'>{model}</td>
                              <td className='border px-4 py-2'>{count}</td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                    <div className='flex justify-end mt-4'>
                      <button
                          className='bg-red-500 text-white py-2 px-4 rounded'
                          onClick={toggleModal1}
                      >
                        Close
                      </button>
                      <button
                          className='bg-blue-500 text-white py-2 px-4 rounded mr-2'
                          onClick={saveToPDFStock}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
            )}
          </div>



          <button className='daily_cost-buttons-styles p-1 rounded-xl w-full sm:w-auto flex items-center' onClick={hanldeDailyCostOnClick}>
            Daily Cost<img src={'src/assets/icons/daily cost.svg'} className='ml-2' alt='icon' />
          </button>
        </div>

         {/* 1st row */}
      <div className='flex justify-between mt-5'>
        <div className='background-colour-today-sales-div p-3 rounded-lg flex-1 mr-4'>
          <div className='ml-2 mt-1'>
            <span className='text-white text-lg font-bold'>Today's Sales</span><br/>
            <span className='text-xs text-gray-400'>Sales Summary</span>
          </div>
          <div className='flex justify-between w-full text-white mt-2'>

            <div className='custom-div w-[12vw] bg-gray-800 p-4 rounded-lg text-center'>
              <div className='mb-2'>
                <img src={'src/assets/icons/Icon 1.svg'} alt='icon' className='mx-auto' />
              </div>
              <div className='text-2xl'>{totalIncomeMonth}</div>
              <div className='text-sm'>Total Sales</div>
              <div className='text-xs text-yellow-500'>This month</div>
            </div>


            <div className='custom-div w-[12vw] bg-gray-800 p-4 rounded-lg text-center'>
              <div className='mb-2'>
                <img src={'src/assets/icons/Icon 2.svg'} alt='icon' className='mx-auto' />
              </div>
              <div className='text-2xl'>{orderCount}</div>
              <div className='text-sm'>Retail Orders</div>
              <div className='text-xs text-green-500'>This month</div>
            </div>



            <div className='custom-div w-[12vw] bg-gray-800 p-4 rounded-lg text-center'>
              <div className='mb-2'>
                <img src={'src/assets/icons/Icon 3.svg'} alt='icon' className='mx-auto' />
              </div>
              <div className='text-2xl'>{orderCountWholesale}</div> {/* Display the number */}
              <div className='text-sm'>Wholesale Orders</div>
              <div className='text-xs text-purple-500'>This month</div>
            </div>

            <div className='custom-div w-[12vw] bg-gray-800 p-4 rounded-lg text-center'>
              <div className='mb-2'>
                <img src={'src/assets/icons/Icon 4.svg'} alt='icon' className='w-fit mx-auto' />
              </div>
              <div className='text-2xl'>{soldCount}</div>
              <div className='text-sm'>Retail Phone Sold</div>
              <div className='text-xs text-blue-500'>This month</div>
            </div>

          </div>
        </div>



          {/* 1st Row Right Side Chart */}
          <div className="background-colour-today-sales-div text-white flex-1 p-3 rounded-lg">
            <div className="ml-2 mt-1">
              <span className="text-white text-lg font-bold">Total Earning</span><br />
            </div>
            <div className="flex justify-center items-center h-full">
              <div className="h-[30vh] w-full ">
                <Gauge className='text-white'
                  value={75}
                  startAngle={-110}
                  endAngle={110}
                  sx={{
                    [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 40,
                      fontWeight: 'bold',
                      fill: 'red',
                      transform: 'translate(0px, 0px)',
                    },
                  }}
                  text={({ value, valueMax }) => `${value} / ${valueMax}`}
                />
              </div>
            </div>
          </div>
        </div>


        {/* Second Row */}
        <div className='flex flex-col lg:flex-row lg:justify-between mt-5 gap-4'>
          <div className='background-colour-today-sales-div p-3 rounded-lg flex-1'>
            <div className='ml-2 mt-1'>
              <span className='text-white text-lg font-bold'>Top Products</span><br />
            </div>
            <div className='flex justify-center'>
              {productData.length > 0 ? (
                  <BarChart
                      width={600}
                      height={300}
                      data={productData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="popularity" fill="#8884d8">
                      {productData.map((entry:any, index:number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
              ) : (
                  <p>No data available</p>
              )}
            </div>
          </div>






          {/* Pie Chart */}
          <div className="background-colour-today-sales-div text-white flex-1 p-3 rounded-lg">
            <div className="ml-2 mt-1">
              <span className="text-white text-lg font-bold">Income</span><br />
            </div>
            <div className="flex justify-center items-center h-full">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                    ))}


                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3rd Row */}
        {/*<div className='flex flex-col lg:flex-row mt-2 gap-4'>
           3rd Row 1st Div
          <div className='background-colour-today-sales-div flex-1 rounded-lg p-1'>
            <div className="ml-2 p-3">
              <span className="text-white text-lg font-bold">Sales Increment</span><br />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

           3rd Row 2nd Div
          <div className='background-colour-today-sales-div flex-1 rounded-lg'>
            <div className="ml-2 p-3">
              <span className="text-white text-lg font-bold">Weekly Order Increment</span><br />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyOrderIncrementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>*/}
      </div>
    </div>
  );
}
