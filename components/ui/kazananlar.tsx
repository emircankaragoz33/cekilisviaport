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
  const [filteredKazananlar, setFilteredKazananlar] = useState<Kazanan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
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
    if (cekilisId) {
      fetchKazananlar();
      // Form verilerini güncelle
      setFormData(prev => ({
        ...prev,
        cekilis_id: cekilisId
      }));
    }
  }, [cekilisId]);

  useEffect(() => {
    const filtered = kazananlar
      .filter(kazanan => 
        kazanan.hesap_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kazanan.ad_soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kazanan.tel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kazanan.adres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kazanan.notlar.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.hesap_adi.localeCompare(b.hesap_adi, 'tr'));
    setFilteredKazananlar(filtered);
  }, [searchTerm, kazananlar]);

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
        // Sadece ilgili çekiliş ID'sine sahip kazananları filtrele
        const filteredKazananlar = data.filter(k => k.cekilis_id === cekilisId);
        setKazananlar(filteredKazananlar);
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

    if (!cekilisId) {
      alert('Çekiliş ID bulunamadı!');
      return;
    }

    const method = editId ? 'PUT' : 'POST';
    const body = editId 
      ? { ...formData, id: editId, cekilis_id: cekilisId }
      : { ...formData, cekilis_id: cekilisId };

    try {
      const res = await fetch('/api/kazananlar', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await res.json();
      
      if (!res.ok) {
        // API'den gelen hata mesajını göster
        alert(result.error || 'Bir hata oluştu');
        return;
      }

      setFormData({ 
        hesap_adi: '', 
        ad_soyad: '', 
        tel: '', 
        adres: '', 
        notlar: '',
        cekilis_id: cekilisId
      });
      setEditId(null);
      setIsModalOpen(false);
      fetchKazananlar();
    } catch (error) {
      console.error('Hata:', error);
      alert('Bir hata oluştu');
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

  const copyDMMessage = (hesapAdi: string) => {
    const message = `Merhaba @${hesapAdi}, çekilişimizi kazandınız! 🎉\n\nDetaylı bilgi için DM'den ulaşabilirsiniz.`;
    navigator.clipboard.writeText(message);
    setCopiedMessage(hesapAdi);
    setTimeout(() => setCopiedMessage(null), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <div className="h-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Kazanan Yönetimi</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
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
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-lg shadow-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-purple-500 transition-all"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Kazanan Ekle
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : kazananlar.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/30 backdrop-blur-sm rounded-xl shadow-2xl min-h-[calc(100vh-200px)] flex items-center justify-center border border-gray-800/50">
            <div>
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-200">Henüz kazanan bulunmuyor</h3>
              <p className="mt-2 text-gray-400">Yeni bir kazanan ekleyerek başlayın.</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-800/50">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800/50">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Hesap Adı
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Ad Soyad
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Telefon
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Adres
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Notlar
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900/20 divide-y divide-gray-800/50">
                  {filteredKazananlar.map((kazanan) => (
                    <tr key={kazanan.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-900 flex items-center justify-center">
                              <span className="text-base sm:text-lg font-semibold text-purple-300">
                                {kazanan.hesap_adi.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <a 
                              href={`https://x.com/${kazanan.hesap_adi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-gray-100 hover:text-purple-400 transition-colors"
                            >
                              {kazanan.hesap_adi}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-100">{kazanan.ad_soyad}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-100">{kazanan.tel}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-gray-100 max-w-[200px] truncate">{kazanan.adres}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-gray-100 max-w-[200px] truncate">{kazanan.notlar}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => copyDMMessage(kazanan.hesap_adi)}
                            className={`text-green-400 hover:text-green-300 transition-colors relative group ${copiedMessage === kazanan.hesap_adi ? 'text-green-300' : ''}`}
                            title="DM Mesajını Kopyala"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {copiedMessage === kazanan.hesap_adi ? 'Kopyalandı!' : 'DM Mesajını Kopyala'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleEdit(kazanan)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(kazanan.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-100">
                  {editId ? 'Kazanan Düzenle' : 'Yeni Kazanan Ekle'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Hesap Adı</label>
                  <input
                    type="text"
                    name="hesap_adi"
                    value={formData.hesap_adi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    name="ad_soyad"
                    value={formData.ad_soyad}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Telefon</label>
                  <input
                    type="tel"
                    name="tel"
                    value={formData.tel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Adres</label>
                  <textarea
                    name="adres"
                    value={formData.adres}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notlar</label>
                  <textarea
                    name="notlar"
                    value={formData.notlar}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg"
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
