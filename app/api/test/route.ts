import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Test API başlatılıyor...');
    
    // Supabase bağlantı bilgilerini kontrol et
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key var mı:', !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase bağlantı bilgileri eksik',
        url: supabaseUrl,
        hasKey: !!supabaseKey
      }, { status: 500 });
    }

    // Yeni bir Supabase istemcisi oluştur
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test verisi ekle
    const { data: insertData, error: insertError } = await supabase
      .from('kazananlar')
      .insert([
        {
          hesap_adi: 'Test Kullanıcı 1',
          ad_soyad: 'Test Ad Soyad 1',
          tel: '5551234567',
          adres: 'Test Adres 1',
          notlar: 'Test Not 1'
        },
        {
          hesap_adi: 'Test Kullanıcı 2',
          ad_soyad: 'Test Ad Soyad 2',
          tel: '5559876543',
          adres: 'Test Adres 2',
          notlar: 'Test Not 2'
        }
      ])
      .select();

    if (insertError) {
      console.error('Veri ekleme hatası:', insertError);
      return NextResponse.json({
        status: 'error',
        message: 'Test verisi eklenemedi',
        error: insertError
      }, { status: 500 });
    }

    // Eklenen verileri kontrol et
    const { data, error } = await supabase
      .from('kazananlar')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Veri çekme hatası:', error);
      return NextResponse.json({
        status: 'error',
        message: 'Veriler alınamadı',
        error: error
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Test verileri eklendi ve kontrol edildi',
      insertedData: insertData,
      allData: data
    });

  } catch (error) {
    console.error('Genel hata:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Beklenmeyen hata',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
} 