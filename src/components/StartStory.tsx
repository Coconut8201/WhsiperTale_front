import React, { useEffect, useState, useRef, useMemo, forwardRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StartStory_api, GetVoice, makeZhuyin } from '../utils/tools/fetch';
import '../styles/StartStory.css';
import { pdf, Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import HTMLFlipBook from "react-pageflip";

Font.register({
    family: "Noto Sans TC",
    src: "/Assets/NotoSansTC-VariableFont_wght.ttf",
});

Font.register({
    family: "Bopomofo Ruby",
    src: "/font/Bopomofo Ruby 1909 Regular.ttf",
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
        textAlign: 'left',
        width: '80%',
        fontFamily: 'Noto Sans TC',
        lineHeight: 1.2,
        marginTop: 10,
    },
    rubyText: {
        fontFamily: 'Bopomofo Ruby',
        fontSize: 8,
    }
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
    text: JSX.Element | string;
    isLeft?: boolean;
    isSpreadImage?: boolean;
}

const Pageflip = forwardRef<HTMLDivElement, PageflipProps>(({ image, text, isLeft = true, isSpreadImage = false }, ref) => {
    return (
        <div className="pagefilp" ref={ref}>
            <div style={{
                width: '100%',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <img
                    src={`data:image/png;base64,${image}`}
                    alt="Story image"
                    style={{
                        width: isSpreadImage ? '200%' : '100%',
                        height: 'auto',
                        display: 'block',
                        transform: isSpreadImage && !isLeft ? 'translateX(-50%)' : 'none'
                    }}
                />
            </div>
            <pre className="pre">{text}</pre>
        </div>
    );
});

const LoadingSpinner: React.FC = () => (
    <div className="loading-spinner">
        <div className="spinner"></div>
        <p>故事載入中...</p>
    </div>
);

interface StoryWithZhuyin {
    zhuyin: string[][] | { error: boolean; message: string };
}

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
    const [zhuyinData, setZhuyinData] = useState<StoryWithZhuyin[]>([]);

    const storyLines = useMemo(() => {
        if (!data?.storyTale) return [];
        const lines = data.storyTale.split('\n\n').map(line => line.trim());

        const fetchZhuyinForLines = async () => {
            try {
                const zhuyinPromises = lines.map(line => makeZhuyin(line));
                let zhuyinResults = await Promise.all(zhuyinPromises);

                // 先處理標點符號和基本格式
                zhuyinResults = zhuyinResults.map(result => {
                    if (Array.isArray(result)) {
                        return result.flatMap(char => {
                            const chinesePunctuationRegex = /[。，、；：？！…—·「」『』（）《》〈〉【】〔〕\u3000-\u303F\uFF00-\uFFEF]/;
                            if (chinesePunctuationRegex.test(char[0])) {
                                return Array(char[0].length).fill([]);
                            }
                            // 處理輕聲符號
                            if (char[0] && char[0].includes('\u02D9')) {
                                const zhuyinArr = char[0].split('');
                                const lightToneIndex = zhuyinArr.indexOf('\u02D9');
                                zhuyinArr.splice(lightToneIndex, 1);
                                char[0] = '\u02D9' + zhuyinArr.join('');
                            }
                            return [char];
                        });
                    }
                    return result;
                });
                console.log('zhuyinResults:', zhuyinResults);
                const formattedZhuyinResults = zhuyinResults.map(result => ({
                    zhuyin: result
                }));
                setZhuyinData(formattedZhuyinResults);
            } catch (error) {
                console.error('Error fetching zhuyin:', error);
            }
        };

        fetchZhuyinForLines();
        return lines;
    }, [data?.storyTale]);

    const formatText = (text: string, index: number, maxLineLength: number = 23): JSX.Element => {
        if (!zhuyinData?.[index] || 'error' in zhuyinData[index].zhuyin) {
            return <span>{text}</span>;
        }

        const zhuyinArray = (zhuyinData[index].zhuyin as string[][]);

        const combinedElements = text.split('').map((char, i) => {
            let charIndex = i;
            const chinesePunctuationRegex = /[。，、；：？！…—·「」『』（）《》〈〉【】〔〕\u3000-\u303F\uFF00-\uFFEF]/;
            const isPunctuation = chinesePunctuationRegex.test(char);

            const zhuyin = isPunctuation ? '' : (zhuyinArray[charIndex]?.join('') || '');
            return (
                <ruby key={i}>
                    {char}
                    {zhuyin && <rt>{zhuyin}</rt>}
                </ruby>
            );
        });

        let currentLine: JSX.Element[] = [];
        let lines: JSX.Element[] = [];
        let lineLength = 0;

        combinedElements.forEach((element, index) => {
            currentLine.push(element);
            lineLength++;

            if (lineLength >= maxLineLength || text[index] === '\n') {
                lines.push(<div key={`line-${lines.length}`} className="text-line">{currentLine}</div>);
                currentLine = [];
                lineLength = 0;
            }
        });

        if (currentLine.length > 0) {
            lines.push(<div key={`line-${lines.length}`} className="text-line">{currentLine}</div>);
        }

        return <div className="text-container">{lines}</div>;
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
                                        {formatText(storyLines[index] || '', index)}
                                    </Text>
                                </View>
                                {data.image_base64 && data.image_base64[index + 1] && (
                                    <View style={pdf_styles.halfPage}>
                                        <Image
                                            src={`data:image/png;base64,${data.image_base64[index + 1]}`}
                                            style={pdf_styles.storyImage}
                                        />
                                        <Text style={pdf_styles.storyText}>
                                            {formatText(storyLines[index + 1] || '', index)}
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
                <button className='button-Previous-Next-Page' onClick={generatePDF}>下載pdf檔案</button>
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
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                        setIsPlaying(false);
                    }

                    if (pageIndex >= 1) {
                        const audioBlob = await GetVoice(storyId, pageIndex);
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
                }
            } catch (error) {
                console.error('Error fetching audio:', error);
            }
        };
        fetchAudio();

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
            <button onClick={() => navigate('/bookmanage')} className="button-back">返回</button>
            {pageIndex >= 1 && (
                <button onClick={handleVoiceClick} className="button-audio">
                    {isPlaying ? '暫停' : '播放'}
                </button>
            )}
            {loading ? (
                <LoadingSpinner />
            ) : data ? (
                <div className='book'>
                    <HTMLFlipBook
                        style={{}}
                        startPage={0}
                        width={600}
                        height={700}
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
                        maxHeight={1000}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={true}
                        onFlip={() => { }}
                        onChangeOrientation={() => { }}
                        onChangeState={() => { }}
                        className="demo-book"
                        ref={bookRef}
                    >
                        {data?.image_base64 && [
                            // 首頁
                            <Pageflip
                                key="page-cover"
                                image={data.image_base64[0]}
                                text={formatText(storyLines[0] || '', 0)}
                                isLeft={false}
                                isSpreadImage={false}
                            />,
                            // 其餘頁面
                            ...data.image_base64.slice(1).map((_, index) => {
                                const imageIndex = index + 1; // +1 因為首頁已經使用了第一張圖
                                const currentImage = data?.image_base64?.[imageIndex];

                                if (!currentImage) return null;
                                return [
                                    <Pageflip
                                        key={`page-${index}-left`}
                                        image={currentImage}
                                        text={''}
                                        isLeft={true}
                                        isSpreadImage={true}
                                    />,
                                    <Pageflip
                                        key={`page-${index}-right`}
                                        image={currentImage}
                                        text={formatText(storyLines[imageIndex] || '', imageIndex)}
                                        isLeft={false}
                                        isSpreadImage={true}
                                    />
                                ];
                            }).filter(Boolean)
                        ]}
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
