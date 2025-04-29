import { useRef, useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

function App() {
    const [isStreaming, setIsStreaming] = useState(false);
    const [content, setContent] = useState('');
    const eventSourceRef = useRef<EventSource | null>(null);

    const startStream = () => {
        setIsStreaming(true);
        setContent(''); // 重置内容

        // 创建 SSE 连接
        const sse = new EventSource('/sse');
        eventSourceRef.current = sse;

        // 处理接收到的 SSE 消息
        sse.onmessage = async (event) => {
            try {
                console.log('收到 SSE 消息:', event.data);
                const data = JSON.parse(event.data);
                console.log('解析后的数据:', data, 'text 值:', data.text);

                if (data.text !== undefined) {
                    setContent(prev => prev + data.text);
                } else {
                    console.error('接收到的数据中没有 text 字段:', data);
                }

                // 如果传输完成
                if (data.done) {
                    console.log('传输完成, 关闭 SSE 连接');
                    sse.close();
                    eventSourceRef.current = null;
                    setIsStreaming(false);
                }
            } catch (error) {
                console.error('处理 SSE 消息时出错:', error);
            }
        };

        // 处理 SSE 错误
        sse.onerror = (error) => {
            console.error('SSE 连接错误:', error);
            sse.close();
            eventSourceRef.current = null;
            setIsStreaming(false);
        };
    };

    const stopStream = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setIsStreaming(false);
        }
    };

    return (
        <div className="container">
            <h1>Markdown 流式输出演示</h1>

            <div>
                <button
                    onClick={isStreaming ? stopStream : startStream}
                    style={{ backgroundColor: isStreaming ? '#ff4d4f' : '#1677ff' }}
                >
                    {isStreaming ? '停止' : '开始'}
                </button>
            </div>

            <div className="markdown-container" >
                {content ? <MarkdownRenderer content={content} /> : <p>等待数据流开始...</p>}
            </div>
        </div>
    );
}

export default App;