import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Firebase Console\'da Firestore\'u etkinleştirin',
        instructions: {
            step1: 'Firebase Console\'a gidin: https://console.firebase.google.com/project/kudat-bulten-app',
            step2: 'Sol menüden "Firestore Database" tıklayın',
            step3: '"Create database" butonuna tıklayın',
            step4: '"Start in test mode" seçin (development için)',
            step5: 'Location seçin (europe-west1 önerilir)',
            step6: '"Done" tıklayın',
            step7: 'Firestore etkinleştirildikten sonra test API\'leri çalışacak'
        },
        projectInfo: {
            projectId: 'kudat-bulten-app',
            projectNumber: '469680851853',
            consoleUrl: 'https://console.firebase.google.com/project/kudat-bulten-app'
        },
        testApis: [
            'http://localhost:3001/api/firebase-simple-test',
            'http://localhost:3001/api/test-firebase'
        ]
    });
}
