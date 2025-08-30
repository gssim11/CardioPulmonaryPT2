// 이 파일은 Vercel 서버에서만 실행되는 "비밀 점원" 역할을 합니다.
// 사용자의 웹사이트(index.html)에는 이 코드가 보이지 않으므로 API 키가 안전하게 보호됩니다.

export default async function handler(request, response) {
  // 1. index.html에서 보낸 요청 데이터 확인하기
  //    - request.body는 index.html의 fetch에서 보낸 `body: JSON.stringify(...)` 부분입니다.
  const { apiUrl, payload } = request.body;

  // 2. Vercel에 숨겨둔 비밀 API 키 가져오기
  //    - process.env.GEMINI_API_KEY는 Vercel 프로젝트 설정에서 우리가 등록한
  //      'GEMINI_API_KEY'라는 이름의 환경 변수 값입니다.
  const apiKey = process.env.GEMINI_API_KEY;

  // 3. 비밀 키가 없으면 에러 메시지 보내기
  if (!apiKey) {
    return response.status(500).json({ error: 'API 키가 서버에 설정되지 않았습니다.' });
  }

  // 4. 원래 API 주소에 우리 비밀 키를 붙여서 최종 주소 만들기
  const fullApiUrl = `${apiUrl}?key=${apiKey}`;

  try {
    // 5. Google AI 서버에 진짜 API 요청 보내기
    const geminiResponse = await fetch(fullApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // 6. Google AI 서버의 응답이 정상이 아닐 경우, 에러 처리
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Google AI API Error:', errorText);
      return response.status(geminiResponse.status).json({ error: `API 요청 실패: ${errorText}` });
    }

    // 7. Google AI 서버로부터 받은 결과(JSON 데이터)를 그대로 index.html로 전달하기
    const data = await geminiResponse.json();
    return response.status(200).json(data);

  } catch (error) {
    // 8. 네트워크 문제 등 다른 에러가 발생했을 경우 처리
    console.error('Internal Server Error:', error);
    return response.status(500).json({ error: '내부 서버 오류가 발생했습니다.' });
  }
}
