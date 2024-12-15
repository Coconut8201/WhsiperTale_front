import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { bookManageList } from "../utils/sdmodel_list";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/BookManage.css';
import { getBookList, verifyAuth } from "../utils/tools/fetch";

let options: bookManageList[] = [];

export default function BookManage() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [storyId, setStoryId] = useState<string>('');
    const [isLogin, setIsLogin] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const result = await getBookList();
                console.log(`result: ${JSON.stringify(result)}`)
                if (result.success && result.data) {

                } else {
                    setError(result.error || '獲取書籍列表失敗');
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '獲取書籍列表時發生錯誤';
                setError(errorMessage);
                console.error('獲取書籍列表錯誤：', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchBooks();
    }, []);

    useEffect(() => {
        const checkLoginStatus = async () => {
            let verifyAuthStaus = await verifyAuth()
            setIsLogin(verifyAuthStaus.isAuthenticated)
        };
        
        checkLoginStatus();
    }, []);

    const handleSearch = () => {
        if( isLogin == false ) {
            alert('請先登入');
            navigate('/Login');
            return;
        }
        if (storyId.trim()) {
            navigate(`/style/role/startStory?query=${encodeURIComponent(storyId)}`);
        } else {
            alert('請選擇故事書');
        }
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleOptionClick = (value: string) => {
        setSearchQuery(value);
    };

    return (
        <>
            <div>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
            </div>
            <div className="container-fluid">
                <div className="header">
                    <div className="header-content">
                        WisperTales
                    </div>
                    <button onClick={() => navigate('/voice')} className="login">
                        語音管理
                    </button>
                    <button onClick={() => navigate('/style')} className="login">
                        返回故事生成
                    </button>
                </div>
                <div className="body-content">
                    <div className="row mt-4 mb-3">
                        <div className="mx-auto">
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="選擇故事並開始閱讀"
                                    readOnly
                                    className="form-control border-left-0 rounded-pill custom-search-input non-editable AAA"
                                />
                                <div className="input-group-append">
                                    <button onClick={handleSearch} className="button-submit AAA">選擇</button>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="container mt-4">
                        <div className="row">
                            {loading ? (
                                <div className="col-12 text-center">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">載入中...</span>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="col-12">
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                </div>
                            ) : options.length === 0 ? (
                                <div className="col-12 text-center">
                                    <p>目前沒有可用的書籍</p>
                                </div>
                            ) : (
                                options.map((option, index) => (
                                    <div
                                        key={`${option.bookName}-${index}`} // 使用 option.show_name 和索引的组合来確保唯一性
                                        className="col-md-3 mb-4"
                                        onClick={() => handleOptionClick(option.bookName)}
                                    >
                                        <div className="card h-100">
                                            <img src={option.bookFirstImageBase64} alt={option.bookFirstImageBase64} className="card-img-top" />
                                            <div className="card-body text-center">
                                                <p className="card-text">{option.bookName}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
