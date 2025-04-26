"use client";

import Link from "next/link";

export default function DataDeletionPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-black mb-6">Veri Silme Talimatları</h1>

                    <div className="prose prose-gray max-w-none">
                        <section className="mb-6">
                            <p className="mb-6 text-gray-900">Kudat Steel Jewelry olarak, gizliliğinize saygı duyuyoruz ve kişisel verileriniz üzerindeki kontrolünüzü önemsiyoruz. Bu sayfa, kişisel verilerinizin sistemlerimizden nasıl silinebileceği konusunda bilgiler sunmaktadır.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">Facebook Uygulaması Veri Silme</h2>
                            <p className="mb-3 text-gray-900">Facebook uygulaması üzerinden topladığımız verilerinizi silmek için aşağıdaki adımları takip edebilirsiniz:</p>
                            <ol className="list-decimal pl-6 mb-3 space-y-2">
                                <li className="text-gray-900">Facebook hesabınıza giriş yapın</li>
                                <li className="text-gray-900">Sağ üst köşedeki profil resminize tıklayın ve "Ayarlar ve Gizlilik" &gt; "Ayarlar" seçeneğini seçin</li>
                                <li className="text-gray-900">Sol menüden "Uygulamalar ve Web Siteleri" seçeneğine tıklayın</li>
                                <li className="text-gray-900">"Kudat Steel Jewelry" uygulamasını bulun ve "Kaldır" düğmesine tıklayın</li>
                                <li className="text-gray-900">Onay penceresinde "Etkinliği Sil" seçeneğini işaretleyin</li>
                                <li className="text-gray-900">Son olarak "Kaldır" düğmesine tıklayarak işlemi tamamlayın</li>
                            </ol>
                            <p className="mb-3 text-black">Bu adımları takip ederek Facebook uygulaması üzerinden toplanan verileriniz silinecektir.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">Web Sitesi ve Diğer Platformlardaki Veriler</h2>
                            <p className="mb-3 text-black">Web sitemiz ve diğer platformlardaki verilerinizi silmek için aşağıdaki seçeneklerden birini kullanabilirsiniz:</p>
                            <ol className="list-decimal pl-6 mb-3 space-y-2 text-gray-900">
                                <li>
                                    <strong>E-posta Talebi:</strong> Verilerinizin silinmesi için
                                    <a href="mailto:kurumsal@kudatgroup.com" className="text-teal-600 hover:text-teal-800 font-medium hover:underline mx-1">kurumsal@kudatgroup.com</a>
                                    adresine e-posta gönderebilirsiniz. E-postanızda:
                                    <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-900">
                                        <li>Konu başlığı olarak "Veri Silme Talebi" yazın</li>
                                        <li>Adınız ve soyadınız</li>
                                        <li>Kullandığınız e-posta adresi</li>
                                        <li>Telefon numaranız</li>
                                        <li>Silmek istediğiniz veri türleri</li>
                                    </ul>
                                    <p className="mt-2 text-gray-900">bilgilerini ekleyin. Talebiniz en geç 30 gün içinde işleme alınacaktır.</p>
                                </li>
                                <li>
                                    <strong>Veri Sahibi Başvuru Formu:</strong> Web sitemizdeki "Veri Sahibi Başvuru Formu"nu doldurabilirsiniz. Bu form, KVKK kapsamındaki haklarınızı kullanmak için gereken tüm seçenekleri içerir.
                                </li>
                            </ol>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">Veri Silme Süreci</h2>
                            <p className="mb-3 text-black">Veri silme talebiniz alındıktan sonra:</p>
                            <ol className="list-decimal pl-6 mb-3 space-y-2 text-gray-900">
                                <li>Talebiniz 30 gün içinde işleme alınacaktır</li>
                                <li>Kimliğinizin doğrulanması için ek bilgiler istenebilir</li>
                                <li>Yasal saklama yükümlülüklerimize tabi veriler hariç, tüm kişisel verileriniz silinecek veya anonimleştirilecektir</li>
                                <li>İşlem tamamlandığında size bilgilendirme yapılacaktır</li>
                            </ol>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">Yasal Saklama Yükümlülükleri</h2>
                            <p className="mb-3 text-black">Bazı veriler, yasal saklama yükümlülüklerimiz nedeniyle belirli bir süre boyunca saklanmak zorundadır. Bu tür veriler şunları içerebilir:</p>
                            <ul className="list-disc pl-6 mb-3 space-y-1 text-gray-900">
                                <li>Fatura ve ödeme bilgileri (5 yıl)</li>
                                <li>Sipariş ve teslimat kayıtları (3 yıl)</li>
                                <li>Vergi ilişkili belgeler (5 yıl)</li>
                            </ul>
                            <p className="text-black">Bu sürelerin sonunda, bu veriler de otomatik olarak silinecek veya anonimleştirilecektir.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">Sorular ve İletişim</h2>
                            <p className="text-black">Veri silme süreci veya kişisel verilerinizle ilgili başka sorularınız varsa, lütfen bizimle iletişime geçmekten çekinmeyin:</p>
                            <div className="mt-3">
                                <p>E-posta: <a href="mailto:kurumsal@kudatgroup.com" className="text-teal-600 hover:text-teal-800 font-medium hover:underline">kurumsal@kudatgroup.com</a></p>
                                <p>Web sitesi: <a href="https://www.kudatgroup.com" className="text-teal-600 hover:text-teal-800 font-medium hover:underline">www.kudatgroup.com</a></p>
                            </div>
                        </section>
                    </div>

                    <div className="mt-8 text-center">
                        <Link href="/" className="inline-block px-5 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 