// api/gemini.js
export default async function handler(req, res) {
    // 보안: POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Vercel 환경변수에서 API 키 불러오기
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: '서버에 API 키가 설정되지 않았습니다.' });
    }

    const { action, payload } = req.body;
    let apiUrl = '';

    // 요청 종류(텍스트/음성)에 따른 엔드포인트 분기
    if (action === 'text') {
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    } else if (action === 'tts') {
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    } else {
        return res.status(400).json({ error: '유효하지 않은 요청 타입입니다.' });
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || 'Gemini API 오류' });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Google 서버 통신 실패', details: error.message });
    }
}
