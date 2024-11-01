import { storyInterface } from "../../components/StartStory";
import { apis } from './api'; // 假設這是你的 API 配置文件的路徑

// 定義 GenStory 函數，它接收 RoleForm 對象並返回 Promise
export async function GenStory(RoleForm: Object, voiceModelName: string): Promise<any> {
    let playload = {
        roleform: RoleForm,
        voiceModelName: voiceModelName
    }
    try {
        // 發送 POST 請求到 LLMGenStory API
        const response = await fetch(apis.LLMGenStory, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playload)
        });

        // 檢查 response 是否成功
        if (response.ok) {  // Response 對象具有 `ok` 屬性
            const responseData = await response.json(); // 解析 JSON 數據
            // console.log('成功提交數據:', responseData);
            return responseData;
        } else {
            // 錯誤處理
            console.error('提交失敗:', response.statusText);
            return null; // 返回 null 以表示提交失敗
        }
    } catch (error) {
        // 捕獲並處理異常
        console.error('提交時出錯:', error);
        return 1; // 返回 null 以表示捕獲到異常
    }
}

export async function GetALLSDModel(): Promise<any> {
    try {
        const response = await fetch(apis.getAllSDModel)
        if (!response.ok) {
            throw new Error(`GetALLSDModel error! status: ${response.status}`);
        }
        const option_json = await response.json();
    } catch (error) {
    }
}

export async function StartStory_api(storyIdinput: string): Promise<any> {
    try {
        const response = await fetch(apis.startStory, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "storyId": storyIdinput })
        });
        if (!response.ok) {
            throw new Error(`StartStory_api error! status: ${response.status}`);
        }
        const option_json: storyInterface = await response.json();
        return option_json;
    } catch (error) {
        console.error('StartStory_api, Failed to fetch story:', error);
        throw error;
    }
}

export async function GetVoice(storyId: string): Promise<Blob> {
    try {
        const playload = {
            "storyId": storyId
        }
        const response = await fetch(apis.GetVoice, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playload)
        });

        if (!response.ok) {
            throw new Error(`GetVoice error! status: ${response.status}`);
        }

        return await response.blob();

    } catch (error) {
        console.error('GetVoice, Failed to fetch audio:', error);
        throw error;
    }
}

export async function UploadVoice(audioBlob: Blob, audioName: string): Promise<{ result: boolean, message: string }> {
    const formData = new FormData();
    formData.append("file", audioBlob, `${audioName}.wav`);
    formData.append("audioName", audioName);


    try {
        const response = await fetch(apis.GetVoice, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            return { result: true, message: "UploadVoice success" };
        } else {
            const errorMessage = `UploadVoice failed with status: ${response.status}`;
            console.log(errorMessage);
            return { result: false, message: errorMessage };
        }
    } catch (error) {
        const errorMessage = `UploadVoice failed: ${error}`;
        console.log(errorMessage);
        return { result: false, message: errorMessage };
    }
}

export async function userLogin(userName: string, userPassword: string): Promise<{ success: boolean, token: string }> {
    try {
        const response = await fetch(apis.userLogin, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userName: userName, userPassword: userPassword })
        });
        if (response.ok) {
            const data = await response.json();
            // 將令牌存儲在 cookie 中（可設置過期時間）
            document.cookie = `authToken=${data.token}; max-age=3600; path=/`;
            return { success: true, token: data.token };
        } else {
            console.error(`登入失敗：HTTP狀態碼 ${response.status}`);
            return { success: false, token: '' };
        }
    } catch (error) {
        console.error('登入過程中發生錯誤：', error);
        return { success: false, token: '' };
    }
}

export async function userRegister(userName: string, userPassword: string): Promise<{ success: boolean, code: number, message: string }> {
    try {
        const response = await fetch(apis.userRegister, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userName: userName, userPassword: userPassword })
        });
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (data.success) {
                return { success: true, code: 200, message: '註冊成功' };
            } else {
                console.error(`註冊失敗：HTTP狀態碼 ${data.status} ${data.message}`);
                return { success: false, code: data.status, message: data.message };
            }
        } else {
            if (response.status === 200) {
                const textResponse = await response.text();
                if (textResponse.includes("SaveNewUser") && textResponse.includes("success")) {
                    return { success: true, code: 200, message: '註冊成功' };
                }
            }
            const textResponse = await response.text();
            console.error(`註冊失敗：非JSON回應 ${response.status} ${textResponse}`);
            return { success: false, code: response.status, message: textResponse };
        }
    } catch (error) {
        console.error('註冊過程中發生錯誤：', error);
        return { success: false, code: 500, message: error instanceof Error ? error.message : '未知錯誤' };
    }
}

export async function getVoiceList(): Promise<{ success: boolean, code: number, message: string, data?: any }> {
    try {
        const response = await fetch(apis.getVoiceList, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            console.log("data.listData: ",data.listData);
            return { success: true, code: 200, message: '獲取語音列表成功', data: data.listData };
        } else {
            const errorMessage = `獲取語音列表失敗：HTTP狀態碼 ${response.status}`;
            console.error(errorMessage);
            return { success: false, code: response.status, message: errorMessage };
        }
    } catch (error) {
        console.error('獲取語音列表過程中發生錯誤：', error);
        return { success: false, code: 500, message: error instanceof Error ? error.message : '未知錯誤' };
    }
}
