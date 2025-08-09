// lib.deadlight/core/src/markdown/processor.js
import { marked } from 'marked';
import { filterXSS } from 'xss';

export class MarkdownProcessor {
  constructor(options = {}) {
    this.options = {
      gfm: true,
      breaks: true,
      headerIds: false,
      mangle: false,
      ...options
    };
    
    this.xssOptions = options.xssOptions || {
      whiteList: {
        h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
        p: [], br: [], hr: [],
        a: ['href', 'title', 'target', 'rel'],
        strong: [], em: [], del: [],
        ul: [], ol: [], li: [],
        code: ['class'], 
        pre: [],
        blockquote: [],
        table: [], thead: [], tbody: [], tr: [], th: [], td: []
      },
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    };

    this.setupRenderer();
  }

  setupRenderer() {
    marked.setOptions(this.options);
    
    this.renderer = new marked.Renderer();
    
    this.renderer.code = (code, language) => {
      const codeString = String(code || '');
      const lang = language || '';
      
      const escapedCode = codeString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      
      return `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
    };
    
    marked.use({ renderer: this.renderer });
  }

  render(content) {
    try {
      const html = marked(content);
      return filterXSS(html, this.xssOptions);
    } catch (error) {
      console.error('Markdown rendering error:', error);
      return content;
    }
  }

  // New approach: Extract excerpt from markdown, avoiding code blocks entirely
  extractExcerpt(content, maxLength = 300) {
    // Check for manual excerpt marker first
    const moreIndex = content.indexOf('<!--more-->');
    if (moreIndex !== -1) {
      return content.substring(0, moreIndex).trim();
    }
    
    // Split content into sections, avoiding code blocks
    const sections = [];
    const lines = content.split('\n');
    let insideCodeBlock = false;
    let currentSection = [];
    
    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        if (insideCodeBlock) {
          // End of code block - don't include it in excerpt
          insideCodeBlock = false;
          // If we have content, save it and stop here
          if (currentSection.length > 0) {
            sections.push(currentSection.join('\n'));
            break;
          }
        } else {
          // Start of code block - save what we have so far and stop
          insideCodeBlock = true;
          if (currentSection.length > 0) {
            sections.push(currentSection.join('\n'));
            break;
          }
        }
      } else if (!insideCodeBlock) {
        currentSection.push(line);
      }
    }
    
    // If we didn't hit a code block, add the final section
    if (currentSection.length > 0 && !insideCodeBlock) {
      sections.push(currentSection.join('\n'));
    }
    
    // Now work with the sections to create an appropriate excerpt
    const fullTextBeforeCodeBlocks = sections.join('\n').trim();
    
    if (!fullTextBeforeCodeBlocks) {
      return 'Read more...'; // Fallback if content starts with code block
    }
    
    // Now do paragraph-based truncation on the code-block-free content
    const paragraphs = fullTextBeforeCodeBlocks.split('\n\n').filter(p => p.trim());
    let excerptParagraphs = [];
    let currentLength = 0;
    
    for (const paragraph of paragraphs) {
      const textLength = paragraph
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/$$([^$$]+)\]$[^)]+$/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .trim().length;
      
      // Be more generous - allow longer excerpts
      if (currentLength + textLength > maxLength * 2 && excerptParagraphs.length >= 2) {
        break;
      }
      
      excerptParagraphs.push(paragraph);
      currentLength += textLength;
    }
    
    // Ensure we have at least one paragraph
    if (excerptParagraphs.length === 0 && paragraphs.length > 0) {
      excerptParagraphs.push(paragraphs[0]);
    }
    
    let excerpt = excerptParagraphs.join('\n\n').trim();
    
    // Add ellipsis if we truncated
    if (excerptParagraphs.length < paragraphs.length || content.includes('```')) {
      excerpt += '\n\n...';
    }
    
    return excerpt;
  }

  hasMore(content, maxLength = 300) {
    // Always show "read more" if there are code blocks
    if (content.includes('```')) {
      return true;
    }
    
    if (content.includes('<!--more-->')) {
      return true;
    }
    
    // Check text length
    const textLength = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/$$([^$$]+)\]$[^)]+$/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .length;
    
    return textLength > maxLength * 2;
  }
}

// Export singleton for backward compatibility
export const defaultProcessor = new MarkdownProcessor();

// Legacy function for easy migration
export function renderMarkdown(content) {
  return defaultProcessor.render(content);
}