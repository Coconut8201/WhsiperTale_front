import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { getVoiceList, UploadVoice } from "../utils/tools/fetch.ts";
import { useNavigate } from 'react-router-dom';
import '../styles/Voice.css';
import React from 'react';

export default function Voice() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>("model_name");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [voiceOptions, setVoiceOptions] = useState<string[]>([]);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVoiceList = async () => {
      const result = await getVoiceList();
      console.log(`語音列表結果:`, result);
      if (result.success && Array.isArray(result.data)) {
        setVoiceOptions(result.data);
      } else {
        console.error("獲取語音列表失敗:", result.message);
      }
    };
    fetchVoiceList();
  }, [voiceOptions]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing media devices.', err);
      alert('無法訪問媒體設備。請檢查您的權限設置。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAudioName(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (voiceOptions.includes(audioName)) {
      alert('模型名稱已存在');
      return;
    }
    if (audioBlob) {
      try {
        await UploadVoice(audioBlob, audioName);
        alert('音檔上傳成功');
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        }
      } catch (error) {
        console.error('上傳音檔時發生錯誤:', error);
        alert('音檔上傳失敗。請稍後再試。');
      }
    } else {
      alert('未上傳任何音檔');
    }
  };

  return (
    <div className="Vcontainer">
      <div className="header">
        <div className='header-content'>
          Whisper Tales
        </div>
        <button onClick={() => navigate('/style')} className="login">
          返回故事生成
        </button>
      </div>
      <div className="content">
        <div className="sidebar">
          <p>現有語音模型：</p>
          {voiceOptions.map((voice, index) => (
            <React.Fragment key={voice}>
              <label className='modelbutton'>{voice}</label>
              {index < voiceOptions.length - 1 && '\u00A0\u00A0'}
            </React.Fragment>
          ))}
        </div>
        <div className="divider"></div>
        <div className="main-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <p className="model-name-label" style={{ marginRight: '10px', whiteSpace: 'nowrap', textAlign: 'center' }}>模型名稱：</p>
            <input
              type="text"
              value={audioName}
              onChange={handleInputChange}
              style={{ height: '2.2rem', padding: '0.25rem 0.5rem' }}
            />
          </div>
          <div className='buttonspace'>
            <button
              type="button"
              onClick={startRecording}
              disabled={isRecording}
              className='startbutton'
            >
              開始錄製
            </button>
            &nbsp;&nbsp;&nbsp;
            <button
              type="button"
              onClick={stopRecording}
              disabled={!isRecording}
              className='endbutton'
            >
              結束錄製
            </button>
          </div>
          {audioUrl && <audio src={audioUrl} controls />}
          <form onSubmit={handleSubmit}>
            <p className="example-title">範例文本</p>
            <p className="example-text">
            從前有一座美麗的森林，住著一隻聰明的小狐狸叫小紅。她最喜歡在夜晚抬頭看星星。有一天，小紅發現天上有一顆特別明亮的星星，閃爍著她從未見過的光芒。好奇的小紅決定追尋這顆星星，於是她出發了。她穿越了森林、翻過了高山，最後來到了星星墜落的地方。那裡躺著一顆閃亮的銀色種子。小紅輕輕地把種子埋在土裡，沒想到第二天早上，一棵會發光的樹苗從土裡冒了出來！這棵樹不僅會照亮黑夜，還能給森林裡的動物們帶來溫暖和希望。從此，森林變得更加繁榮，小紅也成為了大家的英雄。
            </p>
            <div className='buttonspace'>
              <button
                type="submit"
                className="button-Previous-Next-Page"
                disabled={!audioBlob}
              >
                送出
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}