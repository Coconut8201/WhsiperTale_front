import { useState, useRef, ChangeEvent, useEffect } from 'react';
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
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const CHUNK_DURATION = 8; // 每段音訊的秒數
  const [isUploading, setIsUploading] = useState(false);

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
  }, []); //voiceOptions

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        audioChunksRef.current = [];
        
        // 分割音頻並更新狀態
        const chunks = await splitAudio(blob);
        setAudioChunks(chunks);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing media devices.', err);
      alert('無法訪問媒體設備。請檢查您的權限設置。');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const splitAudio = async (audioBlob: Blob): Promise<Blob[]> => {
    const audioContext = new AudioContext();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const chunks: Blob[] = [];
    const sampleRate = audioBuffer.sampleRate;
    const channels = audioBuffer.numberOfChannels;
    const chunkSamples = CHUNK_DURATION * sampleRate;
    
    for (let start = 0; start < audioBuffer.length; start += chunkSamples) {
      const end = Math.min(start + chunkSamples, audioBuffer.length);
      const chunkLength = end - start;
      
      const chunkBuffer = audioContext.createBuffer(channels, chunkLength, sampleRate);
      
      for (let channel = 0; channel < channels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const chunkChannelData = chunkBuffer.getChannelData(channel);
        chunkChannelData.set(channelData.slice(start, end));
      }
      
      // 使用 OfflineAudioContext 來渲染音頻
      const offlineCtx = new OfflineAudioContext(channels, chunkLength, sampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = chunkBuffer;
      source.connect(offlineCtx.destination);
      source.start();

      // 渲染音頻並創建 Blob
      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = await audioBufferToWav(renderedBuffer);
      chunks.push(wavBlob);
    }
    
    return chunks;
  };

  // 輔助函數：將 AudioBuffer 轉換為 WAV 格式的 Blob
  const audioBufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    // WAV 檔案頭
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // 寫入音頻數據
    const offset = 44;
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channelData = buffer.getChannelData(i);
      for (let j = 0; j < channelData.length; j++) {
        const index = offset + (j * numberOfChannels + i) * 2;
        const sample = Math.max(-1, Math.min(1, channelData[j]));
        view.setInt16(index, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAudioName(e.target.value);
  };

  const handleUpload = async () => {
    if (!audioChunks.length) {
      alert('請先錄製音頻');
      return;
    }

    try {
      setIsUploading(true);
      console.log('開始上傳，音頻片段數量:', audioChunks.length);
      
      // 分批上傳音頻片段
      for (let i = 0; i < audioChunks.length; i++) {
        const formData = new FormData();
        formData.append('audioName', `${audioName}_part${i + 1}`);
        
        // 確保音頻大小在合理範圍內（例如：最大 10MB）
        const chunk = audioChunks[i];
        if (chunk.size > 10 * 1024 * 1024) {
          throw new Error('音頻檔案太大，請縮短錄音時間');
        }

        const fileName = `${audioName}_${Date.now()}_${i}.wav`;
        formData.append('files', chunk, fileName);

        console.log(`正在上傳第 ${i + 1}/${audioChunks.length} 個片段`);
        const response = await UploadVoice(formData);

        if (response.code !== 200) {
          throw new Error(`第 ${i + 1} 個片段上傳失敗：${response.message || '未知錯誤'}`);
        }
      }
      
      alert('所有音檔上傳成功');
    } catch (error: any) {
      console.error('上傳錯誤:', error);
      alert('上傳失敗：' + (error.message || '未知錯誤'));
    } finally {
      setIsUploading(false);
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
          <form onSubmit={handleUpload}>
            <p className="example-title">範例文本</p>
            <p className="example-text">
            從前有一座美麗的森林，住著一隻聰明的小狐狸叫小紅。她最喜歡在夜晚抬頭看星星。有一天，小紅發現天上有一顆特別明亮的星星，閃爍著她從未見過的光芒。
            </p>
            <div className='buttonspace'>
              <button
                type="submit"
                className="button-Previous-Next-Page"
                disabled={!audioBlob && isUploading}
                onClick={handleUpload}
              >
                {isUploading ? '上傳中...' : '送出'}
              </button>
            </div>
          </form>
          {isUploading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>正在上傳音檔，請稍候...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}