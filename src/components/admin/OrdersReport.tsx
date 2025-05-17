import React, { useState } from 'react';
import { 
  generateDailyOrdersCSV, 
  formatDateForFilename,
  getOrdersForDay
} from '../../lib/orderService';

interface OrdersReportProps {
  selectedDate: Date | null;
}

const OrdersReport: React.FC<OrdersReportProps> = ({ selectedDate }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to download a file
  const downloadFile = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download as CSV
  const handleDownloadCSV = async () => {
    if (!selectedDate) {
      setError('Please select a date to generate the report');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await generateDailyOrdersCSV(selectedDate);
      
      if (error) {
        console.error('Error generating CSV report:', error);
        setError('Failed to generate report. Please try again.');
        return;
      }
      
      if (!data) {
        setError('No orders found for the selected date');
        return;
      }

      // Download the CSV file
      if (selectedDate) {
        downloadFile(
          data, 
          `orders-${formatDateForFilename(selectedDate)}.csv`, 
          'text/csv;charset=utf-8;'
        );
      }
    } catch (err) {
      console.error('Failed to download CSV report:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Download as Excel
  const handleDownloadExcel = async () => {
    if (!selectedDate) {
      setError('Please select a date to generate the report');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Import xlsx dynamically to avoid SSR issues
      const XLSX = await import('xlsx');
      
      // Get the orders data
      const { orders, itemsByOrderId, error } = await getOrdersForDay(selectedDate);
      
      if (error || !orders || !itemsByOrderId) {
        console.error('Error fetching orders:', error);
        setError('Failed to generate report. Please try again.');
        return;
      }
      
      // Prepare data for Excel
      const excelData = orders.map(order => {
        const items = itemsByOrderId[order.id] || [];
        const productsStr = items.map(item => 
          `${item.name} (${item.size}) x${item.quantity} - ${item.price} MAD`
        ).join(' | ');
        
        return {
          'Order ID': order.id,
          'Date': new Date(order.created_at).toLocaleString(),
          'Customer Name': order.customer_name,
          'Phone': order.phone,
          'Address': order.address,
          'Total Amount': `${order.total_amount} MAD`,
          'Payment Method': order.payment_method,
          'Payment Status': order.payment_status,
          'Products': productsStr
        };
      });
      
      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Create a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Convert to Blob and download
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      if (selectedDate) {
        link.setAttribute('download', `orders-${formatDateForFilename(selectedDate)}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to download Excel report:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Download as PDF (HTML-based approach)
  const handleDownloadPDF = async () => {
    if (!selectedDate) {
      setError('Please select a date to generate the report');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the orders data
      const { orders, itemsByOrderId, error } = await getOrdersForDay(selectedDate);
      
      if (error || !orders || !itemsByOrderId) {
        console.error('Error fetching orders:', error);
        setError('Failed to generate report. Please try again.');
        return;
      }
      
      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      
      // Create HTML content for the report
      let htmlContent = `
        <html>
        <head>
          <title>Orders Report - ${selectedDate.toLocaleDateString()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
            
            :root {
              --primary-color: #4F46E5;
              --secondary-color: #818CF8;
              --success-color: #22c55e;
              --warning-color: #eab308;
              --danger-color: #ef4444;
              --info-color: #3b82f6;
              --light-gray: #f9fafb;
              --medium-gray: #e5e7eb;
              --dark-gray: #4b5563;
            }
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Poppins', sans-serif;
              margin: 0;
              padding: 0;
              color: #1f2937;
              background-color: #f3f4f6;
              line-height: 1.6;
            }
            
            h1, h2, h3, h4, h5, h6 {
              font-family: 'Playfair Display', serif;
            }
            
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background-color: white;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              border-radius: 8px;
              overflow: hidden;
              margin-top: 20px;
              margin-bottom: 20px;
            }
            
            .header {
              background-color: var(--primary-color);
              background-image: linear-gradient(135deg, var(--primary-color) 0%, #3730a3 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
              border-bottom: 5px solid var(--secondary-color);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .header-logo {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 10px;
            }
            
            .header-logo svg {
              margin-right: 15px;
            }
            
            .header h1 {
              font-size: 2.2rem;
              font-weight: 700;
              font-family: 'Times New Roman', serif;
              letter-spacing: 2px;
              margin: 0;
            }
            
            .header h2 {
              font-size: 1.5rem;
              font-weight: 500;
              opacity: 0.9;
              margin-top: 10px;
              letter-spacing: 1px;
            }
            
            .content {
              padding: 30px;
            }
            
            .report-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid var(--medium-gray);
            }
            
            .report-date {
              font-size: 1.1rem;
              font-weight: 500;
            }
            
            .report-date span {
              color: var(--primary-color);
              font-weight: 600;
            }
            
            .summary {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .summary-card {
              background-color: white;
              border-radius: 8px;
              padding: 25px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              border-left: 4px solid var(--primary-color);
              transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            }
            
            .summary-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .summary-card.revenue {
              border-left-color: var(--success-color);
            }
            
            .summary-card h3 {
              font-size: 0.9rem;
              color: var(--dark-gray);
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .summary-card p {
              font-size: 1.5rem;
              font-weight: 600;
              color: #111827;
            }
            
            .orders-section {
              margin-bottom: 30px;
            }
            
            .section-title {
              font-size: 1.25rem;
              font-weight: 600;
              margin-bottom: 15px;
              color: var(--primary-color);
              display: flex;
              align-items: center;
            }
            
            .section-title::after {
              content: '';
              flex-grow: 1;
              height: 1px;
              background-color: var(--medium-gray);
              margin-left: 15px;
            }
            
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin-top: 10px;
              font-size: 0.95rem;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            
            th {
              background-color: var(--primary-color);
              color: white;
              padding: 14px 15px;
              text-align: left;
              font-weight: 500;
              position: sticky;
              top: 0;
              z-index: 10;
              box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
            }
            
            th:first-child {
              border-top-left-radius: 8px;
            }
            
            th:last-child {
              border-top-right-radius: 8px;
            }
            
            td {
              padding: 12px 15px;
              border-bottom: 1px solid var(--medium-gray);
              vertical-align: top;
            }
            
            tr:nth-child(even) {
              background-color: var(--light-gray);
            }
            
            tr:hover {
              background-color: #f0f4ff;
            }
            
            .status-badge {
              display: inline-block;
              padding: 5px 10px;
              border-radius: 20px;
              font-size: 0.8rem;
              font-weight: 500;
              text-transform: capitalize;
              letter-spacing: 0.5px;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }
            
            .status-paid {
              background-color: rgba(34, 197, 94, 0.1);
              color: var(--success-color);
              border: 1px solid rgba(34, 197, 94, 0.2);
            }
            
            .status-pending {
              background-color: rgba(234, 179, 8, 0.1);
              color: var(--warning-color);
              border: 1px solid rgba(234, 179, 8, 0.2);
            }
            
            .status-cancelled {
              background-color: rgba(239, 68, 68, 0.1);
              color: var(--danger-color);
              border: 1px solid rgba(239, 68, 68, 0.2);
            }
            
            .status-processing {
              background-color: rgba(59, 130, 246, 0.1);
              color: var(--info-color);
              border: 1px solid rgba(59, 130, 246, 0.2);
            }
            
            .product-item {
              margin-bottom: 8px;
              padding-bottom: 8px;
              border-bottom: 1px dashed #e5e7eb;
            }
            
            .product-item:last-child {
              margin-bottom: 0;
              padding-bottom: 0;
              border-bottom: none;
            }
            
            .product-name {
              font-weight: 500;
            }
            
            .product-details {
              display: flex;
              justify-content: space-between;
              font-size: 0.85rem;
              color: var(--dark-gray);
              margin-top: 3px;
            }
            
            .customer-info {
              line-height: 1.5;
            }
            
            .customer-name {
              font-weight: 500;
            }
            
            .customer-address {
              font-size: 0.85rem;
              color: var(--dark-gray);
              margin-top: 5px;
            }
            
            .order-id {
              font-family: monospace;
              font-size: 0.85rem;
              background-color: #f3f4f6;
              padding: 2px 5px;
              border-radius: 4px;
            }
            
            .footer {
              text-align: center;
              margin-top: 40px;
              padding: 30px 20px;
              color: var(--dark-gray);
              border-top: 1px solid var(--medium-gray);
              background-color: #f8fafc;
            }
            
            .logo-container {
              margin-bottom: 15px;
            }
            
            .footer-logo {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 10px;
            }
            
            .crown-icon {
              margin-right: 10px;
            }
            
            .logo-text {
              font-family: 'Times New Roman', serif;
              font-size: 24px;
              font-weight: bold;
              color: #4F46E5;
              letter-spacing: 1px;
            }
            
            .footer-content {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 5px;
            }
            
            .report-title {
              font-size: 1.1rem;
              font-weight: 600;
              color: var(--primary-color);
              margin-bottom: 5px;
            }
            
            .generation-info {
              font-size: 0.9rem;
              color: var(--dark-gray);
            }
            
            .copyright {
              font-size: 0.85rem;
              color: #6b7280;
              margin-top: 5px;
            }
            
            @media print {
              body {
                background-color: white;
              }
              
              .container {
                box-shadow: none;
                max-width: 100%;
              }
              
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <!-- MarocLuxe Header with Crown Logo -->
              <div class="header-logo">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M32 6L24 14L16 6L8 14L0 6V30H32V6Z" stroke="white" stroke-width="2" fill="none" />
                  <path d="M0 22L8 14L16 22L24 14L32 22" stroke="white" stroke-width="2" fill="none" />
                </svg>
                <h1>LUXE MAROC</h1>
              </div>
              <h2>Daily Orders Report</h2>
            </div>
            
            <div class="content">
              <div class="report-info">
                <div class="report-date">
                  <p>Report Date: <span>${selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                </div>
                <div class="print-button">
                  <button onclick="window.print()" style="background-color: #4F46E5; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-family: 'Poppins', sans-serif;">
                    Print Report
                  </button>
                </div>
              </div>
              
              <div class="summary">
                <div class="summary-card">
                  <h3>Total Orders</h3>
                  <p>${orders.length}</p>
                </div>
                <div class="summary-card revenue">
                  <h3>Total Revenue</h3>
                  <p>${totalRevenue.toLocaleString()} MAD</p>
                </div>
              </div>
              
              <div class="orders-section">
                <h3 class="section-title">Order Details</h3>
                
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date & Time</th>
                      <th>Customer Information</th>
                      <th>Order Details</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
      `;
      
      // Add table rows
      orders.forEach(order => {
        const items = itemsByOrderId[order.id] || [];
        
        // Format products with better styling
        const productsHtml = items.map(item => `
          <div class="product-item">
            <div class="product-name">${item.name} (${item.size})</div>
            <div class="product-details">
              <span>Quantity: ${item.quantity}</span>
              <span>Price: ${item.price} MAD</span>
            </div>
          </div>
        `).join('');
        
        // Note: We're using order.total_amount from the database instead of calculating it here
        
        // Format date and time
        const orderDate = new Date(order.created_at);
        const formattedDate = orderDate.toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        const formattedTime = orderDate.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        // Determine status class
        let statusClass = '';
        switch(order.payment_status.toLowerCase()) {
          case 'paid': statusClass = 'status-paid'; break;
          case 'pending': statusClass = 'status-pending'; break;
          case 'cancelled': statusClass = 'status-cancelled'; break;
          case 'processing': statusClass = 'status-processing'; break;
        }
        
        htmlContent += `
          <tr>
            <td>
              <span class="order-id">${order.id}</span>
            </td>
            <td>
              <div>${formattedDate}</div>
              <div style="font-size: 0.85rem; color: #4b5563;">${formattedTime}</div>
            </td>
            <td>
              <div class="customer-info">
                <div class="customer-name">${order.customer_name}</div>
                <div>${order.phone}</div>
                <div class="customer-address">${order.address || 'No address provided'}</div>
              </div>
            </td>
            <td>
              <div>${productsHtml}</div>
              <div style="margin-top: 10px; font-weight: 600; text-align: right;">
                Total: ${order.total_amount} MAD
              </div>
            </td>
            <td>
              <div>
                <span class="status-badge ${statusClass}">${order.payment_status}</span>
              </div>
              <div style="margin-top: 8px; font-size: 0.85rem;">
                Method: ${order.payment_method.toUpperCase()}
              </div>
            </td>
          </tr>
        `;
      });
      
      // Close the HTML
      htmlContent += `
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <div class="logo-container">
              <div class="footer-logo">
                <div class="crown-icon">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32 6L24 14L16 6L8 14L0 6V30H32V6Z" stroke="#4F46E5" stroke-width="2" fill="none" />
                    <path d="M0 22L8 14L16 22L24 14L32 22" stroke="#4F46E5" stroke-width="2" fill="none" />
                  </svg>
                </div>
                <div class="logo-text">LUXE MAROC</div>
              </div>
            </div>
            <div class="footer-content">
              <p class="report-title">Daily Orders Report</p>
              <p class="generation-info">Generated on ${new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'medium' })}</p>
              <p class="copyright">© ${new Date().getFullYear()} MarocLuxe. All rights reserved.</p>
            </div>
          </div>
        </div>
        
        <script>
          // Add print functionality
          document.addEventListener('DOMContentLoaded', function() {
            // Auto-print dialog when requested
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('print') === 'true') {
              setTimeout(() => {
                window.print();
              }, 1000);
            }
          });
        </script>
        </body>
        </html>
      `;
      
      // Create a Blob from the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-${formatDateForFilename(selectedDate)}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // No longer opening in a new tab - just download
    } catch (err) {
      console.error('Failed to generate HTML report:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Daily Orders Report</h3>
        <p className="text-sm text-gray-600 mb-4">
          {selectedDate 
            ? `Download orders report for ${selectedDate.toLocaleDateString()}`
            : 'Select a date to download the daily orders report'}
        </p>
        
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadCSV}
            disabled={loading || !selectedDate}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              loading || !selectedDate
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>CSV</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDownloadExcel}
            disabled={loading || !selectedDate}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              loading || !selectedDate
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Excel</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={loading || !selectedDate}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              loading || !selectedDate
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Print Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersReport;
