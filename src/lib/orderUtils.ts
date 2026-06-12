import Counter from '@/models/Counter';
import dbConnect from './db/mongodb';
import OrderAuditLog from '@/models/OrderAuditLog';

/**
 * Gets the next sequential number for a given daily key
 */
export async function getNextSequenceValue(sequenceName: string): Promise<number> {
  await dbConnect();
  const sequenceDocument = await Counter.findOneAndUpdate(
    { id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
}

/**
 * Generates daily sequential order ID: NIRA6-YYYYMMDD-XXXX
 */
export async function generateOrderId(): Promise<string> {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;
  
  const seqName = `order-${dateStr}`;
  const seq = await getNextSequenceValue(seqName);
  const paddedSeq = String(seq).padStart(4, '0');
  
  return `NIRA6-${dateStr}-${paddedSeq}`;
}

/**
 * Generates daily sequential invoice number: INV-YYYYMMDD-XXXX
 */
export async function generateInvoiceNumber(): Promise<string> {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;
  
  const seqName = `invoice-${dateStr}`;
  const seq = await getNextSequenceValue(seqName);
  const paddedSeq = String(seq).padStart(4, '0');
  
  return `INV-${dateStr}-${paddedSeq}`;
}

/**
 * Helper to log an audit event for an order
 */
export async function logOrderAudit({
  orderId,
  orderObjectId,
  eventName,
  notes,
  operator = 'System',
  role = 'system',
  ipAddress = '127.0.0.1'
}: {
  orderId: string;
  orderObjectId?: string;
  eventName: string;
  notes: string;
  operator?: string;
  role?: string;
  ipAddress?: string;
}) {
  try {
    await dbConnect();
    await OrderAuditLog.create({
      orderId,
      orderObjectId,
      eventName,
      notes,
      operator,
      role,
      ipAddress
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
