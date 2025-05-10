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

    console.log('Gelen veri:', body);

    // Hesap adı boş mu kontrolü
    if (!body.hesap_adi || body.hesap_adi.trim() === '') {
      return NextResponse.json(
        { error: 'Hesap adı boş olamaz!' },
        { status: 400 }
      );
    }

    // Önce aynı hesap adının başka çekilişlerde olup olmadığını kontrol et
    const { data: existingKazananlar, error: checkError } = await supabase
      .from('kazananlar')
      .select('id, cekilis_id, hesap_adi')
      .eq('hesap_adi', body.hesap_adi.trim());

    console.log('Mevcut kazananlar:', existingKazananlar);

    if (checkError) {
      console.error('Kontrol hatası:', checkError);
      return NextResponse.json({ error: 'Hesap adı kontrolü yapılamadı' }, { status: 500 });
    }

    if (existingKazananlar && existingKazananlar.length > 0) {
      console.log('Aynı hesap adı bulundu:', existingKazananlar);
      return NextResponse.json(
        { error: 'Bu hesap adı başka bir çekilişte kullanılıyor!' },
        { status: 400 }
      );
    }

    // Yeni kazananı ekle
    const { data, error } = await supabase
      .from('kazananlar')
      .insert([{
        ...body,
        hesap_adi: body.hesap_adi.trim()
      }])
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

    console.log('Güncellenecek veri:', { id, ...updateData });

    // Hesap adı boş mu kontrolü
    if (!updateData.hesap_adi || updateData.hesap_adi.trim() === '') {
      return NextResponse.json(
        { error: 'Hesap adı boş olamaz!' },
        { status: 400 }
      );
    }

    // Önce aynı hesap adının başka çekilişlerde olup olmadığını kontrol et
    const { data: existingKazananlar, error: checkError } = await supabase
      .from('kazananlar')
      .select('id, cekilis_id, hesap_adi')
      .eq('hesap_adi', updateData.hesap_adi.trim())
      .neq('id', id);

    console.log('Mevcut kazananlar:', existingKazananlar);

    if (checkError) {
      console.error('Kontrol hatası:', checkError);
      return NextResponse.json({ error: 'Hesap adı kontrolü yapılamadı' }, { status: 500 });
    }

    if (existingKazananlar && existingKazananlar.length > 0) {
      console.log('Aynı hesap adı bulundu:', existingKazananlar);
      return NextResponse.json(
        { error: 'Bu hesap adı başka bir çekilişte kullanılıyor!' },
        { status: 400 }
      );
    }

    // Kazananı güncelle
    const { data, error } = await supabase
      .from('kazananlar')
      .update({
        ...updateData,
        hesap_adi: updateData.hesap_adi.trim()
      })
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