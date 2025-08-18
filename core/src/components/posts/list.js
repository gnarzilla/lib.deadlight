// lib.deadlight/core/src/components/posts/list.js
import { MarkdownProcessor } from '../../markdown/index.js';
import { renderAuthorLink } from '../../utils/templates.js';

export class PostList {
  constructor(options = {}) {
    this.markdown = options.markdown || new MarkdownProcessor();
    this.showActions = options.showActions !== false;
    this.showAuthor = options.showAuthor !== false;
    this.showDate = options.showDate !== false;
    this.excerptLength = options.excerptLength || 300;
  }

  render(posts = [], options = {}) {
    const { user = null, baseUrl = '' } = options;
    
    if (posts.length === 0) {
      return '<p>No posts yet.</p>';
    }
    
    return posts.map(post => this.renderPost(post, user, baseUrl)).join('\n');
  }

  renderPost(post, user, baseUrl = '') {
    const excerpt = this.markdown.extractExcerpt(post.content, this.excerptLength);
    const hasMore = this.markdown.hasMore(post.content, this.excerptLength);
    
    return `
      <article class="post-preview">
        <h2><a href="${baseUrl}/post/${post.id}">${post.title}</a></h2>
        ${this.renderMeta(post)}
        <div class="post-excerpt">
          ${this.markdown.render(excerpt)}
        </div>
        <div class="post-footer">
          ${hasMore ? `<a href="${baseUrl}/post/${post.id}" class="read-more">Read more →</a>` : ''}
          ${user && this.showActions ? this.renderActions(post, baseUrl) : ''}
        </div>
      </article>
    `;
  }

  renderMeta(post) {
    const parts = [];
    
    if (this.showAuthor && post.author_username) {
      parts.push(`By ${renderAuthorLink(post.author_username)}`);
    }
    
    if (this.showDate && post.created_at) {
      parts.push(new Date(post.created_at).toLocaleDateString());
    }
    
    return parts.length > 0 
      ? `<div class="post-meta">${parts.join(' | ')}</div>`
      : '';
  }

  renderActions(post, baseUrl = '') {
    return `
      <div class="post-actions">
        <a href="${baseUrl}/admin/edit/${post.id}" class="button edit-button">Edit</a>
        <form class="delete-link" action="${baseUrl}/admin/delete/${post.id}" method="POST" style="display: inline;">
          <button type="submit" class="button delete-button">Delete</button>
        </form>
      </div>
    `;
  }
}