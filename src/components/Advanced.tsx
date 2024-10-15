import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GenStory, getVoiceList } from "../utils/tools/fetch";
import { sdmodel, sdmodel_list } from "../utils/sdmodel_list";
import '../styles/Advanced.css';

const options: sdmodel[] = sdmodel_list;

const Advanced: React.FC = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('query') || '無搜索內容';
    const styleOptions = [searchQuery, ...options.map(option => option.show_name)];
    const navigate = useNavigate();
    const [selectedStyle, setSelectedStyle] = useState<string>(searchQuery);
    const [character1, setCharacter1] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [characters, setCharacters] = useState<string[]>(['']);
    const [storyId, setStoryId] = useState<string>('66a52f72b5993b79132a3fac');
    const [isGenerated, setIsGenerated] = useState<boolean>(false);
    const [isLoad, setIsLoad] = useState<string>(''); // 是否在生成圖片
    const [reLoad, setReLoad] = useState<boolean>(false); // 重新生成圖片控制器
    const [imageSrc, setImageSrc] = useState<string>("/src/images/AnythingXL_xl_image.jpeg");
    const [voiceOptions, setVoiceOptions] = useState<string[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');


    const addCharacter = () => {
        setCharacters([...characters, '']);
    };

    const removeCharacter = (index: number) => {
        const newCharacters = [...characters];
        newCharacters.splice(index, 1);
        setCharacters(newCharacters);
    };

    const handleSubmit = async () => {
        const targetModel = options.find(model => model.show_name === selectedStyle);
        setIsLoad('loading'); // 設置為loading狀態
        const data = {
            style: targetModel?.sd_name || 'fantasyWorld_v10.safetensors',
            mainCharacter: character1,
            description,
            otherCharacters: characters.filter((character) => character !== '')
        };

        console.log(`RoleForm = ${JSON.stringify(data)}`);

        const result = await GenStory(data, selectedVoice);
        setIsLoad('finish'); // 設置為finish狀態
        if (result && result.success) {
            setIsGenerated(true);
            setStoryId(result.storyId);
            console.log('API 回應:', result);
        } else {
            setReLoad(true);
            setIsLoad(''); // 重置loading狀態
            console.error('提交失敗或出錯');
        }
    };

    const handleSubmitReGen = async () => {
        console.log("handleSubmitReGen");
        handleSubmit();
        setReLoad(false);
    }

    const handleStartStory = () => {
        navigate(`/style/role/startStory?query=${encodeURIComponent(storyId)}`);
    }

    useEffect(() => {
        const targetImage = options.find(model => model.show_name === selectedStyle);
        console.log(`targetImage = ${JSON.stringify(targetImage)}`);
        if (targetImage) {
            setImageSrc(targetImage.image_path);
        }
    }, [selectedStyle])

    useEffect(() => {
        const fetchVoiceList = async () => {
            const result = await getVoiceList();
            console.log(`語音列表結果:`, result);
            if (result.success && Array.isArray(result.data)) {
                setVoiceOptions(result.data);
            } else {
                console.error('獲取語音列表失敗:', result.message);
            }
        };

        fetchVoiceList();
    }, []);

    return (
        <div className="container-fluid">
            <div className={`overlay ${isLoad === 'loading' ? 'visible' : ''}`}>
                <div className="loading">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div className="header text-center py-3">
                <div className="header-content">
                    WHISPER TALES
                </div>
            </div>
            <div className="content-container">
                <div className="form-section">
                    <div className="form-content">
                        <div className="row align-items-center mb-4">
                            <div className="col-md-3 d-flex align-items-center justify-content-end">
                                <label htmlFor="voice" className="label-spacing">語 &nbsp; 音 :</label>
                            </div>
                            <div className="col-md-9">
                                <select
                                    id="voice"
                                    className="form-select"
                                    value={selectedVoice}
                                    onChange={(e) => setSelectedVoice(e.target.value)}
                                >
                                    <option key="default" value="">請選擇語音</option>
                                    {voiceOptions.map((voice, index) => (
                                        <option key={index} value={voice}>
                                            {voice}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* 風格與下拉式選單 */}
                        <div className="row align-items-center mb-4">
                            <div className="col-md-3 d-flex align-items-center justify-content-end">
                                <label htmlFor="style" className="label-spacing">風 &nbsp; 格 :</label>
                            </div>
                            <div className="col-md-9">
                                <select
                                    id="style"
                                    value={selectedStyle}
                                    onChange={(e) => setSelectedStyle(e.target.value)}
                                >
                                    {styleOptions.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 角色與文字輸入框 */}
                        <div className="row align-items-center mb-4">
                            <div className="col-md-3 d-flex align-items-center justify-content-end">
                                <label htmlFor="character1" className="label-spacing">角色 1 :</label>
                            </div>
                            <div className="col-md-9">
                                <input
                                    style={{ backgroundColor: 'RGB(231, 232, 238)' }}
                                    id="character1"
                                    type="text"
                                    value={character1}
                                    onChange={(e) => setCharacter1(e.target.value)}
                                    placeholder="角色名字"
                                />
                            </div>
                        </div>

                        {/* 動態角色區塊 */}
                        {characters.map((character, index) => (
                            <div key={index} className="row align-items-center mb-4">
                                <div className="col-md-3 d-flex align-items-center justify-content-end">
                                    <label htmlFor={`character${index + 2}`} className="label-spacing">{`角色 ${index + 2}`} :</label>
                                </div>
                                <div className="col-md-6">
                                    <input
                                        style={{ backgroundColor: 'RGB(231, 232, 238)' }}
                                        id={`character${index + 2}`}
                                        type="text"
                                        value={character}
                                        onChange={(e) => {
                                            const newCharacters = [...characters];
                                            newCharacters[index] = e.target.value;
                                            setCharacters(newCharacters);
                                        }}
                                        placeholder={`角色名字`}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <button onClick={() => removeCharacter(index)} className="btn button-submit">刪除角色</button>
                                </div>
                            </div>
                        ))}

                        {/* 新增角色按鈕 */}
                        <div className="row align-items-center mb-4">
                            <div className="col-md-12 text-center">
                                <button onClick={addCharacter} className="btn button-submit">新增角色</button>
                            </div>
                        </div>

                        {/* 內容與文字輸入框 */}
                        <div className="row align-items-start mb-4">
                            <div className="col-md-3 d-flex align-items-end justify-content-end">
                                <label htmlFor="description" className="textarea-label">內 &nbsp; 容 :</label>
                            </div>
                            <div className="col-md-9 d-flex align-items-end">
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="故事內容"
                                    style={{ height: '400px', backgroundColor: 'RGB(231, 232, 238)' }} // 增加高度到300px
                                />
                            </div>
                        </div>

                        {/* 按鈕區塊 */}
                        <div className="row mb-4">
                            <div className="col-md-9 offset-md-3 text-center">
                                <button onClick={handleSubmit} className="btn button-submit">生成</button>
                                <button className="btn button-submit">清除</button>
                            </div>
                            {reLoad && (
                                <div className="col-md-9 offset-md-3 text-center">
                                    <button onClick={handleSubmitReGen} className="btn button-submit">重新生成</button>
                                </div>
                            )}
                        </div>

                        {isLoad === 'loading' && <p>loading</p>}
                        {isLoad === 'finish' && <p>load finish</p>}

                    </div>
                </div>
                <div className="image-section">
                    <div className="image-container">
                        <img src={imageSrc} alt="Preview" className="preview-image" />
                    </div>
                    {isGenerated && (
                        <button onClick={handleStartStory} className="button-secondary" >
                            <div className="triangle-icon"></div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Advanced;

