"use client";

import { useState, useEffect } from 'react';

interface Cekilis {
  id: number;
  ad: string;
  tarih: string;
}

interface Kazanan {
  id: number;
  created_at: string;
  hesap_adi: string;
  ad_soyad: string;
  tel: string;
  adres: string;
  notlar: string;
  cekilis_id: number;
  cekilis: Cekilis;
}

interface KazananYonetimProps {
  cekilisId?: number;
}

const KazananYonetim = ({ cekilisId }: KazananYonetimProps) => {
  const [kazananlar, setKazananlar] = useState<Kazanan[]>([]);
  const [formData, setFormData] = useState<Omit<Kazanan, 'id' | 'created_at' | 'cekilis'>>({
    hesap_adi: '',
    ad_soyad: '',
    tel: '',
    adres: '',
    notlar: '',
    cekilis_id: cekilisId || 0
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKazananlar();
  }, [cekilisId]);

  const fetchKazananlar = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('API çağrısı başlatılıyor...');
      
      const url = cekilisId 
        ? `/api/kazananlar?cekilisId=${cekilisId}`
        : '/api/kazananlar';
      
      const res = await fetch(url);
      console.log('API yanıtı:', res.status, res.statusText);
      
      const data = await res.json();
      console.log('API verisi:', data);

      if (!res.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${res.status}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (Array.isArray(data)) {
        setKazananlar(data);
      } else {
        console.error('API geçersiz veri döndürdü:', data);
        setError('Veri formatı geçersiz');
        setKazananlar([]);
      }
    } catch (error) {
      console.error('API hatası:', error);
      setError(error instanceof Error ? error.message : 'Veriler yüklenirken bir hata oluştu');
      setKazananlar([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editId ? 'PUT' : 'POST';
    const body = editId ? { ...formData, id: editId } : formData;

    try {
      const res = await fetch('/api/kazananlar', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await res.json();
      if (res.ok) {
        setFormData({ 
          hesap_adi: '', 
          ad_soyad: '', 
          tel: '', 
          adres: '', 
          notlar: '',
          cekilis_id: cekilisId || 0
        });
        setEditId(null);
        setIsModalOpen(false);
        fetchKazananlar();
      } else {
        alert(result.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  const handleEdit = (k: Kazanan) => {
    setFormData({
      hesap_adi: k.hesap_adi,
      ad_soyad: k.ad_soyad,
      tel: k.tel,
      adres: k.adres,
      notlar: k.notlar,
      cekilis_id: k.cekilis_id
    });
    setEditId(k.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Silmek istediğine emin misin?')) {
      try {
        const res = await fetch(`/api/kazananlar?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchKazananlar();
        }
      } catch (error) {
        console.error('Hata:', error);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kazanan Yönetimi</h1>
          <button
            onClick={() => {
              setFormData({ 
                hesap_adi: '', 
                ad_soyad: '', 
                tel: '', 
                adres: '', 
                notlar: '',
                cekilis_id: cekilisId || 0
              });
              setEditId(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Kazanan Ekle
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : kazananlar.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm min-h-[calc(100vh-200px)] flex items-center justify-center">
            <div>
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Henüz kazanan bulunmuyor</h3>
              <p className="mt-2 text-sm text-gray-500">Yeni bir kazanan ekleyerek başlayın.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Çekiliş
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hesap Adı
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ad Soyad
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefon
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adres
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notlar
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kazananlar.map((kazanan) => (
                    <tr key={kazanan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{kazanan.cekilis?.ad}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(kazanan.cekilis?.tarih || '').toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-lg font-semibold text-blue-600">
                                {kazanan.hesap_adi.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{kazanan.hesap_adi}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{kazanan.ad_soyad}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{kazanan.tel}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{kazanan.adres}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{kazanan.notlar}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(kazanan)}
                          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(kazanan.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editId ? 'Kazanan Düzenle' : 'Yeni Kazanan Ekle'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Adı</label>
                  <input
                    type="text"
                    name="hesap_adi"
                    value={formData.hesap_adi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    name="ad_soyad"
                    value={formData.ad_soyad}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    name="tel"
                    value={formData.tel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                  <input
                    type="text"
                    name="adres"
                    value={formData.adres}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Not</label>
                  <textarea
                    name="notlar"
                    value={formData.notlar}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {editId ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KazananYonetim;
