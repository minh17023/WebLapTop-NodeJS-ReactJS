// Thay chuỗi bên dưới bằng API Key thật của bạn trong file .env
const apiKey = "AIzaSyC_X4-97EHmDpjiVibZqOhsKyOcpvdj008"; 

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    if (!data.models) {
        console.log("Lỗi API Key hoặc không lấy được dữ liệu:", data);
        return;
    }
    // Lọc ra các model hỗ trợ chat/tạo văn bản
    const textModels = data.models.filter(m => 
        m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
    );
    
    console.log("✅ CÁC MODEL BẠN CÓ THỂ DÙNG CHÍNH XÁC LÀ:");
    textModels.forEach(m => console.log(`👉 "${m.name.replace('models/', '')}"`));
  })
  .catch(err => console.error("Lỗi:", err));