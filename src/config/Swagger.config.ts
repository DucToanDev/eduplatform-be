import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const configSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('API Edu Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const customJsStr = `
    setTimeout(() => {
      function parseAndShowToken(tokenValue, container) {
        if (!tokenValue) return;
        let infoDiv = container.querySelector('.jwt-info-div');
        if (!infoDiv) {
          infoDiv = document.createElement('div');
          infoDiv.className = 'jwt-info-div';
          infoDiv.style.marginTop = '15px';
          infoDiv.style.padding = '10px';
          infoDiv.style.borderRadius = '5px';
          infoDiv.style.backgroundColor = 'rgba(0,0,0,0.05)';
          infoDiv.style.fontWeight = 'bold';
          infoDiv.style.fontSize = '14px';
          // Insert before the logout buttons if possible
          const btnWrapper = container.querySelector('.auth-btn-wrapper');
          if (btnWrapper) {
            container.insertBefore(infoDiv, btnWrapper);
          } else {
            container.appendChild(infoDiv);
          }
        }
        
        const val = tokenValue.replace('Bearer ', '').replace(/"/g, '').trim();
        const parts = val.split('.');
        if (parts.length === 3) {
          try {
            let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
              base64 += '=';
            }
            let jsonPayload = '';
            try {
               jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
               }).join(''));
            } catch (e) {
               jsonPayload = atob(base64); // Fallback for simple ASCII
            }
            const payload = JSON.parse(jsonPayload);
            if (payload.exp) {
              const date = new Date(payload.exp * 1000);
              const now = new Date();
              const diff = Math.floor((date.getTime() - now.getTime()) / 60000);
              if (diff >= 0) {
                infoDiv.innerText = '✅ Token đang lưu còn hợp lệ.\\n⏰ Hết hạn lúc: ' + date.toLocaleTimeString() + ' (Còn ' + diff + ' phút)';
                infoDiv.style.color = '#00a65a';
              } else {
                infoDiv.innerText = '❌ Token đang lưu ĐÃ HẾT HẠN vào lúc: ' + date.toLocaleTimeString();
                infoDiv.style.color = '#dd4b39';
              }
            }
          } catch(err) {
            infoDiv.innerText = '❌ Token không đúng định dạng JWT';
            infoDiv.style.color = '#dd4b39';
          }
        } else {
          infoDiv.innerText = '';
        }
      }

      const observer = new MutationObserver(() => {
        const authContainer = document.querySelector('.auth-container');
        if (!authContainer) return;
        
        // TRƯỜNG HỢP 1: Đang nhập Token (Chưa Authorized)
        const authInput = authContainer.querySelector('input');
        if (authInput) {
          if (!authInput.dataset.jwtListener) {
            authInput.dataset.jwtListener = "true";
            authInput.addEventListener('input', (e) => {
              parseAndShowToken(e.target.value, authInput.parentNode);
            });
          }
        }
        
        // TRƯỜNG HỢP 2: Đã Authorized (Hiển thị thông tin Token đang dùng)
        const logoutBtn = Array.from(authContainer.querySelectorAll('button')).find(b => b.innerText.includes('Logout'));
        if (logoutBtn) {
          const wrapper = logoutBtn.parentNode.parentNode;
          if (wrapper && !wrapper.dataset.jwtChecked) {
            wrapper.dataset.jwtChecked = "true";
            try {
              const authDataStr = localStorage.getItem('authorized');
              if (authDataStr) {
                const authData = JSON.parse(authDataStr);
                const keys = Object.keys(authData);
                if (keys.length > 0) {
                  const tokenValue = authData[keys[0]].value || authData[keys[0]].token;
                  if (tokenValue) {
                    parseAndShowToken(tokenValue, wrapper);
                  }
                }
              }
            } catch(e) {}
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }, 1000);
  `;

  // CHỈ CẦN SETUP MỘT LẦN
  SwaggerModule.setup('doc-ui', app, document, {
    jsonDocumentUrl: 'doc-json',
    yamlDocumentUrl: 'doc-yaml',
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
    customJsStr: customJsStr,
  });
};

export default configSwagger;
