import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cekilisId = searchParams.get('cekilisId');
    
    const supabase = createRouteHandlerClient({ cookies });

    let query = supabase
      .from('kazananlar')
      .select(`
        *,
        cekilis:cekilisler(id, ad, tarih)
      `);

    // Eğer çekiliş ID'si varsa, sadece o çekilişin kazananlarını getir
    if (cekilisId) {
      query = query.eq('cekilis_id', cekilisId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const { data, error } = await supabase
      .from('kazananlar')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Supabase hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from('kazananlar')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parametresi gerekli' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    const { error } = await supabase
      .from('kazananlar')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 