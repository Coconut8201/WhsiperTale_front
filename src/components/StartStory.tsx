import React, { useEffect, useState, useRef, useMemo, forwardRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StartStory_api, GetVoice } from '../utils/tools/fetch';
import '../styles/StartStory.css';
import { pdf, Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import HTMLFlipBook from "react-pageflip";

//註冊字體
Font.register({
    family: "Noto Sans TC",
    src: "/Assets/NotoSansTC-VariableFont_wght.ttf",
});

const pdf_styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    halfPage: {
        width: '50%',
        alignItems: 'center',
    },
    storyImage: {
        width: '80%',
        marginBottom: 10,
    },
    storyText: {
        fontSize: 12,
        textAlign: 'left', // 左對齊文字
        width: '80%', // 確保文字寬度不超過容器寬度
        fontFamily: 'Noto Sans TC',
        lineHeight: 1.2,
        marginTop: 10,
    },
});

export interface storyInterface {
    storyTale: string,
    storyInfo: string,
    image_prompt?: string[],
    image_base64?: string[],
    is_favorite: boolean,
    addDate: Date,
}

interface PdfTestProps {
    data: storyInterface;
    storyLines: string[];
}
interface PageflipProps {
    image: string;
    text: string;
}

const Pageflip = forwardRef<HTMLDivElement, PageflipProps>(({ image, text }, ref) => {
    return (
        <div className="pagefilp" ref={ref}>
            <img src={`data:image/png;base64,${image}`} alt="Story image" className="story-image" />
            <pre className="pre"><br />{text}</pre>
        </div>
    );
});

const StartStory: React.FC = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const storyId = searchParams.get('query');

    const [data, setData] = useState<storyInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(0);
    const navigate = useNavigate();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const bookRef = useRef<any>(null);

    const storyLines = useMemo(() => {
        if (!data?.storyTale) return [];
        return data.storyTale.split('\n\n').map(line => line.trim());
    }, [data?.storyTale]);

    const formatText = (text: string, maxLineLength: number = 23): string => {
        let formattedText = '';
        let currentLineLength = 0;
    
        for (let i = 0; i < text.length; i++) {
            formattedText += text[i];
            currentLineLength++;
    
            // 當行長度達到最大值時，進行換行
            if (currentLineLength === maxLineLength) {
                formattedText += '\n';
                currentLineLength = 0;
            }
        }
    
        return formattedText;
    };
    
    const PDFDocument: React.FC<{ data: storyInterface; storyLines: string[] }> = ({ data, storyLines }) => (
        <Document>
            {data && data.image_base64 && data.image_base64.length > 0 &&
                data.image_base64.map((image, index) => {
                    if (index % 2 === 0) {
                        return (
                            <Page key={index} size="A4" orientation="landscape" style={pdf_styles.page}>
                                <View style={pdf_styles.halfPage}>
                                    <Image
                                        src={`data:image/png;base64,${image}`}
                                        style={pdf_styles.storyImage}
                                    />
                                    <Text style={pdf_styles.storyText}>
                                        {formatText(storyLines[index] || '', 27)}
                                    </Text>
                                </View>
                                {data.image_base64 && data.image_base64[index + 1] && (
                                    <View style={pdf_styles.halfPage}>
                                        <Image
                                            src={`data:image/png;base64,${data.image_base64[index + 1]}`}
                                            style={pdf_styles.storyImage}
                                        />
                                        <Text style={pdf_styles.storyText}>
                                            {formatText(storyLines[index + 1] || '', 27)}
                                        </Text>
                                    </View>
                                )}
                            </Page>
                        );
                    }
                    return null;
                })
            }
        </Document>
    );
    
    


    const PdfTest: React.FC<PdfTestProps> = ({ data, storyLines }) => {
        const generatePDF = async () => {
            try {
                const blob = await pdf(<PDFDocument data={data} storyLines={storyLines} />).toBlob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'story.pdf';
                link.click();
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('PDF generation error:', error);
            }
        };

        return (
            <div className="download-container">
                <p className='p-size'>下載pdf檔案</p>
                <button className='button-Previous-Next-Page' onClick={generatePDF}>下載</button>
            </div>
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (storyId) {
                    setLoading(true);
                    const storyData = await StartStory_api(storyId);
                    setData(storyData);
                    setLoading(false);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, [storyId, navigate]);

    useEffect(() => {
        const fetchAudio = async () => {
            try {
                if (storyId) {
                    // 停止當前播放的音頻
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                        setIsPlaying(false);
                    }
                    
                    const audioBlob = await GetVoice(storyId, Math.floor(pageIndex / 2) + 1);
                    if (audioBlob) {
                        const audioUrl = URL.createObjectURL(audioBlob);
                        if (audioRef.current) {
                            audioRef.current.src = audioUrl;
                        } else {
                            audioRef.current = new Audio(audioUrl);
                            audioRef.current.addEventListener('play', () => setIsPlaying(true));
                            audioRef.current.addEventListener('ended', () => setIsPlaying(false));
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching audio:', error);
            }
        };
        fetchAudio();

        // 清理函數
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlaying(false);
            }
        };
    }, [storyId, pageIndex]);

    const handleNextPage = () => {
        if (data && data.image_base64 && pageIndex < data.image_base64.length - 2) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlaying(false);
            }
            setPageIndex(pageIndex + 2);
            if (bookRef.current) {
                bookRef.current.pageFlip().flipNext();
            }
        }
    };

    const handlePrevPage = () => {
        if (pageIndex > 0) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlaying(false);
            }
            setPageIndex(pageIndex - 2);
            if (bookRef.current) {
                bookRef.current.pageFlip().flipPrev();
            }
        }
    };

    const handleVoiceClick = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    return (
        <div className='containerbook'>
            <button onClick={() => navigate(`/style`)} className="button-back">返回</button>
            <button onClick={handleVoiceClick} className="button-audio">
                {isPlaying ? '暫停' : '播放'}
            </button>
            {data ? (
                <div className='book'>
                    // TODO 翻頁動畫、封面頁、使用者個人書籍管理、故事聲音還有問題
                    <HTMLFlipBook
                        style={{}}
                        startPage={0}
                        width={300}
                        height={400}
                        drawShadow={true}
                        flippingTime={10}
                        usePortrait={false}
                        startZIndex={0}
                        autoSize={true}
                        clickEventForward={true}
                        useMouseEvents={true}
                        swipeDistance={21}
                        showPageCorners={false}
                        disableFlipByClick={true}
                        size="stretch"
                        minWidth={250}
                        maxWidth={1000}
                        minHeight={300}
                        maxHeight={1533}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={true}
                        onFlip={() => { }}
                        onChangeOrientation={() => { }}
                        onChangeState={() => { }}
                        className="demo-book"
                        ref={bookRef}
                    >
                        {data.image_base64 && data.image_base64.map((image, index) => (
                            <Pageflip key={index} image={image} text={storyLines[index] || ''} />
                        ))}
                    </HTMLFlipBook>
                    <div className="navigation-container">
                        <button className='navigation-button' onClick={handlePrevPage}>上一頁</button>
                        <PdfTest data={data} storyLines={storyLines} />
                        <button className='navigation-button' onClick={handleNextPage}>下一頁</button>
                    </div>
                </div>
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
};

export default StartStory;
