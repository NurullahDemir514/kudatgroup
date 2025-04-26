"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Kullanım Koşulları ve Hizmet Şartları</h1>

                    <div className="prose prose-gray max-w-none">
                        <p className="text-sm text-gray-700 mb-8">Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">1. Giriş</h2>
                            <p className="mb-3 text-gray-900">Bu Kullanım Koşulları ve Hizmet Şartları (bundan sonra "Koşullar" olarak anılacaktır), Kudat Steel Jewelry web sitesi, mobil uygulama, Facebook uygulaması ve diğer platformlardaki hizmetlerimizi (bundan sonra topluca "Hizmet" olarak anılacaktır) kullanımınıza ilişkin şartları ve koşulları düzenler.</p>
                            <p className="text-gray-900">Hizmetimizi kullanarak, bu koşulları kabul etmiş sayılırsınız. Koşulları kabul etmediğiniz takdirde, hizmetimizi kullanmayınız.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">2. Tanımlar</h2>
                            <ul className="list-disc pl-6 mb-3 text-gray-900">
                                <li><strong>Şirket:</strong> Kudat Steel Jewelry ve ana şirketi olan Kudat Group</li>
                                <li><strong>Kullanıcı:</strong> Hizmeti kullanan herhangi bir kişi veya kuruluş</li>
                                <li><strong>Hizmet:</strong> Web sitesi, mobil uygulama, Facebook uygulaması ve diğer platformlardaki tüm hizmetlerimiz</li>
                                <li><strong>Facebook Uygulaması:</strong> Kudat Steel Jewelry'nin Facebook platformu üzerinde sunduğu uygulama</li>
                                <li><strong>Ürünler:</strong> Kudat Steel Jewelry tarafından satılan tüm takılar, aksesuarlar ve diğer ürünler</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">3. Hizmet Kullanım Şartları</h2>
                            <p className="mb-3 text-gray-900">Hizmetimizi kullanırken:</p>
                            <ul className="list-disc pl-6 mb-3 text-gray-900">
                                <li>Geçerli tüm yerel, ulusal ve uluslararası yasa ve yönetmeliklere uymayı kabul edersiniz.</li>
                                <li>Hizmeti yasa dışı veya yetkisiz amaçlar için kullanmamayı kabul edersiniz.</li>
                                <li>Hizmetin düzgün çalışmasını engelleyebilecek veya zarar verebilecek eylemlerden kaçınmayı kabul edersiniz.</li>
                                <li>Kişisel bilgilerinizin doğru ve güncel olduğunu garanti edersiniz.</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">4. Facebook Uygulaması Özel Hükümleri</h2>
                            <p className="mb-3 text-gray-900">Facebook uygulamamızı kullanırken:</p>
                            <ul className="list-disc pl-6 mb-3 text-gray-900">
                                <li>Facebook'un kendi kullanım koşullarına ve topluluk standartlarına uymayı kabul edersiniz.</li>
                                <li>Facebook hesabınızla bağlantılı bilgilere erişim izni verdiğinizi kabul edersiniz.</li>
                                <li>Uygulama üzerinden yapılan tüm işlemlerinizden bizzat sorumlu olduğunuzu kabul edersiniz.</li>
                                <li>Uygulama içinde paylaştığınız içeriklerin uygun, yasal ve başkalarının haklarını ihlal etmediğini garanti edersiniz.</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">5. Hesap Kaydı ve Güvenlik</h2>
                            <p className="mb-3 text-gray-900">Hizmetimizin bazı bölümleri, bir hesap açmanızı ve kayıt olmanızı gerektirebilir. Bu durumda:</p>
                            <ul className="list-disc pl-6 mb-3 text-gray-900">
                                <li>Doğru, güncel ve eksiksiz bilgi vermeyi kabul edersiniz.</li>
                                <li>Hesap bilgilerinizin gizliliğini korumak ve hesabınız altında gerçekleşen tüm faaliyetlerden sorumlu olmak sizin yükümlülüğünüzdedir.</li>
                                <li>Hesabınızın yetkisiz kullanımından şüpheleniyorsanız, bizi derhal bilgilendirmeyi kabul edersiniz.</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">6. Alım Satım Koşulları</h2>
                            <p className="mb-3 text-gray-900">Ürünlerimizi satın alırken:</p>
                            <ul className="list-disc pl-6 mb-3 text-gray-900">
                                <li>Ürün açıklamalarımızı dikkatlice okumanızı tavsiye ederiz.</li>
                                <li>Tüm fiyatlar Türk Lirası (TL) cinsinden belirtilmiştir ve vergiler dahildir.</li>
                                <li>Sipariş vermeniz, ürünleri satın alma teklifinizi temsil eder ve siparişiniz kabul edildiğinde bir alım-satım sözleşmesi kurulmuş olur.</li>
                                <li>Ödeme yöntemlerimiz ve teslimat koşullarımız hakkında detaylı bilgiyi web sitemizde bulabilirsiniz.</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">7. Fikri Mülkiyet Hakları</h2>
                            <p className="mb-3 text-gray-900">Hizmet ve içerikleri, Kudat Steel Jewelry'nin ve/veya lisans verenlerinin fikri mülkiyetidir.</p>
                            <p className="text-gray-900">Hizmet içeriğini kişisel ve ticari olmayan amaçlarla kullanabilirsiniz, ancak içeriği kopyalamak, değiştirmek, dağıtmak veya satmak için önceden yazılı izin almanız gerekmektedir.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">8. Sorumluluk Sınırlaması</h2>
                            <p className="mb-3 text-gray-900">Hizmetimizi kendi risk ve sorumluluğunuzda kullanırsınız. Hizmet "olduğu gibi" ve "mevcut olduğu sürece" sunulur.</p>
                            <p className="mb-3 text-gray-900">Yasaların izin verdiği ölçüde, Kudat Steel Jewelry ve bağlı şirketleri, her türlü açık veya zımni garantiyi reddeder ve hizmetimizi kullanımınızdan kaynaklanan herhangi bir zarardan sorumlu tutulamaz.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">9. Tazminat</h2>
                            <p className="text-gray-900">Bu Koşulları veya geçerli yasaları ihlal etmenizden kaynaklanan tüm talep, zarar, yükümlülük, maliyet ve giderlere karşı Kudat Steel Jewelry'yi, yöneticilerini, çalışanlarını ve acentelerini savunacak, tazmin edecek ve zarar görmesini engelleyeceğinizi kabul edersiniz.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">10. Koşullarda Değişiklik</h2>
                            <p className="mb-3 text-gray-900">Bu Koşulları herhangi bir zamanda değiştirme hakkını saklı tutarız. Değişiklikler, web sitemizde yayınlandığında yürürlüğe girer.</p>
                            <p className="text-gray-900">Değişikliklerden sonra hizmeti kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">11. Geçerli Yasa ve Anlaşmazlık Çözümü</h2>
                            <p className="mb-3 text-gray-900">Bu Koşullar Türkiye Cumhuriyeti yasalarına tabidir. Bu Koşullardan doğan herhangi bir anlaşmazlık, öncelikle dostane çözüm yoluyla, ardından arabuluculuk yoluyla çözülmeye çalışılacaktır.</p>
                            <p className="text-gray-900">Anlaşmazlık çözülemezse, Türkiye Cumhuriyeti mahkemelerinin münhasır yargı yetkisini kabul edersiniz.</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-xl font-semibold text-black mb-3">12. İletişim</h2>
                            <p className="mb-3 text-gray-900">Bu Koşullar hakkında sorularınız varsa, lütfen bizimle iletişime geçin:</p>
                            <p className="text-gray-900">E-posta: <a href="mailto:kurumsal@kudatgroup.com" className="text-blue-700 hover:text-blue-900 font-medium hover:underline">kurumsal@kudatgroup.com</a></p>
                            <p className="text-gray-900">Web sitesi: <a href="https://www.kudatgroup.com" className="text-blue-700 hover:text-blue-900 font-medium hover:underline">www.kudatgroup.com</a></p>
                        </section>
                    </div>

                    <div className="mt-8 text-center">
                        <Link href="/" className="inline-block px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 