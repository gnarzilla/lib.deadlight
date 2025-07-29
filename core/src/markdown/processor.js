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
        a: ['href', 'title', 'target'],
        strong: [], em: [], del: [],
        ul: [], ol: [], li: [],
        code: ['class'], pre: [],
        blockquote: [],
        table: [], thead: [], tbody: [], tr: [], th: [], td: []
      }
    };
    
    this.setupRenderer();
  }

  setupRenderer() {
    marked.setOptions(this.options);
    
    this.renderer = new marked.Renderer();
    
    // Custom code block rendering
    this.renderer.code = (code, language) => {
      return `<pre><code class="language-${language}">${filterXSS(code)}</code></pre>`;
    };
    
    // Custom link rendering
    this.renderer.link = (href, title, text) => {
      if (href === null) {
        return text;
      }
      return `<a href="${filterXSS(href)}"${title ? ` title="${filterXSS(title)}"` : ''}>${text}</a>`;
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

  // Extract plain text excerpt
  extractExcerpt(content, maxLength = 300) {
    // Check for manual excerpt marker
    const moreIndex = content.indexOf('<!--more-->');
    if (moreIndex !== -1) {
      return content.substring(0, moreIndex).trim();
    }
    
    // Otherwise use automatic excerpt
    const plainText = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/$$([^$$]+)\]$[^)]+$/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\n{2,}/g, ' ')
      .replace(/\n/g, ' ')
      .trim();
    
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    const excerpt = plainText.substring(0, maxLength);
    const lastSpace = excerpt.lastIndexOf(' ');
    return excerpt.substring(0, lastSpace) + '...';
  }

  hasMore(content, maxLength = 300) {
    return content.includes('<!--more-->') || content.length > maxLength;
  }
}

// Export singleton for backward compatibility
export const defaultProcessor = new MarkdownProcessor();

// Legacy function for easy migration
export function renderMarkdown(content) {
  return defaultProcessor.render(content);
}
