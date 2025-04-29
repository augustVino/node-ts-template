import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 修改 marked 配置
marked.setOptions({
  breaks: true, // 自动换行
  gfm: true // 启用 GFM
});

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const htmlContent = marked.parse(content);
  const sanitizedContent = DOMPurify.sanitize(htmlContent as string);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};

export default MarkdownRenderer;
