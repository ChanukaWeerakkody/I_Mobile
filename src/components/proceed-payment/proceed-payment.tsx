import React,{useEffect, useRef, useState} from 'react';
import TopNavbar from '../topNavbar';
import {useLocation, useParams} from 'react-router-dom';
import axios from "axios";
import {backend_url} from "../../utill/utill.ts";
import Swal from "sweetalert2";
import {jsPDF} from "jspdf";
import logo from "../../../public/assets/images/logo2.jpg"

export interface WholesalePhone {
  id: string;
  imei: string;
  modelName: string;
  storage: string;
  colour: string;
  ios_version: string;
  battery_health: string;
  price: number;
  status: string;
  warranty: string;
  isDeleted: boolean;
}

export interface WholesaleItem {
  item_id: string;
  category: string;
  brand: string;
  name: string;
  colour: string;
  warranty_period: string;
  qty: number;
  price: number;
}

export interface ProceedPaymentProps {
  wholesalePhones: WholesalePhone[];
  wholesaleItems: WholesaleItem[];
  shopName: string;
  shopContactNumber: string;
  shopId: string;
  outstanding: number;
  address: string;
  shopEmail: string;
  shopOwnerNic: string;
  shopCreditLimit: number;
}

interface Item {
  item_id: number;
  category: string;
  brand: string;
  name: string;
  colour: string;
  warranty_period: string;
  qty: number;
  price: number;
}

interface Phone {
  id: number;
  modelName: string;
  imei: string;
  storage: string;
  colour: string;
  ios_version: string;
  battery_health: string;
  price: number;
  warranty: string;
}

interface ReturnPhone {
  id: string;
  modelName: string;
  imei: string;
  storage: string;
  colour: string;
  price: number;
  warranty: string;
}


const ProceedPayment: React.FC<any> = (props:any) => {
  console.log(props)
  const { orderType } = useParams<{ orderType: string }>();
  const [orderId, setOrderId] = useState<string>('');
  const location = useLocation() as unknown as { state: ProceedPaymentProps };
  const { wholesalePhones, wholesaleItems, shopName, shopId, shopContactNumber, outstanding, address, shopEmail, shopOwnerNic, shopCreditLimit }:any = location.state || { wholesalePhones: [], wholesaleItems: [], shopName: '', shopContactNumber: '', shopId: '', outstanding: 0, address: '', shopEmail: '', shopOwnerNic: '', shopCreditLimit: 0 };

  const { phones, items , customerName, contactNumber, customerId ,customerOutstanding}:any = location.state || { phones: [], items: [], customerName: '', contactNumber: '' ,customerId: '',customerOutstanding: ''};

  const {returnPhones,shopNameReturn,shopIdReturn,shopContactNumberReturn,outstandingReturn}:any = location.state || { returnPhones: [], shopNameReturn: '',shopIdReturn: '',shopContactNumberReturn: '',outstandingReturn: ''};

  function generateRetailOrderId() {
    // Retrieve the current sequence number from local storage
    let sequenceNumber = parseInt(localStorage.getItem('sequenceNumber') || '1', 10);

    // Format the sequence number with leading zeros (e.g., 001, 002, ...)
    const formattedNumber = sequenceNumber.toString().padStart(3, '0');

    // Increment the sequence number for the next call
    sequenceNumber++;

    // Store the updated sequence number in local storage
    localStorage.setItem('sequenceNumber', sequenceNumber.toString());

    // Generate the retail_order_id in the desired format
    return `B00-${formattedNumber}`;
  }


  useEffect(() => {
    // Generate and set the order ID when the component mounts
    const id = generateRetailOrderId();
    setOrderId(id);
  }, []);

  switch (orderType) {
    case "retail-order":
        const discountRef = useRef(null);
        const [discount, setDiscount] = useState(0);
        const [subtotal, setSubtotal] = useState(0);
        const [totalAfterDiscount,setTotalAfterDiscount] = useState(0);
        const [balance, setBalance] = useState(0);
        const [customerAmount, setCustomerAmount] = useState(0);

        useEffect(() => {
          calculateTotals(discount, customerAmount);
        }, [discount, customerAmount, phones, items, customerOutstanding]);

        const handleDiscountChange = (e:any) => {
          const value = parseFloat(e.target.value) || 0;
          setDiscount(value);
        };

        /*const handleCustomerAmountChange = (e) => {
          const value = parseFloat(e.target.value) || 0;
          setCustomerAmount(value);
        };*/

        const calculateTotals = (discountValue:number, customerAmountValue:number) => {
          const totalPhonePrice = phones.reduce((sum:any, phone:any) => sum + (parseFloat(phone.price) || 0), 0);
          const totalItemPrice = items.reduce((sum: number, item: Item) => sum + (item.price * item.qty), 0);
          const subtotalValue = totalPhonePrice + totalItemPrice - customerOutstanding;
          const totalAfterDiscountValue = subtotalValue - discountValue;
          const balanceValue = customerAmountValue - totalAfterDiscountValue;

          setSubtotal(subtotalValue);
          setTotalAfterDiscount(totalAfterDiscountValue);
          setBalance(balanceValue);

          return {
            subtotal: subtotalValue,
            totalAfterDiscount: totalAfterDiscountValue,
          };
        };



// Function to generate the retail_order_id

        const saveOrder = async () => {

          console.log(`Saving order with discount`);
          const { subtotal } = calculateTotals(discount, customerAmount);

          console.log("SubTotal : "+subtotal+"  Discount : "+discount+"  Customer Amount : "+customerAmount+"  Total After Discount : "+(subtotal-discount));
          const order = {
            retail_order_id: generateRetailOrderId(),
            shop_id: shopId,
            discount: discount,
            actual_price: subtotal,
            total_amount: (subtotal-discount),
            date: new Date().toISOString(), // Or any date you want to set
            is_deleted: false,
            customer: {
              customer_id: customerId,
              name: customerName,
              contact_phone: contactNumber,
              outstanding_balance: customerOutstanding
            },
            items: items.map((item: Item) => ({
              item_id: item.item_id,
              category: item.category,
              brand: item.brand,
              name: item.name,
              colour: item.colour,
              warranty_period: item.warranty_period,
              qty: item.qty,
              price: item.price,
            })),
            imeis: phones.map((phone: Phone) => ({
              id: phone.id, // This needs to be included if you're tracking phones by id
              model: phone.modelName,
              imei: phone.imei,
              storage: phone.storage,
              colour: phone.colour,
              ios_version: phone.ios_version,
              battery_health: phone.battery_health,
              price: phone.price,
              warranty: phone.warranty,
            })),
          };

          try {
            const response = await axios.post(`${backend_url}/api/retailOrder`, order);
            // Create a new jsPDF instance for generating the invoice
            const doc = new jsPDF();

            const img = new Image();
            img.src = logo; // Path to your uploaded image

            img.onload = function() {
              // Constants for layout
              const topMargin = 20;
              const sectionMargin = 10;
              const rowHeight = 10;
              const pageWidth = 210; // A4 page width in mm
              const pageHeight = 297; // A4 page height in mm
              const leftMargin = 10;
              const leftInsideMargin = 20;
              const rightMargin = 140;

              // Add watermark image with shading effect first
              const imgWidth = 80; // Adjust the width as necessary
              const imgHeight = imgWidth * (img.height / img.width);
              const imgX = (pageWidth - imgWidth) / 2;
              const imgY = (pageHeight - imgHeight) / 2;

              // Set grey color for the watermark with some transparency
              const greyShade = 200; // Choose a value between 0 (black) and 255 (white)
              doc.setFillColor(greyShade, greyShade, greyShade, 20); // Add a shadow color with 20% opacity

              // Add the watermark image
              doc.addImage(img, 'PNG', imgX, imgY, imgWidth, imgHeight, '', 'NONE');

              // Draw page border on top of the watermark
              doc.setDrawColor(0, 0, 0);
              doc.rect(leftMargin, topMargin, pageWidth - 2 * leftMargin, pageHeight - 2 * topMargin);

              // Header
              doc.setFontSize(18);
              doc.setTextColor(0, 0, 255);
              doc.text('INVOICE', pageWidth / 2, topMargin + 10, { align: 'center' });

              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text('I MOBILE CRAZY', pageWidth / 2, topMargin + 20, { align: 'center' });
              doc.text('Galekade junction, Halthota road,', pageWidth / 2, topMargin + 25, { align: 'center' });
              doc.text('Raigama,Bandaragama', pageWidth / 2, topMargin + 30, { align: 'center' });
              doc.text('Phone: 076 311 0859', pageWidth / 2, topMargin + 35, { align: 'center' });
              doc.text('Email: imobilecrazybandaragama@gmail.com', pageWidth / 2, topMargin + 40, { align: 'center' });

              // Customer and Invoice Details
              const customerY = topMargin + 60;
              doc.setFontSize(12);
              doc.text('BILL TO:', leftInsideMargin, customerY);
              doc.text(order.customer.name, leftInsideMargin, customerY + 5);
              doc.text(order.customer.contact_phone, leftInsideMargin, customerY + 10);

              doc.text(`Invoice Number: ${order.retail_order_id}`, rightMargin, customerY);
              doc.text(`Invoice Date: ${new Date(order.date).toLocaleDateString()}`, rightMargin, customerY + 5);
              doc.text(`Payment Due: ${new Date(order.date).toLocaleDateString()}`, rightMargin, customerY + 10);

              /*// Table headers for items
              const tableHeaderY = customerY + 30;
              const headers = ['Items', 'Quantity', 'Price', 'Amount'];
              const headerStartX = [leftInsideMargin, leftMargin + 80, leftMargin + 120, leftMargin + 150];

              doc.setFillColor(128, 128, 128);
              doc.setTextColor(255, 255, 255); // White text color
              doc.rect(leftMargin, tableHeaderY - rowHeight, pageWidth - 2 * leftMargin, rowHeight, 'F');

              doc.setFontSize(12);
              headers.forEach((header, index) => {
                const x = headerStartX[index] + 2;
                const y = tableHeaderY - (rowHeight / 2) + 4;
                doc.text(header, x, y, { align: 'left' });
              });

              // Reset text color for table content
              doc.setTextColor(0, 0, 0);

              // Start Y for items
              let startY = tableHeaderY + rowHeight;

              // Include item data if available
              if (order.items.length > 0) {
                order.items.forEach((item:any, index:number) => {
                  doc.text(`${item.name} - ${item.warranty_period} WARRANTY`, leftInsideMargin, startY + index * 10);
                  doc.text(`${item.qty}`, leftMargin + 80, startY + index * 10);
                  doc.text(`${item.price.toFixed(2)}`, leftMargin + 120, startY + index * 10);
                  doc.text(`${(item.qty * item.price).toFixed(2)}`, leftMargin + 150, startY + index * 10);
                });

                // Draw items border
                doc.rect(leftMargin, tableHeaderY, pageWidth - 2 * leftMargin, startY - tableHeaderY + order.items.length * 10);

                // Update Y for IMEIs
                startY = startY + order.items.length * 10 + sectionMargin;
              }

              // Table headers for IMEI
              const imeiTableHeaderY = startY;
              const imeiHeaders = ['Model', 'IMEI', 'Warranty', 'Price'];
              const imeiHeaderStartX = [leftInsideMargin, leftMargin + 60, leftMargin + 110, leftMargin + 150];

              doc.setFillColor(128, 128, 128);
              doc.setTextColor(255, 255, 255); // White text color
              doc.rect(leftMargin, imeiTableHeaderY - rowHeight, pageWidth - 2 * leftMargin, rowHeight, 'F');

              doc.setFontSize(12);
              imeiHeaders.forEach((header, index) => {
                const x = imeiHeaderStartX[index] + 2;
                const y = imeiTableHeaderY - (rowHeight / 2) + 4;
                doc.text(header, x, y, { align: 'left' });
              });

              // Reset text color for table content
              doc.setTextColor(0, 0, 0);

              // Start Y for IMEI data
              let imeiStartY = imeiTableHeaderY + rowHeight;

              // Include IMEI data if available
              if (order.imeis.length > 0) {
                order.imeis.forEach((imei:any, index:number) => {
                  doc.text(`${imei.model}`, leftInsideMargin, imeiStartY + index * 10);
                  doc.text(`${imei.imei}`, leftMargin + 60, imeiStartY + index * 10);
                  doc.text(`${imei.warranty}`, leftMargin + 110, imeiStartY + index * 10);
                  doc.text(`${imei.price}`, leftMargin + 150, imeiStartY + index * 10);
                });

                // Draw IMEI border
                doc.rect(leftMargin, imeiTableHeaderY, pageWidth - 2 * leftMargin, imeiStartY - imeiTableHeaderY + order.imeis.length * 10);

                // Update Y for next section or footer
                imeiStartY = imeiStartY + order.imeis.length * 10 + sectionMargin;
              }
*/

              // Initialize Y positions
              let startY = customerY + 30; // Starting Y for tables

// Check if there are items to display
              if (order.items.length > 0) {
                // Table headers for items
                const headers = ['Items', 'Quantity', 'Price', 'Amount'];
                const headerStartX = [leftInsideMargin, leftMargin + 80, leftMargin + 120, leftMargin + 150];

                doc.setFillColor(128, 128, 128);
                doc.setTextColor(255, 255, 255); // White text color
                doc.rect(leftMargin, startY - rowHeight, pageWidth - 2 * leftMargin, rowHeight, 'F');

                doc.setFontSize(12);
                headers.forEach((header, index) => {
                  const x = headerStartX[index] + 2;
                  const y = startY - (rowHeight / 2) + 4;
                  doc.text(header, x, y, { align: 'left' });
                });

                // Reset text color for table content
                doc.setTextColor(0, 0, 0);

                // Start Y for items
                let itemsStartY = startY + rowHeight;

                // Include item data
                order.items.forEach((item: any, index: number) => {
                  doc.text(`${item.name} - ${item.warranty_period} WARRANTY`, leftInsideMargin, itemsStartY + index * 10);
                  doc.text(`${item.qty}`, leftMargin + 80, itemsStartY + index * 10);
                  doc.text(`${item.price.toFixed(2)}`, leftMargin + 120, itemsStartY + index * 10);
                  doc.text(`${(item.qty * item.price).toFixed(2)}`, leftMargin + 150, itemsStartY + index * 10);
                });

                // Draw items border
                doc.rect(leftMargin, startY, pageWidth - 2 * leftMargin, itemsStartY - startY + order.items.length * 10);

                // Update Y for IMEIs
                startY = itemsStartY + order.items.length * 10 + sectionMargin;
              }

// Check if there are IMEIs to display
              if (order.imeis.length > 0) {
                // Table headers for IMEI
                const imeiHeaders = ['Model', 'IMEI', 'Warranty', 'Price'];
                const imeiHeaderStartX = [leftInsideMargin, leftMargin + 60, leftMargin + 110, leftMargin + 150];

                doc.setFillColor(128, 128, 128);
                doc.setTextColor(255, 255, 255); // White text color
                doc.rect(leftMargin, startY - rowHeight, pageWidth - 2 * leftMargin, rowHeight, 'F');

                doc.setFontSize(12);
                imeiHeaders.forEach((header, index) => {
                  const x = imeiHeaderStartX[index] + 2;
                  const y = startY - (rowHeight / 2) + 4;
                  doc.text(header, x, y, { align: 'left' });
                });

                // Reset text color for table content
                doc.setTextColor(0, 0, 0);

                // Start Y for IMEI data
                let imeiStartY = startY + rowHeight;

                // Include IMEI data
                order.imeis.forEach((imei: any, index: number) => {
                  doc.text(`${imei.model}`, leftInsideMargin, imeiStartY + index * 10);
                  doc.text(`${imei.imei}`, leftMargin + 60, imeiStartY + index * 10);
                  doc.text(`${imei.warranty}`, leftMargin + 110, imeiStartY + index * 10);
                  doc.text(`${imei.price}`, leftMargin + 150, imeiStartY + index * 10);
                });

                // Draw IMEI border
                doc.rect(leftMargin, startY, pageWidth - 2 * leftMargin, imeiStartY - startY + order.imeis.length * 10);

                // Update Y for next section or footer
                startY = imeiStartY + order.imeis.length * 10 + sectionMargin;
              }

              // Summary
              doc.setFontSize(12);
              doc.text(`Actual Price: ${order.actual_price.toFixed(2)}`, leftMargin, startY);
              doc.text(`Discount: ${order.discount.toFixed(2)}`, leftMargin, startY + 10);
              doc.text(`Total Amount: ${order.total_amount.toFixed(2)}`, leftMargin, startY + 20);

              const notesY = startY + 70;
              doc.text('Warranty terms & conditions!', leftInsideMargin, notesY);
              doc.setFontSize(10);
              doc.text('* One year software warranty.', leftInsideMargin, notesY + 15);
              doc.text('* Warranty void if stickers damaged or removed.', leftInsideMargin, notesY + 20);
              doc.text('* Item should be in good condition', leftInsideMargin, notesY + 25);
              doc.text('* Bill must be presented , No cash returns', leftInsideMargin, notesY + 30);
              doc.text('* No warranty for water damage and over charged', leftInsideMargin, notesY + 35);

              // Footer
              const footerY = notesY + 40;
              const centerX = doc.internal.pageSize.width / 2; // Center of the page

              // Function to get the width of the text
              function getTextWidth(text: string) {
                return doc.getStringUnitWidth(text) * doc.internal.scaleFactor;
              }

              // Calculate text width and adjust x position for centering
              const thankYouText = 'Thank you for shopping with us! Let\'s visit us again';
              const poweredByText = 'Powered by Arimax Solutions';

              const thankYouTextWidth = getTextWidth(thankYouText);
              const poweredByTextWidth = getTextWidth(poweredByText);

              const thankYouTextX = centerX - (thankYouTextWidth / 2);
              const poweredByTextX = centerX - (poweredByTextWidth / 2);

              doc.text(thankYouText, thankYouTextX, footerY);
              doc.text(poweredByText, poweredByTextX, footerY + 5);

              // Save the PDF
              doc.save(`${order.customer.name}.bill.pdf`);
            };



            await Swal.fire({
              title: 'Success!',
              text: 'Order saved successfully',
              icon: 'success',
              confirmButtonText: 'OK'
            });

            // Update the UI after successful save
            console.log('Order saved successfully:', response.data);
          } catch (error) {
            // SweetAlert error message
            await Swal.fire({
              title: 'Error!',
              text: 'Error saving order',
              icon: 'error',
              confirmButtonText: 'OK'
            });

            console.error('Error saving order:', error);
          }
        };


        return <div className='m-4 w-full'>
          <div className="m-4">
            <TopNavbar />
          </div>
          <div className='bg-[#14141E] rounded-md p-3 text-white'>
            <div className='flex justify-between'>
              <div>
                <button className='mr-4'>Cash Payment</button>
                <button>Card Payment</button>
              </div>
              <div>
                <p className='text-3xl text-[#5386ED] mr-10'>{orderId}</p>
              </div>
            </div>
            <hr className='my-3' />
            <div className='flex'>
              <div className='flex-1 p-4'>
                <table className='w-full '>
                  <thead>
                  <tr>
                    <th className="font-bold px-6 py-2 ">Customer</th>
                    <th className="font-bold px-6 py-2 ">Contact Number</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td className="px-6 py-2 ">{customerName}</td>
                    <td className="px-6 py-2 ">{contactNumber}</td>
                  </tr>
                  </tbody>
                </table>

                <div className="space-y-4">
                  <table className="w-full border-collapse">
                    <thead>
                    <tr>
                      <th className="font-bold px-6 py-4 text-left">Model Name</th>
                      <th className="font-bold px-6 py-4 text-left">Imei Number</th>
                      <th className="font-bold px-6 py-4 text-left">Price</th>
                    </tr>
                    </thead>
                    <tbody>
                    {phones.map((phone:any, index:number) => (
                        <tr key={index}>
                          <td className="px-6 py-2">{phone.modelName}</td>
                          <td className="px-6 py-2">{phone.imei}</td>
                          <td className="px-6 py-2">{phone.price}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>

                  <hr className='my-3' />

                  <table className="w-full border-collapse">
                    <thead>
                    <tr>
                      <th className="font-bold px-6 py-4 text-left">Item Name</th>
                      <th className="font-bold px-6 py-4 text-left">Quantity</th>
                      <th className="font-bold px-6 py-4 text-left">Price</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((item:any, index:number) => (
                        <tr key={index}>
                          <td className="px-6 py-2">{item.name}</td>
                          <td className="px-6 py-2">{item.qty}</td>
                          <td className="px-6 py-2">{item.price}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>

              </div>

              <div>
                <div className='h-full w-1 bg-[#717171] mx-5'></div>
              </div>
              <div className='flex-1'>
                <table className='w-full'>
                  <thead>
                  <tr>
                    <th className='text-[#5386ED] text-xl py-2 px-4'>Make Payment</th>
                    <th className='py-2 px-4'></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td className='py-2 px-4'>
                      <div className='mt-2'>
                        <p>Subtotal</p>
                      </div>
                    </td>
                    <td className='py-2 px-4'>
                      <div className='mt-1'>
                        <p>{subtotal.toFixed(2)}</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className='py-2 px-4'>
                      <div className='mt-2'>
                        <p className='text-red-500'>OutStanding</p>
                      </div>
                    </td>
                    <td className='py-2 px-4'>
                      <div className='mt-1'>
                        <p className='text-red-500'>{customerOutstanding.toFixed(2)}</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className='py-2 px-4'>
                      <div className='mt-2'>
                        <p>Discount</p>
                      </div>
                    </td>
                    <td className='py-2 px-4'>
                      <div className='mt-1'>
                        <input
                            type='number'
                            ref={discountRef}
                            onChange={handleDiscountChange}
                            className='bg-[#1E1E1E] text-white px-2 py-1 rounded-md'
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className='py-2 px-4'>
                      <div className='mt-2'>
                        <p>Total Amount</p>
                      </div>
                    </td>
                    <td className='py-2 px-4'>
                      <div className='mt-1'>
                        <p>{totalAfterDiscount.toFixed(2)}</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className='py-2 px-4'>
                      <div className='mt-2'>
                        <p>Customer Amount</p>
                      </div>
                    </td>
                    <td className='py-2 px-4'>
                      <div className='mt-1'>
                        <input
                            type='number'
                            value={customerAmount}
                            onChange={(e) => setCustomerAmount(parseFloat(e.target.value) || 0)}
                            className='bg-[#1E1E1E] text-white px-2 py-1 rounded-md'
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className='py-2 px-4'>
                      <div className='mt-2'>
                        <p>Balance</p>
                      </div>
                    </td>
                    <td className='py-2 px-4'>
                      <div className='mt-1'>
                        <p>{balance.toFixed(2)}</p>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>

                <div className='flex flex-col gap-2 mt-3'>
                  <button
                      className='bg-[#5356EC] p-2'
                      onClick={saveOrder}
                  >
                    Confirm Payment
                  </button>
                  <button className='border-2 border-[#5356EC] p-2 bg-[#343434]'>
                    Cancel Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
            ;

    case "wholesale-order":
      const discountRefWholesale = useRef<HTMLInputElement>(null);
      const [discountWholesale, setDiscountWholesale] = useState<number>(0);
      const [subtotalWholesale, setSubtotalWholesale] = useState<number>(0);
      const [totalAfterDiscountWholesale, setTotalAfterDiscountWholesale] = useState<number>(0);
      const [balanceWholesale, setBalanceWholesale] = useState<number>(0);
      const [customerAmountWholesale, setCustomerAmountWholesale] = useState<number>(0);

      useEffect(() => {
        calculateTotalsWholesale(discountWholesale, customerAmountWholesale);
      }, [discountWholesale, customerAmountWholesale, wholesalePhones, wholesaleItems, outstanding]);

      const handleDiscountChangeWholesale = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setDiscountWholesale(value);
      };

      const calculateTotalsWholesale = (discountValueWholesale: number, customerAmountValueWholesale: number) => {
        const totalPhonePriceWholesale = parseFloat(
            wholesalePhones.reduce((sum: number, wholesalePhone: any) => sum + parseFloat(wholesalePhone.price || 0), 0).toFixed(2)
        );

        const totalItemPriceWholesale = parseFloat(
            wholesaleItems.reduce((sum: number, wholesaleItem: any) =>
                sum + ((parseFloat(wholesaleItem.price) || 0) * (parseFloat(wholesaleItem.qty) || 0)), 0).toFixed(2)
        );


        const subtotalValueWholesale = parseFloat(
            (totalPhonePriceWholesale + totalItemPriceWholesale - parseFloat(outstanding || 0)).toFixed(2)
        );
        console.log("Subtotal 1: " + subtotalValueWholesale);


        const totalAfterDiscountValueWholesale = parseFloat(
            (subtotalValueWholesale - discountValueWholesale).toFixed(2)
        );

        const balanceValueWholesale = parseFloat(
            (customerAmountValueWholesale - totalAfterDiscountValueWholesale).toFixed(2)
        );

        setSubtotalWholesale(subtotalValueWholesale);
        setTotalAfterDiscountWholesale(totalAfterDiscountValueWholesale);
        setBalanceWholesale(balanceValueWholesale);

        console.log("Total phones: " + totalPhonePriceWholesale);
        console.log("Total items: " + totalItemPriceWholesale);
        console.log("Subtotal 2 : " + subtotalValueWholesale);

        return {
          subtotalWholesale: subtotalValueWholesale,
          totalAfterDiscountWholesale: totalAfterDiscountValueWholesale,
        };
      };

      const saveOrderWholesale = async () => {
        console.log("Saving order...");
        const { subtotalWholesale, totalAfterDiscountWholesale } = calculateTotalsWholesale(discountWholesale, customerAmountWholesale);

        const wholesaleOrder = {
          wholesale_order_id: generateRetailOrderId(),
          discount: discountWholesale,
          actual_price: subtotalWholesale,
          total_amount: totalAfterDiscountWholesale,
          date: new Date().toISOString(),
          is_deleted: false,
          shop: {
            shop_id: shopId,
            shop_name: shopName,
            address: address,
            email: shopEmail,
            contact_number: shopContactNumber,
            outstanding_balance: outstanding,
            owner_nic: shopOwnerNic,
            credit_limit: shopCreditLimit
          },
          items: wholesaleItems.map((wholesaleItem: WholesaleItem) => ({
            item_id: wholesaleItem.item_id,
            category: wholesaleItem.category,
            brand: wholesaleItem.brand,
            name: wholesaleItem.name,
            colour: wholesaleItem.colour,
            warranty_period: wholesaleItem.warranty_period,
            qty: wholesaleItem.qty,
            price: wholesaleItem.price
          })),
          imeis: wholesalePhones.map((wholesalePhone: WholesalePhone) => ({
            id: wholesalePhone.id,
            imei: wholesalePhone.imei,
            model: wholesalePhone.modelName,
            storage: wholesalePhone.storage,
            colour: wholesalePhone.colour,
            ios_version: wholesalePhone.ios_version,
            battery_health: wholesalePhone.battery_health,
            price: wholesalePhone.price,
            status: wholesalePhone.status,
            warranty: wholesalePhone.warranty,
            isDeleted: wholesalePhone.isDeleted
          }))

        };

        try {
          const response = await axios.post(`${backend_url}/api/wholesaleOrder`, wholesaleOrder);
          const doc = new jsPDF();

          const img = new Image();
          img.src = logo; // Path to your uploaded image

          img.onload = () => {
            // Constants for layout
            const topMargin = 20;
            const sectionMargin = 10;
            const rowHeight = 10;
            const pageWidth = 210; // A4 page width in mm
            const pageHeight = 297; // A4 page height in mm
            const leftMargin = 10;
            const leftInsideMargin = 20;
            const rightMargin = 140;

            // Add watermark image with shading effect first
            const imgWidth = 80; // Adjust the width as necessary
            const imgHeight = imgWidth * (img.height / img.width);
            const imgX = (pageWidth - imgWidth) / 2;
            const imgY = (pageHeight - imgHeight) / 2;

            // Set grey color for the watermark with some transparency
            const greyShade = 200; // Choose a value between 0 (black) and 255 (white)
            doc.setFillColor(greyShade, greyShade, greyShade, 20); // Add a shadow color with 20% opacity

            // Add the watermark image
            doc.addImage(img, 'PNG', imgX, imgY, imgWidth, imgHeight, '', 'NONE');

            // Draw page border on top of the watermark
            doc.setDrawColor(0, 0, 0);
            doc.rect(leftMargin, topMargin, pageWidth - 2 * leftMargin, pageHeight - 2 * topMargin);

            // Header
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 255);
            doc.text('INVOICE', pageWidth / 2, topMargin + 10, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('I MOBILE CRAZY', pageWidth / 2, topMargin + 20, { align: 'center' });
            doc.text('Galekade junction, Halthota road,', pageWidth / 2, topMargin + 25, { align: 'center' });
            doc.text('Raigama,Bandaragama', pageWidth / 2, topMargin + 30, { align: 'center' });
            doc.text('Phone: 076 311 0859', pageWidth / 2, topMargin + 35, { align: 'center' });
            doc.text('Email: imobilecrazybandaragama@gmail.com', pageWidth / 2, topMargin + 40, { align: 'center' });

            // Customer and Invoice Details
            const customerY = topMargin + 60;
            doc.setFontSize(12);
            doc.text('BILL TO:', leftInsideMargin, customerY);
            doc.text(wholesaleOrder.shop.shop_name, leftInsideMargin, customerY + 5);
            doc.text(wholesaleOrder.shop.contact_number, leftInsideMargin, customerY + 10);

            doc.text(`Invoice Number: ${wholesaleOrder.wholesale_order_id}`, rightMargin, customerY);
            doc.text(`Invoice Date: ${new Date(wholesaleOrder.date).toLocaleDateString()}`, rightMargin, customerY + 5);
            doc.text(`Payment Due: ${new Date(wholesaleOrder.date).toLocaleDateString()}`, rightMargin, customerY + 10);

            // Initialize Y positions
            let startY = customerY + 30; // Starting Y for tables

// Check if there are items to display
            if (wholesaleOrder.items.length > 0) {
              // Table headers for items
              const headers = ['Items', 'Quantity', 'Price', 'Amount'];
              const headerStartX = [leftInsideMargin, leftMargin + 80, leftMargin + 120, leftMargin + 150];

              doc.setFillColor(128, 128, 128);
              doc.setTextColor(255, 255, 255); // White text color
              doc.rect(leftMargin, startY - rowHeight, pageWidth - 2 * leftMargin, rowHeight, 'F');

              doc.setFontSize(12);
              headers.forEach((header, index) => {
                const x = headerStartX[index] + 2;
                const y = startY - (rowHeight / 2) + 4;
                doc.text(header, x, y, { align: 'left' });
              });

              // Reset text color for table content
              doc.setTextColor(0, 0, 0);

              // Start Y for items
              let itemsStartY = startY + rowHeight;

              // Include item data
              wholesaleOrder.items.forEach((item: any, index: number) => {
                doc.text(`${item.name} - ${item.warranty_period} WARRANTY`, leftInsideMargin, itemsStartY + index * 10);
                doc.text(`${item.qty}`, leftMargin + 80, itemsStartY + index * 10);
                doc.text(`${item.price.toFixed(2)}`, leftMargin + 120, itemsStartY + index * 10);
                doc.text(`${(item.qty * item.price).toFixed(2)}`, leftMargin + 150, itemsStartY + index * 10);
              });

              // Draw items border
              doc.rect(leftMargin, startY, pageWidth - 2 * leftMargin, itemsStartY - startY + wholesaleOrder.items.length * 10);

              // Update Y for IMEIs
              startY = itemsStartY + wholesaleOrder.items.length * 10 + sectionMargin;
            }

// Check if there are IMEIs to display
            if (wholesaleOrder.imeis.length > 0) {
              // Table headers for IMEI
              const imeiHeaders = ['Model', 'IMEI', 'Warranty', 'Price'];
              const imeiHeaderStartX = [leftInsideMargin, leftMargin + 60, leftMargin + 110, leftMargin + 150];

              doc.setFillColor(128, 128, 128);
              doc.setTextColor(255, 255, 255); // White text color
              doc.rect(leftMargin, startY - rowHeight, pageWidth - 2 * leftMargin, rowHeight, 'F');

              doc.setFontSize(12);
              imeiHeaders.forEach((header, index) => {
                const x = imeiHeaderStartX[index] + 2;
                const y = startY - (rowHeight / 2) + 4;
                doc.text(header, x, y, { align: 'left' });
              });

              // Reset text color for table content
              doc.setTextColor(0, 0, 0);

              // Start Y for IMEI data
              let imeiStartY = startY + rowHeight;

              // Include IMEI data
              wholesaleOrder.imeis.forEach((imei: any, index: number) => {
                doc.text(`${imei.model}`, leftInsideMargin, imeiStartY + index * 10);
                doc.text(`${imei.imei}`, leftMargin + 60, imeiStartY + index * 10);
                doc.text(`${imei.warranty}`, leftMargin + 110, imeiStartY + index * 10);
                doc.text(`${imei.price}`, leftMargin + 150, imeiStartY + index * 10);
              });

              // Draw IMEI border
              doc.rect(leftMargin, startY, pageWidth - 2 * leftMargin, imeiStartY - startY + wholesaleOrder.imeis.length * 10);

              // Update Y for next section or footer
              startY = imeiStartY + wholesaleOrder.imeis.length * 10 + sectionMargin;
            }


            // Totals
            doc.text(`Subtotal  :  ${wholesaleOrder.actual_price.toFixed(2)}`, leftMargin + 130, startY + 30);
            doc.text(`Discount  :  ${wholesaleOrder.discount.toFixed(2)}`, leftMargin + 130, startY + 40);
            doc.text(`Total      :  ${wholesaleOrder.total_amount.toFixed(2)}`, leftMargin + 130, startY + 50);

            // Notes section
            const notesY = startY + 70;
            doc.text('Warranty terms & conditions!', leftInsideMargin, notesY);
            doc.setFontSize(10);
            doc.text('* One year software warranty.', leftInsideMargin, notesY + 15);
            doc.text('* Warranty void if stickers damaged or removed.', leftInsideMargin, notesY + 20);
            doc.text('* Item should be in good condition', leftInsideMargin, notesY + 25);
            doc.text('* Bill must be presented , No cash returns', leftInsideMargin, notesY + 30);
            doc.text('* No warranty for water damage and over charged', leftInsideMargin, notesY + 35);

            // Footer
            const footerY = notesY + 40;
            const centerX = doc.internal.pageSize.width / 2; // Center of the page

            // Function to get the width of the text
            function getTextWidth(text: string) {
              return doc.getStringUnitWidth(text) * doc.internal.scaleFactor;
            }

            // Calculate text width and adjust x position for centering
            const thankYouText = 'Thank you for shopping with us! Let\'s visit us again';
            const poweredByText = 'Powered by Arimax Solutions';

            const thankYouTextWidth = getTextWidth(thankYouText);
            const poweredByTextWidth = getTextWidth(poweredByText);

            const thankYouTextX = centerX - (thankYouTextWidth / 2);
            const poweredByTextX = centerX - (poweredByTextWidth / 2);

            doc.text(thankYouText, thankYouTextX, footerY);
            doc.text(poweredByText, poweredByTextX, footerY + 5);

            // Save the PDF
            doc.save(`${wholesaleOrder.shop.shop_name}.bill.pdf`);
          };

          await Swal.fire({
            title: 'Success!',
            text: 'Wholesale order saved successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          console.log('Wholesale order saved successfully:', response.data);
        } catch (error) {
          await Swal.fire({
            title: 'Error!',
            text: 'Error saving wholesale order',
            icon: 'error',
            confirmButtonText: 'OK'
          });

          console.error('Error saving wholesale order:', error);
        }
      };

      return (
          <div className='m-4 w-full'>
            <div className="m-4">
              <TopNavbar />
            </div>
            <div className='bg-[#14141E] rounded-md p-3 text-white'>
              <div className='flex justify-between'>
                <div>
                  <button className='mr-4'>Cash Payment</button>
                  <button>Card Payment</button>
                </div>
                <div>
                  <p className='text-3xl text-[#5386ED] mr-10'>{orderId}</p>
                </div>
              </div>
              <hr className='my-3' />
              <div className='flex'>
                <div className='flex-1 p-4'>
                  <table className='w-full'>
                    <thead>
                    <tr>
                      <th className="font-bold px-6 py-2">Shop Name</th>
                      <th className="font-bold px-6 py-2">Shop Number</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td className="px-6 py-2">{shopName}</td>
                      <td className="px-6 py-2">{shopContactNumber}</td>
                    </tr>
                    </tbody>
                  </table>

                  <div className="space-y-4">
                    <table className="w-full border-collapse">
                      <thead>
                      <tr>
                        <th className="font-bold px-6 py-4 text-left">Model Name</th>
                        <th className="font-bold px-6 py-4 text-left">Imei Number</th>
                        <th className="font-bold px-6 py-4 text-left">Price</th>
                      </tr>
                      </thead>
                      <tbody>
                      {wholesalePhones.map((wholesalePhone:any, index:number) => (
                          <tr key={index}>
                            <td className="px-6 py-2">{wholesalePhone.modelName}</td>
                            <td className="px-6 py-2">{wholesalePhone.imei}</td>
                            <td className="px-6 py-2">{wholesalePhone.price}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>

                    <hr className='my-3' />

                    <table className="w-full border-collapse">
                      <thead>
                      <tr>
                        <th className="font-bold px-6 py-4 text-left">Item Name</th>
                        <th className="font-bold px-6 py-4 text-left">Quantity</th>
                        <th className="font-bold px-6 py-4 text-left">Price</th>
                      </tr>
                      </thead>
                      <tbody>
                      {wholesaleItems.map((wholesaleItem:any, index:number) => (
                          <tr key={index}>
                            <td className="px-6 py-2">{wholesaleItem.name}</td>
                            <td className="px-6 py-2">{wholesaleItem.qty}</td>
                            <td className="px-6 py-2">{wholesaleItem.price}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className='h-full w-1 bg-[#717171] mx-5'></div>
                </div>
                <div className='flex-1'>
                  <table className='w-full'>
                    <thead>
                    <tr>
                      <th className='text-[#5386ED] text-xl py-2 px-4'>Make Payment</th>
                      <th className='py-2 px-4'></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td className='py-2 px-4'>
                        <div className='mt-2'>
                          <p>Subtotal</p>
                        </div>
                      </td>
                      <td className='py-2 px-4'>
                        <div className='mt-1'>
                          <p>{subtotalWholesale.toFixed(2)}</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className='py-2 px-4'>
                        <div className='mt-2'>
                          <p className='text-red-500'>Outstanding</p>
                        </div>
                      </td>
                      <td className='py-2 px-4'>
                        <div className='mt-1'>
                          <p className='text-red-500'>-{outstanding.toFixed(2)}</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className='py-2 px-4'>
                        <div className='mt-2'>
                          <p>Discount</p>
                        </div>
                      </td>
                      <td className='py-2 px-4'>
                        <div className='mt-1'>
                          <input
                              ref={discountRefWholesale}
                              type="number"
                              placeholder="0.00"
                              className="bg-[#14141E] border border-[#3A3A3A] text-[#717171] p-1 rounded-lg"
                              value={discountWholesale}
                              onChange={handleDiscountChangeWholesale}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className='py-2 px-4'>
                        <div className='mt-2'>
                          <p className='text-[#5386ED]'>Total</p>
                        </div>
                      </td>
                      <td className='py-2 px-4'>
                        <div className='mt-1'>
                          <p className='text-[#5386ED]'>{totalAfterDiscountWholesale.toFixed(2)}</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className='py-2 px-4'>
                        <div className='mt-2'>
                          <p>Customer Amount</p>
                        </div>
                      </td>
                      <td className='py-2 px-4'>
                        <div className='mt-1'>
                          <input
                              type="number"
                              placeholder="0.00"
                              className="bg-[#14141E] border border-[#3A3A3A] text-[#717171] p-1 rounded-lg"
                              value={customerAmountWholesale}
                              onChange={(e) => setCustomerAmountWholesale(parseFloat(e.target.value))}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className='py-2 px-4'>
                        <div className='mt-2'>
                          <p>Balance</p>
                        </div>
                      </td>
                      <td className='py-2 px-4'>
                        <div className='mt-1'>
                          <p>{balanceWholesale.toFixed(2)}</p>
                        </div>
                      </td>
                    </tr>
                    </tbody>
                  </table>

                  <div className='mt-4 flex justify-center'>
                    <button
                        onClick={saveOrderWholesale}
                        className='bg-[#5386ED] rounded-lg text-white px-4 py-2'
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      );

    case "return-order":
      const discountRefReturn = useRef(null);
      const [discountReturn, setDiscountReturn] = useState(0);
      const [subtotalReturn, setSubtotalReturn] = useState(0);
      const [totalAfterDiscountReturn, setTotalAfterDiscountReturn] = useState(0);
      const [balanceReturn, setBalanceReturn] = useState(0);
      const [customerAmountReturn, setCustomerAmountReturn] = useState(0);

      useEffect(() => {
        calculateTotalsReturn(discountReturn, customerAmountReturn);
      }, [discountReturn, customerAmountReturn, returnPhones, outstandingReturn]);

      const handleDiscountChangeReturn = (e:any) => {
        const value = parseFloat(e.target.value) || 0;
        setDiscountReturn(value);
      };

      /*const handleCustomerAmountChangeReturn = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setCustomerAmountReturn(value);
      };*/

      const calculateTotalsReturn = (discountValueReturn:number, customerAmountValueReturn:number) => {
        const totalPhonePriceReturn = returnPhones.reduce((sum:any, returnPhone:any) => sum + (parseFloat(returnPhone.price) || 0), 0);
        const subtotalValueReturn = totalPhonePriceReturn  - (parseFloat(outstanding) || 0);
        const totalAfterDiscountValueReturn = subtotalValueReturn - discountValueReturn;
        const balanceValueReturn = customerAmountValueReturn - totalAfterDiscountValueReturn;

        setSubtotalReturn(subtotalValueReturn);
        setTotalAfterDiscountReturn(totalAfterDiscountValueReturn);
        setBalanceReturn(balanceValueReturn);

        return {
          subtotalReturn: subtotalValueReturn,
          totalAfterDiscountReturn: totalAfterDiscountValueReturn,
        };
      };

      const saveOrderReturn = async () => {
        console.log("Saving order...");
        const { subtotalReturn, totalAfterDiscountReturn } = calculateTotalsReturn(discountReturn, customerAmountReturn);

        const returnOrder = {
          return_order_id: generateRetailOrderId(),
          discount: discountReturn,
          actual_price: subtotalReturn,
          total_amount: totalAfterDiscountReturn,
          date: new Date().toISOString(),
          is_deleted: false,
          shop: {
            shop_id: shopIdReturn,
            shop_name: shopNameReturn,
            contact_number: shopContactNumberReturn,
          },
          imeis : returnPhones.map((returnPhone: ReturnPhone) => ({
            id: returnPhone.id,
            model: returnPhone.modelName,
            imei: returnPhone.imei,
            storage: returnPhone.storage,
            colour: returnPhone.colour,
            price: returnPhone.price,
            warranty: returnPhone.warranty
          }))
        };

        try {
          const response = await axios.post(`${backend_url}/api/returnOrder`, returnOrder);
          const doc = new jsPDF();

          const img = new Image();
          img.src = logo; // Path to your uploaded image

          img.onload = function() {
            // Constants for layout
            const topMargin = 20;
            const sectionMargin = 10;
            const rowHeight = 10;
            const pageWidth = 210; // A4 page width in mm
            const pageHeight = 297; // A4 page height in mm
            const leftMargin = 10;
            const leftInsideMargin = 20;
            const rightMargin = 140;

            // Add watermark image with shading effect first
            const imgWidth = 80; // Adjust the width as necessary
            const imgHeight = imgWidth * (img.height / img.width);
            const imgX = (pageWidth - imgWidth) / 2;
            const imgY = (pageHeight - imgHeight) / 2;

            // Set grey color for the watermark with some transparency
            const greyShade = 200; // Choose a value between 0 (black) and 255 (white)
            doc.setFillColor(greyShade, greyShade, greyShade, 20); // Add a shadow color with 20% opacity

            // Add the watermark image
            doc.addImage(img, 'PNG', imgX, imgY, imgWidth, imgHeight, '', 'NONE');

            // Draw page border on top of the watermark
            doc.setDrawColor(0, 0, 0);
            doc.rect(leftMargin, topMargin, pageWidth - 2 * leftMargin, pageHeight - 2 * topMargin);

            // Header
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 255);
            doc.text('INVOICE', pageWidth / 2, topMargin + 10, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('I MOBILE CRAZY', pageWidth / 2, topMargin + 20, { align: 'center' });
            doc.text('Galekade junction, Halthota road,', pageWidth / 2, topMargin + 25, { align: 'center' });
            doc.text('Raigama,Bandaragama', pageWidth / 2, topMargin + 30, { align: 'center' });
            doc.text('Phone: 076 311 0859', pageWidth / 2, topMargin + 35, { align: 'center' });
            doc.text('Email: imobilecrazybandaragama@gmail.com', pageWidth / 2, topMargin + 40, { align: 'center' });

            // Customer and Invoice Details
            const customerY = topMargin + 60;
            doc.setFontSize(12);
            doc.text('BILL TO:', leftInsideMargin, customerY);
            doc.text(returnOrder.shop.shop_name, leftInsideMargin, customerY + 5);
            doc.text(returnOrder.shop.contact_number, leftInsideMargin, customerY + 10);

            doc.text(`Invoice Number: ${returnOrder.return_order_id}`, rightMargin, customerY);
            doc.text(`Invoice Date: ${new Date(returnOrder.date).toLocaleDateString()}`, rightMargin, customerY + 5);
            doc.text(`Payment Due: ${new Date(returnOrder.date).toLocaleDateString()}`, rightMargin, customerY + 10);

            const tableHeaderY = customerY + 30;
            const headers = ['Items', 'Quantity', 'Price', 'Amount'];
            const headerStartX = [leftInsideMargin, leftMargin + 80, leftMargin + 120, leftMargin + 150];

            doc.setFillColor(128, 128, 128);
            doc.setTextColor(255, 255, 255); // White text color
            doc.rect(leftMargin, tableHeaderY - rowHeight, pageWidth - 2 * leftMargin, rowHeight, 'F');

            doc.setFontSize(12);
            headers.forEach((header, index) => {
              const x = headerStartX[index] + 2;
              const y = tableHeaderY - (rowHeight / 2) + 4;
              doc.text(header, x, y, { align: 'left' });
            });

            // Reset text color for table content
            doc.setTextColor(0, 0, 0);

            // Start Y for items
            let startY = tableHeaderY + rowHeight;

            // Table headers for IMEI
            const imeiTableHeaderY = startY;
            const imeiHeaders = ['Model', 'IMEI', 'Warranty', 'Price'];
            const imeiHeaderStartX = [leftInsideMargin, leftMargin + 60, leftMargin + 110, leftMargin + 150];

            doc.setFillColor(128, 128, 128);
            doc.setTextColor(255, 255, 255); // White text color
            doc.rect(leftMargin, imeiTableHeaderY - rowHeight, pageWidth - 2 * leftMargin, rowHeight, 'F');

            doc.setFontSize(12);
            imeiHeaders.forEach((header, index) => {
              const x = imeiHeaderStartX[index] + 2;
              const y = imeiTableHeaderY - (rowHeight / 2) + 4;
              doc.text(header, x, y, { align: 'left' });
            });

            // Reset text color for table content
            doc.setTextColor(0, 0, 0);

            // Start Y for IMEI data
            let imeiStartY = imeiTableHeaderY + rowHeight;

            // Include IMEI data if available
            if (returnOrder.imeis.length > 0) {
              returnOrder.imeis.forEach((imei:any, index:number) => {
                doc.text(imei.model, leftInsideMargin, imeiStartY + index * 10);
                doc.text(imei.imei, leftMargin + 60, imeiStartY + index * 10);
                doc.text(imei.warranty, leftMargin + 110, imeiStartY + index * 10);
                doc.text(imei.price.toFixed(2), leftMargin + 150, imeiStartY + index * 10);
              });

              // Draw IMEI border
              doc.rect(leftMargin, imeiTableHeaderY, pageWidth - 2 * leftMargin, imeiStartY - imeiTableHeaderY + returnOrder.imeis.length * 10);

              // Update Y for next section or footer
              imeiStartY = imeiStartY + returnOrder.imeis.length * 10 + sectionMargin;
            }

            // Totals
            doc.text(`Subtotal  :  ${returnOrder.actual_price.toFixed(2)}`, leftMargin + 130, startY + 30);
            doc.text(`Discount  :  ${returnOrder.discount.toFixed(2)}`, leftMargin + 130, startY + 40);
            doc.text(`Total      :  ${returnOrder.total_amount.toFixed(2)}`, leftMargin + 130, startY + 50);

            // Notes section
            const notesY = startY + 70;
            doc.text('Warranty terms & conditions!', leftInsideMargin, notesY);
            doc.setFontSize(10);
            doc.text('* One year software warranty.', leftInsideMargin, notesY + 15);
            doc.text('* Warranty void if stickers damaged or removed.', leftInsideMargin, notesY + 20);
            doc.text('* Item should be in good condition', leftInsideMargin, notesY + 25);
            doc.text('* Bill must be presented , No cash returns', leftInsideMargin, notesY + 30);
            doc.text('* No warranty for water damage and over charged', leftInsideMargin, notesY + 35);

            // Footer
            const footerY = notesY + 40;
            const centerX = doc.internal.pageSize.width / 2; // Center of the page

            // Function to get the width of the text
            function getTextWidth(text: string) {
              return doc.getStringUnitWidth(text) * doc.internal.scaleFactor;
            }

            // Calculate text width and adjust x position for centering
            const thankYouText = 'Thank you for shopping with us! Let\'s visit us again';
            const poweredByText = 'Powered by Arimax Solutions';

            const thankYouTextWidth = getTextWidth(thankYouText);
            const poweredByTextWidth = getTextWidth(poweredByText);

            const thankYouTextX = centerX - (thankYouTextWidth / 2);
            const poweredByTextX = centerX - (poweredByTextWidth / 2);

            doc.text(thankYouText, thankYouTextX, footerY);
            doc.text(poweredByText, poweredByTextX, footerY + 5);

            // Save the PDF
            doc.save(`${returnOrder.shop.shop_name}.bill.pdf`);
          };
          await Swal.fire({
            title: 'Success!',
            text: 'Return order saved successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          // Update the UI after successful save
          console.log('Return order saved successfully:', response.data);
        } catch (error) {
          // SweetAlert error message
          await Swal.fire({
            title: 'Error!',
            text: 'Error saving return order',
            icon: 'error',
            confirmButtonText: 'OK'
          });

          console.error('Error saving wholesale order:', error);
        }
      };

      return <div className='m-4 w-full'>
        <div className="m-4">
          <TopNavbar />
        </div>
        <div className='bg-[#14141E] rounded-md p-3 text-white'>
          <div className='flex justify-between'>
            <div>
              <button className='mr-4'>Cash Payment</button>
              <button>Card Payment</button>
            </div>
            <div>
              <p className='text-3xl text-[#5386ED] mr-10'>{orderId}</p>
            </div>
          </div>
          <hr className='my-3' />
          <div className='flex'>
            <div className='flex-1 p-4'>
              <table className='w-full '>
                <thead>
                <tr>
                  <th className="font-bold px-6 py-2 ">Shop Name</th>
                  <th className="font-bold px-6 py-2 ">Shop Number</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td className="px-6 py-2 ">{shopNameReturn}</td>
                  <td className="px-6 py-2 ">{shopContactNumberReturn}</td>
                </tr>
                </tbody>
              </table>

              <div className="space-y-4">
                <table className="w-full border-collapse">
                  <thead>
                  <tr>
                    <th className="font-bold px-6 py-4 text-left">Model Name</th>
                    <th className="font-bold px-6 py-4 text-left">Imei Number</th>
                    <th className="font-bold px-6 py-4 text-left">Price</th>
                  </tr>
                  </thead>
                  <tbody>
                  {returnPhones.map((returnPhone:any, index:number) => (
                      <tr key={index}>
                        <td className="px-6 py-2">{returnPhone.modelName}</td>
                        <td className="px-6 py-2">{returnPhone.imei}</td>
                        <td className="px-6 py-2">{returnPhone.price}</td>
                      </tr>
                  ))}
                  </tbody>
                </table>

                <hr className='my-3' />

              </div>
            </div>

            <div>
              <div className='h-full w-1 bg-[#717171] mx-5'></div>
            </div>
            <div className='flex-1'>
              <table className='w-full'>
                <thead>
                <tr>
                  <th className='text-[#5386ED] text-xl py-2 px-4'>Make Payment</th>
                  <th className='py-2 px-4'></th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td className='py-2 px-4'>
                    <div className='mt-2'>
                      <p>Subtotal</p>
                    </div>
                  </td>
                  <td className='py-2 px-4'>
                    <div className='mt-1'>
                      <p>{subtotalReturn.toFixed(2)}</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className='py-2 px-4'>
                    <div className='mt-2'>
                      <p className='text-red-500'>OutStanding</p>
                    </div>
                  </td>
                  <td className='py-2 px-4'>
                    <div className='mt-1'>
                      <p className='text-red-500'>{outstandingReturn.toFixed(2)}</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className='py-2 px-4'>
                    <div className='mt-2'>
                      <p>Discount</p>
                    </div>
                  </td>
                  <td className='py-2 px-4'>
                    <div className='mt-1'>
                      <input
                          type='number'
                          ref={discountRefReturn}
                          onChange={handleDiscountChangeReturn}
                          className='bg-[#1E1E1E] text-white px-2 py-1 rounded-md'
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className='py-2 px-4'>
                    <div className='mt-2'>
                      <p>Total Amount</p>
                    </div>
                  </td>
                  <td className='py-2 px-4'>
                    <div className='mt-1'>
                      <p>{totalAfterDiscountReturn.toFixed(2)}</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className='py-2 px-4'>
                    <div className='mt-2'>
                      <p>Customer Amount</p>
                    </div>
                  </td>
                  <td className='py-2 px-4'>
                    <div className='mt-1'>
                      <input
                          type='number'
                          value={customerAmountReturn}
                          onChange={(e) => setCustomerAmountReturn(parseFloat(e.target.value) || 0)}
                          className='bg-[#1E1E1E] text-white px-2 py-1 rounded-md'
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className='py-2 px-4'>
                    <div className='mt-2'>
                      <p>Balance</p>
                    </div>
                  </td>
                  <td className='py-2 px-4'>
                    <div className='mt-1'>
                      <p>{balanceReturn.toFixed(2)}</p>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>

              <div className='flex flex-col gap-2 mt-3'>
                <button
                    className='bg-[#5356EC] p-2'
                    onClick={saveOrderReturn}
                >
                  Confirm Payment
                </button>
                <button className='border-2 border-[#5356EC] p-2 bg-[#343434]'>
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }

  /*return <div>Error: Invalid order type</div>;*/
};

export default ProceedPayment;
