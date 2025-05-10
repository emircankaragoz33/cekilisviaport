import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from('cekilisler')
      .select('*')
      .order('tarih', { ascending: false });

    if (error) {
      console.error('Veri çekme hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Beklenmeyen hata:', error);
    return NextResponse.json(
      { error: 'Veriler alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ad, tarih } = body;

    if (!ad || !tarih) {
      return NextResponse.json(
        { error: 'Çekiliş adı ve tarihi gereklidir' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cekilisler')
      .insert([{ ad, tarih }])
      .select();

    if (error) {
      console.error('Veri ekleme hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Beklenmeyen hata:', error);
    return NextResponse.json(
      { error: 'Veri eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ad, tarih } = body;

    if (!ad || !tarih) {
      return NextResponse.json(
        { error: 'Çekiliş adı ve tarihi gereklidir' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('cekilisler')
      .update({ ad, tarih })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Veri güncelleme hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Beklenmeyen hata:', error);
    return NextResponse.json(
      { error: 'Veri güncellenirken bir hata oluştu' },
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
        { error: 'ID parametresi gereklidir' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('cekilisler')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Veri silme hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Çekiliş başarıyla silindi' });
  } catch (error) {
    console.error('Beklenmeyen hata:', error);
    return NextResponse.json(
      { error: 'Veri silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 