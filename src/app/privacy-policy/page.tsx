"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-black mb-6">Gizlilik Politikası</h1>

                    <div className="prose prose-gray max-w-none">
                        <p className="text-sm text-gray-700 mb-8">Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">1. Giriş</h2>
                            <p className="mb-3 text-gray-900">Kudat Steel Jewelry olarak, gizliliğinize saygı duyuyoruz ve kişisel verilerinizin korunmasını önemsiyoruz. Bu gizlilik politikası, sizden topladığımız bilgileri nasıl kullandığımızı, koruduğumuzu ve işlediğimizi açıklar.</p>
                            <p className="text-gray-900">Bu politika, web sitemizi, mobil uygulamalarımızı, sosyal medya hesaplarımızı ve diğer dijital hizmetlerimizi kullanan tüm müşterilerimiz için geçerlidir.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">2. Toplanan Bilgiler</h2>
                            <p className="mb-3 text-gray-900">Sizden aşağıdaki bilgileri toplayabiliriz:</p>
                            <ul className="list-disc pl-6 mb-3 text-gray-900">
                                <li>Ad ve soyad</li>
                                <li>İletişim bilgileri (telefon numarası, e-posta adresi)</li>
                                <li>Adres bilgileri (şehir, ilçe, sokak, bina no)</li>
                                <li>Şirket adı ve vergi numarası (varsa)</li>
                                <li>Facebook ve diğer sosyal medya hesaplarınız üzerinden paylaştığınız bilgiler</li>
                            </ul>
                            <p className="text-gray-900">Facebook Login kullanmanız durumunda, Facebook tarafından sağlanan adınız, e-posta adresiniz ve profil resminiz gibi temel bilgilere erişim sağlayabiliriz.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">3. Bilgilerin Kullanımı</h2>
                            <p className="mb-3 text-gray-900">Topladığımız bilgileri aşağıdaki amaçlar için kullanırız:</p>
                            <ul className="list-disc pl-6 mb-3 text-gray-900">
                                <li>Sizinle iletişim kurmak</li>
                                <li>Ürün ve hizmetlerimiz hakkında bilgilendirmek</li>
                                <li>Kampanya ve tekliflerimizi paylaşmak</li>
                                <li>Ürün teslimatı ve sipariş yönetimi</li>
                                <li>Ürünlerimizi ve hizmetlerimizi geliştirmek</li>
                                <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">4. Bilgi Paylaşımı</h2>
                            <p className="mb-3 text-gray-900">Kişisel bilgilerinizi, yasal yükümlülüklerimizi yerine getirmek, hizmetlerimizi sağlamak ve haklarımızı korumak için paylaşabiliriz. Bilgilerinizi aşağıdaki taraflarla paylaşabiliriz:</p>
                            <ul className="list-disc pl-6 mb-3 text-gray-900">
                                <li>Hizmet sağlayıcılarımız (kargo şirketleri, ödeme sistemleri vb.)</li>
                                <li>İş ortaklarımız</li>
                                <li>Yasal otoriteler ve düzenleyici kurumlar</li>
                            </ul>
                            <p className="text-gray-900">Bilgilerinizi pazarlama amaçlı üçüncü taraflarla paylaşmayız ve satmayız.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">5. Çerezler ve Takip Teknolojileri</h2>
                            <p className="mb-3 text-gray-900">Web sitemizde ve sosyal medya platformlarında deneyiminizi geliştirmek için çerezler ve benzer teknolojiler kullanıyoruz. Bunlar aşağıdaki amaçlarla kullanılır:</p>
                            <ul className="list-disc pl-6 mb-3 text-gray-900">
                                <li>Oturum yönetimi</li>
                                <li>Kullanıcı tercihlerinin hatırlanması</li>
                                <li>Site analizi ve performans ölçümü</li>
                                <li>Hedefli reklamcılık</li>
                            </ul>
                            <p className="text-gray-900">Çerezleri tarayıcı ayarlarınızdan kontrol edebilir veya devre dışı bırakabilirsiniz.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">6. Veri Güvenliği</h2>
                            <p className="mb-3 text-gray-900">Kişisel verilerinizi korumak için uygun teknik ve organizasyonel önlemler alıyoruz. Ancak, internet üzerinden veri iletiminin tamamen güvenli olmadığını unutmayın.</p>
                            <p className="text-gray-900">Sistemlerimiz düzenli olarak güncellenmekte ve denetlenmektedir.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">7. Saklama Süresi</h2>
                            <p className="text-gray-900">Kişisel verilerinizi, hizmetlerimizi sunmak için gerekli olan süre boyunca veya yasal yükümlülüklerimizi yerine getirmek için gerekli olan süre boyunca saklarız.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">8. Haklarınız</h2>
                            <p className="mb-3 text-gray-900">KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında aşağıdaki haklara sahipsiniz:</p>
                            <ul className="list-disc pl-6 mb-3 text-gray-900">
                                <li>Verilerinizin işlenip işlenmediğini öğrenme</li>
                                <li>Verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                                <li>Verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                                <li>Yurt içinde veya yurt dışında verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                                <li>Verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                                <li>İşlenmesini gerektiren sebepler ortadan kalkmışsa verilerinizin silinmesini veya yok edilmesini isteme</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">9. Facebook Veri Politikası</h2>
                            <p className="mb-3 text-gray-900">Facebook uygulaması üzerinden hizmetlerimizi kullanırken, Facebook'un kendi veri politikası da geçerlidir. Facebook'un gizlilik politikası hakkında daha fazla bilgi için <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 font-medium hover:underline">https://www.facebook.com/privacy/policy/</a> adresini ziyaret edebilirsiniz.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">10. İletişim</h2>
                            <p className="mb-3 text-gray-900">Gizlilik politikamız veya kişisel verilerinizle ilgili sorularınız için bizimle iletişime geçebilirsiniz:</p>
                            <p className="text-gray-900">E-posta: <a href="mailto:kurumsal@kudatgroup.com" className="text-teal-600 hover:text-teal-800 font-medium hover:underline">kurumsal@kudatgroup.com</a></p>
                            <p className="text-gray-900">Web sitesi: <a href="https://www.kudatgroup.com" className="text-teal-600 hover:text-teal-800 font-medium hover:underline">www.kudatgroup.com</a></p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-black mb-3">11. Değişiklikler</h2>
                            <p className="text-gray-900">Bu gizlilik politikasını dilediğimiz zaman güncelleyebiliriz. Değişiklikler, web sitemizde yayınlandıktan sonra geçerli olacaktır. Önemli değişiklikler olduğunda sizi bilgilendireceğiz.</p>
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