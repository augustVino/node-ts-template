import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  })
);
app.use(express.static(path.join(__dirname, '../dist')));

// 简单的测试接口，检查服务器是否响应
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.get('/sse', (req, res) => {
  console.log('收到 SSE 请求');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.flushHeaders();

  // 发送一个初始化消息
  res.write(`data: ${JSON.stringify({ text: '', done: false })}\n\n`);

  const markdownPath = path.join(__dirname, 'sample.md');
  console.log('读取文件:', markdownPath);

  const markdownContent = fs.readFileSync(markdownPath, 'utf-8');
  console.log(`加载了 ${markdownContent.length} 字节的 Markdown 内容`);

  // 将整个 Markdown 内容拆分成 3 个字符一组的块
  const chunkSize = 3;
  const chunks: string[] = [];

  for (let i = 0; i < markdownContent.length; i += chunkSize) {
    chunks.push(markdownContent.substring(i, i + chunkSize));
  }

  let currentChunk = 0;

  console.log(`总共 ${chunks.length} 个块，准备开始传输`);

  // 每 100 毫秒发送一个 3 字符块
  const interval = setInterval(() => {
    if (currentChunk < chunks.length) {
      const data = {
        text: chunks[currentChunk],
        done: currentChunk === chunks.length - 1
      };

      console.log(`发送第 ${currentChunk + 1}/${chunks.length} 块: ${data.text}`);
      res.write(`data: ${JSON.stringify(data)}`);
      currentChunk++;
    } else {
      console.log('所有内容已发送，结束 SSE 连接');
      clearInterval(interval);
      res.end();
    }
  }, 100);

  // 客户端断开连接时清除定时器
  req.on('close', () => {
    console.log('客户端关闭了连接');
    clearInterval(interval);
  });
});

app.listen(port, () => {
  console.log(`服务器已启动，监听端口 ${port}`);
});
