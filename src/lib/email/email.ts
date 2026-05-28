import nodemailer from 'nodemailer';

// Configure the SMTP transport using environment variables.
// For Gmail, use host: 'smtp.gmail.com', port: 465, secure: true.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  orderId: string;
  totalAmount: number;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
}

export const sendOrderConfirmationEmail = async (orderDetails: OrderDetails) => {
  // If SMTP credentials are not configured, log and return early in development.
  // In production, you might want to throw an error or handle it differently.
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP_USER or SMTP_PASS is not set. Skipping email confirmation.');
    return false;
  }

  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"NIRA6 Studio" <${process.env.SMTP_USER}>`,
    to: orderDetails.customerEmail,
    subject: `Order Confirmation - NIRA6 #${orderDetails.orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-w-4xl: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FFDA03; background-color: #1A1A1A; padding: 15px; border-radius: 8px;">NIRA6</h1>
        </div>
        
        <h2>Hi ${orderDetails.customerName},</h2>
        <p>Thank you for your order! Your creative tools have passed core inspection and are being prepared for dispatch.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Tracking ID:</strong> ${orderDetails.orderId}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #eee;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 15px 12px 12px; text-align: right; font-weight: bold;">Grand Total:</td>
                <td style="padding: 15px 12px 12px; text-align: right; font-weight: bold; color: #1A1A1A;">₹${orderDetails.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <p>You can track the status of your order directly from your <a href="https://www.nira6.in/dashboard" style="color: #FFDA03; font-weight: bold; text-decoration: none;">NIRA6 Dashboard</a>.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888;">
          <p>NIRA6 Studio | 1/32 A-7 TPK, MDU-5 (Madurai), Tamil Nadu, India</p>
          <p>nira6studio@gmail.com</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};
