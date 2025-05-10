"use client";

import { useState, useEffect } from 'react';
import KazananYonetim from './kazananlar';

interface Cekilis {
  id: number;
  ad: string;
  tarih: string;
}

const CekilisYonetim = () => {
  const [cekilisler, setCekilisler] = useState<Cekilis[]>([]);
  const [formData, setFormData] = useState<Omit<Cekilis, 'id'>>({
    ad: '',
    tarih: new Date().toISOString().split('T')[0]
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCekilisId, setSelectedCekilisId] = useState<number | null>(null);

  useEffect(() => {
    fetchCekilisler();
  }, []);

  const fetchCekilisler = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/cekilisler');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${res.status}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (Array.isArray(data)) {
        setCekilisler(data);
      } else {
        console.error('API geçersiz veri döndürdü:', data);
        setError('Veri formatı geçersiz');
        setCekilisler([]);
      }
    } catch (error) {
      console.error('API hatası:', error);
      setError(error instanceof Error ? error.message : 'Veriler yüklenirken bir hata oluştu');
      setCekilisler([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editId ? 'PUT' : 'POST';
    const body = editId ? { ...formData, id: editId } : formData;

    try {
      const res = await fetch('/api/cekilisler', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await res.json();
      if (res.ok) {
        setFormData({
          ad: '',
          tarih: new Date().toISOString().split('T')[0]
        });
        setEditId(null);
        setIsModalOpen(false);
        fetchCekilisler();
      } else {
        alert(result.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Hata:', error);
    }
  };

  const handleEdit = (c: Cekilis) => {
    setFormData({
      ad: c.ad,
      tarih: new Date(c.tarih).toISOString().split('T')[0]
    });
    setEditId(c.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Silmek istediğine emin misin?')) {
      try {
        const res = await fetch(`/api/cekilisler?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchCekilisler();
          if (selectedCekilisId === id) {
            setSelectedCekilisId(null);
          }
        }
      } catch (error) {
        console.error('Hata:', error);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-gray-100">
      <div className="h-full w-full px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Çekiliş Yönetimi</h1>
          <button
            onClick={() => {
              setFormData({
                ad: '',
                tarih: new Date().toISOString().split('T')[0]
              });
              setEditId(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg shadow-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-purple-500 transition-all"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Çekiliş Ekle
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-900 bg-opacity-20 border-l-4 border-red-500 p-4 rounded-r">
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
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : cekilisler.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 bg-opacity-50 rounded-xl shadow-2xl backdrop-blur-sm min-h-96 flex items-center justify-center border border-gray-800">
            <div>
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-200">Henüz çekiliş bulunmuyor</h3>
              <p className="mt-2 text-gray-400">Yeni bir çekiliş ekleyerek başlayın.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {cekilisler.map(cekilis => (
              <div
                key={cekilis.id}
                className={`bg-gray-900 bg-opacity-70 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 border border-gray-800 hover:border-gray-700 ${
                  selectedCekilisId === cekilis.id ? 'ring-2 ring-purple-500 shadow-purple-900/20' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-100">{cekilis.ad}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(cekilis.tarih).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedCekilisId(selectedCekilisId === cekilis.id ? null : cekilis.id)}
                        className="px-4 py-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        {selectedCekilisId === cekilis.id ? 'Kapat' : 'Kazananları Gör'}
                      </button>
                      <button
                        onClick={() => handleEdit(cekilis)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Düzenle"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(cekilis.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Sil"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                {selectedCekilisId === cekilis.id && (
                  <div className="border-t border-gray-800 bg-gray-900 bg-opacity-50">
                    <KazananYonetim cekilisId={cekilis.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-100">
                  {editId ? 'Çekiliş Düzenle' : 'Yeni Çekiliş Ekle'}
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Çekiliş Adı</label>
                  <input
                    type="text"
                    name="ad"
                    value={formData.ad}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tarih</label>
                  <input
                    type="date"
                    name="tarih"
                    value={formData.tarih}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
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

export default CekilisYonetim;