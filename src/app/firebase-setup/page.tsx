import { NextResponse } from 'next/server';

export async function GET() {
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Firebase Firestore Etkinleştirme</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .step {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .step-number {
            font-weight: bold;
            color: #667eea;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 5px;
            transition: background 0.3s;
        }
        .button:hover {
            background: #5a6fd8;
        }
        .test-section {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .project-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        code {
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔥 Firebase Firestore Etkinleştirme</h1>
        
        <div class="project-info">
            <h3>📋 Proje Bilgileri</h3>
            <p><strong>Project ID:</strong> <code>kudat-bulten-app</code></p>
            <p><strong>Project Number:</strong> <code>469680851853</code></p>
        </div>

        <h2>🚀 Adım Adım Kurulum</h2>
        
        <div class="step">
            <span class="step-number">1.</span>
            <strong>Firebase Console'a gidin</strong><br>
            <a href="https://console.firebase.google.com/project/kudat-bulten-app" target="_blank" class="button">
                Firebase Console'u Aç
            </a>
        </div>

        <div class="step">
            <span class="step-number">2.</span>
            <strong>Firestore Database'i seçin</strong><br>
            Sol menüden "Firestore Database" tıklayın
        </div>

        <div class="step">
            <span class="step-number">3.</span>
            <strong>Veritabanı oluşturun</strong><br>
            "Create database" butonuna tıklayın
        </div>

        <div class="step">
            <span class="step-number">4.</span>
            <strong>Test mode seçin</strong><br>
            "Start in test mode" seçin (development için güvenli)
        </div>

        <div class="step">
            <span class="step-number">5.</span>
            <strong>Location seçin</strong><br>
            <code>europe-west1</code> önerilir (Türkiye'ye yakın)
        </div>

        <div class="step">
            <span class="step-number">6.</span>
            <strong>Tamamlayın</strong><br>
            "Done" tıklayın
        </div>

        <div class="test-section">
            <h3>🧪 Test API'leri</h3>
            <p>Firestore etkinleştirildikten sonra bu API'leri test edebilirsiniz:</p>
            <ul>
                <li><a href="/api/firebase-simple-test" target="_blank">Basit Test</a></li>
                <li><a href="/api/test-firebase" target="_blank">Kapsamlı Test</a></li>
            </ul>
            
            <h4>Terminal'den test:</h4>
            <code>curl -X GET "http://localhost:3001/api/firebase-simple-test"</code>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="/api/firebase-simple-test" class="button">Test Et</a>
            <a href="https://console.firebase.google.com/project/kudat-bulten-app" target="_blank" class="button">Firebase Console</a>
        </div>
    </div>
</body>
</html>
    `;
    
    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}
