import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('GET /api/kazananlar - Başlatılıyor...');

    // Verileri çek
    const { data, error } = await supabase
      .from('kazananlar')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Veri çekme hatası:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 500 });
    }

    console.log('Çekilen veri:', data);

    // Veri yapısını kontrol et
    if (!data) {
      console.log('Veri null veya undefined');
      return NextResponse.json([]);
    }

    if (!Array.isArray(data)) {
      console.error('Veri dizi değil:', typeof data);
      return NextResponse.json([]);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Genel hata:', error);
    return NextResponse.json({ 
      error: 'Kazananlar getirilemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/kazananlar - Başlatılıyor...');
    const body = await request.json();
    console.log('Gelen veri:', body);

    const { data, error } = await supabase
      .from('kazananlar')
      .insert([
        {
          hesap_adi: body.hesap_adi,
          ad_soyad: body.ad_soyad,
          tel: body.tel,
          adres: body.adres,
          notlar: body.notlar
        }
      ])
      .select();

    if (error) {
      console.error('Veri ekleme hatası:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 500 });
    }

    console.log('Eklenen veri:', data);
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Genel hata:', error);
    return NextResponse.json({ 
      error: 'Kazanan eklenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    console.log('PUT /api/kazananlar - Başlatılıyor...');
    const body = await request.json();
    console.log('Güncellenecek veri:', body);

    const { data, error } = await supabase
      .from('kazananlar')
      .update({
        hesap_adi: body.hesap_adi,
        ad_soyad: body.ad_soyad,
        tel: body.tel,
        adres: body.adres,
        notlar: body.notlar
      })
      .eq('id', body.id)
      .select();

    if (error) {
      console.error('Veri güncelleme hatası:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 500 });
    }

    console.log('Güncellenen veri:', data);
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Genel hata:', error);
    return NextResponse.json({ 
      error: 'Kazanan güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('DELETE /api/kazananlar - Başlatılıyor...');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('Silinecek ID:', id);

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }

    const { error } = await supabase
      .from('kazananlar')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Veri silme hatası:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 500 });
    }

    console.log('Veri başarıyla silindi');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Genel hata:', error);
    return NextResponse.json({ 
      error: 'Kazanan silinemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 