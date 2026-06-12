'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, Shield, ArrowLeft, Check } from 'lucide-react';
import api from '@/services/api';
import { formatPrice } from '@/lib/utils';

interface OrderDetails {
  _id: string;
  orderId?: string;
  invoiceNumber?: string;
  items: {
    product: {
      name: string;
      brand: string;
      category: string;
      image: string;
    };
    quantity: number;
    price: number;
    sku?: string;
    variant?: string;
  }[];
  totalAmount: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst?: number;
  platformFee: number;
  discountAmount: number;
  couponApplied: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state?: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

export default function OrderInvoicePage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (id) {
      api.get(`/orders/${id}`)
        .then((res) => {
          setOrder(res.data.order);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-neutral-500 text-xs font-mono">Generating tax receipt details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 text-center">
        <h2 className="font-heading font-black text-lg">Invoice Not Found</h2>
        <p className="text-xs text-neutral-500 mt-1 mb-4">The order receipt could not be resolved from DB.</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg">Go Back</button>
      </div>
    );
  }

  const itemsSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // QR Code data: contains Order ID, Date, and Total
  const qrData = `NIRA6-INVOICE|ID:${order.orderId || order._id}|DATE:${new Date(order.createdAt).toISOString().split('T')[0]}|AMT:${order.totalAmount}|GSTIN:27AACCB9485C1Z1`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950 font-mono py-12 px-4 selection:bg-neutral-200">
      
      {/* Action buttons (hidden on print) */}
      <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to tracking
        </button>
        <button 
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-bold rounded-xl transition-all shadow-md"
        >
          <Printer className="w-4 h-4" /> Print Tax Invoice
        </button>
      </div>

      {/* Invoice Card */}
      <div className="max-w-3xl mx-auto bg-white border border-neutral-200 shadow-sm p-8 sm:p-12 print:border-0 print:shadow-none print:p-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-8 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-950">NIRA6 SOLUTIONS</h1>
            <p className="text-[10px] text-neutral-500 mt-0.5">Verified Recommerce & Creator Ecosystem</p>
            <p className="text-[10px] text-neutral-500 mt-1">CIN: U72900MH2026PTC394852</p>
          </div>
          <div className="sm:text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-emerald-300 bg-emerald-50 text-emerald-800 text-[9px] font-bold uppercase rounded-md">
              <Check className="w-3 h-3" /> TAX PAID
            </span>
            <p className="text-xs font-bold mt-2 text-neutral-950">Tax Invoice Number</p>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">{order.invoiceNumber || 'INV-MOCKED-SYSTEM'}</p>
          </div>
        </div>

        {/* Address Columns */}
        <div className="grid sm:grid-cols-2 gap-8 py-8 border-b border-neutral-200 text-xs">
          <div>
            <h3 className="font-bold text-neutral-950 uppercase text-[10px] tracking-wider mb-2">Sold By (Seller)</h3>
            <p className="font-bold text-neutral-800">NIRA6 Certified Depot</p>
            <p className="text-neutral-500 mt-1 leading-relaxed">
              Fulfillment Hub Bom-01,<br />
              Saki Naka Industrial Area East,<br />
              Mumbai, Maharashtra - 400072
            </p>
            <p className="text-neutral-500 mt-1.5">GSTIN: 27AACCB9485C1Z1</p>
          </div>
          <div>
            <h3 className="font-bold text-neutral-950 uppercase text-[10px] tracking-wider mb-2">Shipping Destination</h3>
            <p className="font-bold text-neutral-800">{order.shippingAddress.name}</p>
            <p className="text-neutral-500 mt-1 leading-relaxed">
              {order.shippingAddress.address},<br />
              {order.shippingAddress.city} {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} - <span className="font-bold text-neutral-850">{order.shippingAddress.pincode}</span>
            </p>
            <p className="text-neutral-500 mt-1.5">Contact: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b border-neutral-200 gap-4 text-xs">
          <div>
            <span className="text-neutral-500 uppercase text-[10px] font-bold tracking-wider">Order Reference ID</span>
            <p className="font-bold text-neutral-850 mt-0.5 font-mono">{order.orderId || order._id.toUpperCase()}</p>
          </div>
          <div>
            <span className="text-neutral-500 uppercase text-[10px] font-bold tracking-wider">Date of Invoice</span>
            <p className="font-bold text-neutral-800 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
          </div>
          <div>
            <span className="text-neutral-500 uppercase text-[10px] font-bold tracking-wider">Payment Method</span>
            <p className="font-bold text-neutral-800 mt-0.5 uppercase">{order.paymentMethod}</p>
          </div>
          <div>
            <span className="text-neutral-500 uppercase text-[10px] font-bold tracking-wider">Transaction Status</span>
            <p className="font-bold text-emerald-700 mt-0.5 uppercase">{order.paymentStatus}</p>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="py-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-neutral-300 text-neutral-950 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Product Description</th>
                  <th className="pb-3 text-right">SKU</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items.map((item, index) => (
                  <tr key={index} className="align-top">
                    <td className="py-4">
                      <p className="font-bold text-neutral-800">{item.product?.name || 'Creative Gear Piece'}</p>
                      <span className="text-[9px] text-neutral-500 uppercase">Brand: {item.product?.brand || 'Verified'}</span>
                      {item.variant && <p className="text-[9px] text-neutral-500 mt-0.5">Spec: {item.variant}</p>}
                    </td>
                    <td className="py-4 text-right font-mono font-bold text-neutral-700">
                      {item.sku || 'NIRA-MOCK-SKU'}
                    </td>
                    <td className="py-4 text-center font-bold text-neutral-800">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-right font-bold text-neutral-800">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-4 text-right font-bold text-neutral-950">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculations and QR Code */}
        <div className="flex flex-col sm:flex-row justify-between items-start pt-6 border-t border-neutral-200 gap-6">
          {/* Dynamic Verification QR Code */}
          <div className="flex items-center gap-3">
            <img src={qrCodeUrl} alt="Invoice Verification QR" className="w-24 h-24 border border-neutral-200 p-1 bg-white rounded-lg" />
            <div className="max-w-[200px]">
              <p className="text-[9px] font-bold uppercase text-neutral-500">Scan to Verify Invoice</p>
              <p className="text-[9px] text-neutral-400 leading-tight mt-0.5">Scan with any GST verification app to check official record integrity.</p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-bold text-neutral-800">{formatPrice(itemsSubtotal)}</span>
            </div>
            
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount ({order.couponApplied})</span>
                <span className="font-bold">- {formatPrice(order.discountAmount)}</span>
              </div>
            )}
            
            {/* Dynamic CGST/SGST/IGST rendering */}
            {(order.igst && order.igst > 0) ? (
              <div className="flex justify-between">
                <span className="text-neutral-500">IGST (18%)</span>
                <span className="font-bold text-neutral-800">{formatPrice(order.igst)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-neutral-500">CGST (9%)</span>
                  <span className="font-bold text-neutral-800">{formatPrice(order.cgst || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">SGST (9%)</span>
                  <span className="font-bold text-neutral-800">{formatPrice(order.sgst || 0)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <span className="text-neutral-500">Platform Fee</span>
              <span className="font-bold text-neutral-800">{formatPrice(order.platformFee || 0)}</span>
            </div>

            <div className="h-px bg-neutral-200 my-2" />
            
            <div className="flex justify-between font-bold text-sm text-neutral-950">
              <span>Grand Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-16 pt-8 border-t border-neutral-200 text-center text-[9px] text-neutral-500 space-y-2 leading-relaxed">
          <div className="flex items-center justify-center gap-1.5 font-bold text-neutral-700">
            <Shield className="w-3.5 h-3.5 text-neutral-700" />
            OFFICIAL DIGITAL TAX RECEIPT — NIRA6 GUARANTEED
          </div>
          <p>
            This invoice is generated electronically in compliance with Section 31 of the CGST Act, 2017. 
            All creative tools have passed 50+ inspection checks before leaving our central depots. 
            For warranty support or diagnostics tickets, please log in to your NIRA6 Creator Hub Dashboard.
          </p>
        </div>

      </div>
    </div>
  );
}
