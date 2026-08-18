import { NextResponse } from 'next/server';
import { forgeService } from '@/lib/services/forgeService';

export async function GET() {
  try {
    const products = await forgeService.getProducts();
    const printers = await forgeService.getPrinters();
    const filaments = await forgeService.getFilaments();

    return NextResponse.json({
      status: 'success',
      message: 'Forge Your Ideas seed data loaded successfully.',
      data: {
        productsCount: products.length,
        printersCount: printers.length,
        filamentsCount: filaments.length,
        sampleProduct: products[0],
        samplePrinter: printers[0],
        sampleFilament: filaments[0],
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch seed data';
    return NextResponse.json(
      { status: 'error', message: errorMessage },
      { status: 500 }
    );
  }
}
