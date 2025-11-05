export const dynamic = 'force-dynamic';

export default function FirebaseSetupPage() {
    return (
        <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}>
                <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '30px' }}>
                    🔥 Firebase Firestore Etkinleştirme
                </h1>
                
                <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    padding: '15px',
                    borderRadius: '6px',
                    margin: '20px 0',
                }}>
                    <h3>📋 Proje Bilgileri</h3>
                    <p><strong>Project ID:</strong> <code style={{ background: '#f1f3f4', padding: '2px 6px', borderRadius: '3px' }}>kudat-bulten-app</code></p>
                    <p><strong>Project Number:</strong> <code style={{ background: '#f1f3f4', padding: '2px 6px', borderRadius: '3px' }}>469680851853</code></p>
                </div>

                <h2>🚀 Adım Adım Kurulum</h2>
                
                <div style={{
                    background: '#f8f9fa',
                    borderLeft: '4px solid #667eea',
                    padding: '15px',
                    margin: '15px 0',
                    borderRadius: '4px',
                }}>
                    <span style={{ fontWeight: 'bold', color: '#667eea' }}>1.</span>
                    <strong> Firebase Console&apos;a gidin</strong><br />
                    <a 
                        href="https://console.firebase.google.com/project/kudat-bulten-app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            background: '#667eea',
                            color: 'white',
                            padding: '12px 24px',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            margin: '10px 5px',
                        }}
                    >
                        Firebase Console&apos;u Aç
                    </a>
                </div>

                <div style={{
                    background: '#f8f9fa',
                    borderLeft: '4px solid #667eea',
                    padding: '15px',
                    margin: '15px 0',
                    borderRadius: '4px',
                }}>
                    <span style={{ fontWeight: 'bold', color: '#667eea' }}>2.</span>
                    <strong> Firestore Database&apos;i seçin</strong><br />
                    Sol menüden &quot;Firestore Database&quot; tıklayın
                </div>

                <div style={{
                    background: '#f8f9fa',
                    borderLeft: '4px solid #667eea',
                    padding: '15px',
                    margin: '15px 0',
                    borderRadius: '4px',
                }}>
                    <span style={{ fontWeight: 'bold', color: '#667eea' }}>3.</span>
                    <strong> Veritabanı oluşturun</strong><br />
                    &quot;Create database&quot; butonuna tıklayın
                </div>

                <div style={{
                    background: '#f8f9fa',
                    borderLeft: '4px solid #667eea',
                    padding: '15px',
                    margin: '15px 0',
                    borderRadius: '4px',
                }}>
                    <span style={{ fontWeight: 'bold', color: '#667eea' }}>4.</span>
                    <strong> Test mode seçin</strong><br />
                    &quot;Start in test mode&quot; seçin (development için güvenli)
                </div>

                <div style={{
                    background: '#f8f9fa',
                    borderLeft: '4px solid #667eea',
                    padding: '15px',
                    margin: '15px 0',
                    borderRadius: '4px',
                }}>
                    <span style={{ fontWeight: 'bold', color: '#667eea' }}>5.</span>
                    <strong> Location seçin</strong><br />
                    <code style={{ background: '#f1f3f4', padding: '2px 6px', borderRadius: '3px' }}>europe-west1</code> önerilir (Türkiye&apos;ye yakın)
                </div>

                <div style={{
                    background: '#f8f9fa',
                    borderLeft: '4px solid #667eea',
                    padding: '15px',
                    margin: '15px 0',
                    borderRadius: '4px',
                }}>
                    <span style={{ fontWeight: 'bold', color: '#667eea' }}>6.</span>
                    <strong> Tamamlayın</strong><br />
                    &quot;Done&quot; tıklayın
                </div>

                <div style={{
                    background: '#e8f5e8',
                    border: '1px solid #4caf50',
                    padding: '20px',
                    borderRadius: '8px',
                    marginTop: '30px',
                }}>
                    <h3>🧪 Test API&apos;leri</h3>
                    <p>Firestore etkinleştirildikten sonra bu API&apos;leri test edebilirsiniz:</p>
                    <ul>
                        <li><a href="/api/firebase-simple-test" target="_blank" rel="noopener noreferrer">Basit Test</a></li>
                        <li><a href="/api/test-firebase" target="_blank" rel="noopener noreferrer">Kapsamlı Test</a></li>
                    </ul>
                    
                    <h4>Terminal&apos;den test:</h4>
                    <code style={{ background: '#f1f3f4', padding: '2px 6px', borderRadius: '3px' }}>
                        curl -X GET &quot;http://localhost:3000/api/firebase-simple-test&quot;
                    </code>
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <a 
                        href="/api/firebase-simple-test" 
                        style={{
                            display: 'inline-block',
                            background: '#667eea',
                            color: 'white',
                            padding: '12px 24px',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            margin: '10px 5px',
                        }}
                    >
                        Test Et
                    </a>
                    <a 
                        href="https://console.firebase.google.com/project/kudat-bulten-app" 
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            background: '#667eea',
                            color: 'white',
                            padding: '12px 24px',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            margin: '10px 5px',
                        }}
                    >
                        Firebase Console
                    </a>
                </div>
            </div>
        </div>
    );
}
