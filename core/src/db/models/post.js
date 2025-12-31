// core/src/db/models/post.js
import { BaseModel, DatabaseError } from '../base.js';
import { Logger } from '../../logging/logger.js';

export class PostModel extends BaseModel {
  constructor(db) {
    super(db);
    this.logger = new Logger({ context: 'PostModel' });
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 200);
  }

  async create({ title, content, slug, excerpt, author_id, published = false, visibility = 'public' }) {
    try {
      // Generate slug if not provided
      const finalSlug = slug || this.generateSlug(title);
      
      // Check if slug already exists
      const existing = await this.queryFirst('SELECT id FROM posts WHERE slug = ?', [finalSlug]);
      if (existing) {
        // Append timestamp to make it unique and retry
        const uniqueSlug = `${finalSlug}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.logger.warn('Duplicate slug detected, regenerating', { originalSlug: finalSlug, newSlug: uniqueSlug });
        return this.create({ title, content, slug: uniqueSlug, excerpt, author_id, published, visibility });
      }
      
      const result = await this.execute(
        'INSERT INTO posts (title, content, slug, excerpt, author_id, published, created_at, updated_at, visibility) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)',
        [title, content, finalSlug, excerpt || null, author_id, published ? 1 : 0, visibility] 
      );

      return await this.getById(result.meta.last_row_id);
    } catch (error) {
      this.logger.error('Failed to create post', { title, author_id, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to create post: ${error.message}`, 'CREATE_ERROR');
    }
  }

  async getById(id, options = {}) {
    try {
      let query = 'SELECT posts.*';
      if (options.includeAuthor) {
        query += ', users.username as author_username';
      }
      query += ' FROM posts';
      if (options.includeAuthor) {
        query += ' LEFT JOIN users ON posts.author_id = users.id';
      }
      query += ' WHERE posts.id = ?';
      
      return await this.queryFirst(query, [id]);
    } catch (error) {
      this.logger.error('Failed to get post by ID', { id, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to retrieve post by ID ${id}: ${error.message}`, 'FETCH_ERROR');
    }
  }

  async getBySlug(slug, options = {}) {
    try {
      let query = 'SELECT posts.*';
      if (options.includeAuthor) {
        query += ', users.username as author_username';
      }
      query += ' FROM posts';
      if (options.includeAuthor) {
        query += ' LEFT JOIN users ON posts.author_id = users.id';
      }
      query += ' WHERE posts.slug = ?';
      
      return await this.queryFirst(query, [slug]);
    } catch (error) {
      this.logger.error('Failed to get post by slug', { slug, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to retrieve post by slug "${slug}": ${error.message}`, 'FETCH_ERROR');
    }
  }

  async getPostsCreatedToday() {
    try {
      const result = await this.queryFirst(`
        SELECT COUNT(*) as count
        FROM posts
        WHERE date(created_at) = date('now')
      `);
      return result?.count || 0;
    } catch (error) {
      this.logger.error('Failed to get posts created today', { error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to get posts created today: ${error.message}`, 'FETCH_ERROR');
    }
  }

  async update(id, { title, content, slug, excerpt, published, visibility, comments_enabled, pinned }) { // Added comments_enabled
    try {
      let updates = [];
      let values = [];

      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }
      if (content !== undefined) {
        updates.push('content = ?');
        values.push(content);
      }
      if (slug !== undefined) {
        // If a new slug is provided and different from current, check for uniqueness
        const existingPost = await this.getById(id);
        const finalSlug = slug || this.generateSlug(title || existingPost.title); // Use existing title if new one not provided

        if (finalSlug !== existingPost.slug) {
          const existingWithNewSlug = await this.queryFirst('SELECT id FROM posts WHERE slug = ? AND id != ?', [finalSlug, id]);
          if (existingWithNewSlug) {
            // Consider throwing a specific error or handling unique slug generation here
            throw new DatabaseError(`Slug "${finalSlug}" already exists for another post.`, 'DUPLICATE_SLUG');
          }
        }
        updates.push('slug = ?');
        values.push(finalSlug);
      }
      if (excerpt !== undefined) {
        updates.push('excerpt = ?');
        values.push(excerpt);
      }
      if (published !== undefined) {
        updates.push('published = ?');
        values.push(published ? 1 : 0);
      }
      if (visibility !== undefined) {
        updates.push('visibility = ?');
        values.push(visibility);
      }
      // New: comments_enabled
      if (comments_enabled !== undefined) {
        updates.push('comments_enabled = ?');
        values.push(comments_enabled ? 1 : 0);
      }
      // Pinned update (for future implementation)
      if (pinned !== undefined) {
        updates.push('pinned = ?');
        values.push(pinned ? 1 : 0);
      }

      if (updates.length === 0) {
        this.logger.warn('No updates provided for post', { id });
        return await this.getById(id);
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');

      const updateQuery = `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`;
      values.push(id);

      await this.execute(updateQuery, values);

      return await this.getById(id);
    } catch (error) {
      this.logger.error('Failed to update post', { id, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to update post ID ${id}: ${error.message}`, 'UPDATE_ERROR');
    }
  }

  async delete(id) {
    try {
      const result = await this.execute('DELETE FROM posts WHERE id = ?', [id]);
      
      if (result.changes === 0) {
        throw new DatabaseError('Post not found', 'NOT_FOUND');
      }
      
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to delete post', { id, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to delete post ID ${id}: ${error.message}`, 'DELETE_ERROR');
    }
  }

  async getPaginated(options = {}) {
    try {
      const { 
        page = 1,
        limit = 10,
        publishedOnly = true, 
        postType = 'blog', 
        visibility = null, // Changed default to null to allow all if not specified
        authorId = null,
        tagId = null,
        orderBy = 'created_at',
        orderDirection = 'DESC',
        includeAuthor = false
      } = options;

      const offset = (page - 1) * limit;

      let whereClauses = [];
      let values = [];

      // Base filters
      if (publishedOnly) {
        whereClauses.push('posts.published = 1');
      }
      // Only apply postType filter if it's not null/undefined
      if (postType !== null && postType !== undefined) {
        whereClauses.push('posts.post_type = ?');
        values.push(postType);
      }
      
      // Visibility filter (only if explicitly provided)
      if (visibility !== null && visibility !== undefined) {
        whereClauses.push('posts.visibility = ?');
        values.push(visibility);
      }
      
      // Author filter
      if (authorId) {
        whereClauses.push('posts.author_id = ?');
        values.push(authorId);
      }

      // Tag filtering
      let joins = '';
      if (tagId) {
        joins += ' LEFT JOIN post_tags ON posts.id = post_tags.post_id';
        whereClauses.push('post_tags.tag_id = ?');
        values.push(tagId);
      }

      const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Build ORDER BY clause
      let orderByClause;
      if (orderBy === 'karma') {
        orderByClause = `(
          SELECT COUNT(*) FROM post_reactions WHERE post_id = posts.id AND reaction = 'like'
        ) - (
          SELECT COUNT(*) FROM post_reactions WHERE post_id = posts.id AND reaction = 'dislike'
        ) ${orderDirection}`;
      } else {
        // Sanitize column name to prevent SQL injection
        const allowedColumns = ['created_at', 'updated_at', 'title', 'id', 'slug'];
        const safeOrderBy = allowedColumns.includes(orderBy) ? orderBy : 'created_at';
        orderByClause = `posts.${safeOrderBy} ${orderDirection}`;
      }

      // Build SELECT clause
      let selectClause = 'posts.*';
      if (includeAuthor) {
        selectClause += ', users.username as author_username';
      }
      selectClause += `, (
        SELECT COUNT(*) FROM post_reactions WHERE post_id = posts.id AND reaction = 'like'
      ) - (
        SELECT COUNT(*) FROM post_reactions WHERE post_id = posts.id AND reaction = 'dislike'
      ) AS karma`;

      const query = `
        SELECT ${selectClause}
        FROM posts
        ${includeAuthor ? 'LEFT JOIN users ON posts.author_id = users.id' : ''}
        ${joins}
        ${whereString}
        ORDER BY ${orderByClause}
        LIMIT ? OFFSET ?
      `;

      values.push(limit, offset);

      const posts = await this.query(query, values);

      // Get total count
      // Remove limit/offset values from count query as they're not relevant
      const countQueryValues = values.slice(0, values.length - 2); 
      const countQuery = `
        SELECT COUNT(DISTINCT posts.id) as total 
        FROM posts
        ${joins}
        ${whereString}
      `;
      const countResult = await this.queryFirst(countQuery, countQueryValues);

      const totalCount = countResult?.total || 0;

      return {
        posts,
        totalCount: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      };
    } catch (error) {
      this.logger.error('Failed to get paginated posts', { options, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to retrieve paginated posts: ${error.message}`, 'FETCH_ERROR');
    }
  }

  async list({ limit = 10, offset = 0, orderBy = 'created_at', orderDirection = 'DESC', includeAuthor = false, publishedOnly = false, postType = 'blog', visibility = null } = {}) {

    const page = Math.floor(offset / limit) + 1;
    
    const result = await this.getPaginated({
      page,
      limit,
      includeAuthor,
      orderBy,
      orderDirection,
      publishedOnly,
      postType,
      visibility
    });
    
    return result.posts;
  }

  async getNavigation(currentId, publishedOnly = true) {
    try {
      const whereClause = publishedOnly ? ' AND published = 1' : '';
      
      return await this.queryFirst(`
        SELECT 
          (SELECT id FROM posts WHERE id < ?${whereClause} ORDER BY id DESC LIMIT 1) as prev_id,
          (SELECT title FROM posts WHERE id < ?${whereClause} ORDER BY id DESC LIMIT 1) as prev_title,
          (SELECT slug FROM posts WHERE id < ?${whereClause} ORDER BY id DESC LIMIT 1) as prev_slug,
          (SELECT id FROM posts WHERE id > ?${whereClause} ORDER BY id ASC LIMIT 1) as next_id,
          (SELECT title FROM posts WHERE id > ?${whereClause} ORDER BY id ASC LIMIT 1) as next_title,
          (SELECT slug FROM posts WHERE id > ?${whereClause} ORDER BY id ASC LIMIT 1) as next_slug
      `, [currentId, currentId, currentId, currentId, currentId, currentId]);
    } catch (error) {
      this.logger.error('Failed to get post navigation', { currentId, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to retrieve navigation for post ID ${currentId}: ${error.message}`, 'FETCH_ERROR');
    }
  }

  async getByAuthorId(authorId, options = {}) {
    try {
      const { limit = 50, offset = 0, publishedOnly = false, postType = null } = options;
      
      let query = 'SELECT posts.*';
      if (options.includeAuthor) {
        query += ', users.username as author_username';
      }
      query += ' FROM posts';
      if (options.includeAuthor) {
        query += ' LEFT JOIN users ON posts.author_id = users.id';
      }
      query += ' WHERE posts.author_id = ?';
      if (publishedOnly) {
        query += ' AND posts.published = 1';
      }
      if (postType !== null && postType !== undefined) {
        query += ' AND posts.post_type = ?';
      }
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      
      const values = [authorId];
      if (postType !== null && postType !== undefined) {
        values.push(postType);
      }
      values.push(limit, offset);

      return await this.query(query, values);
    } catch (error) {
      this.logger.error('Failed to get posts by author ID', { authorId, options, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to retrieve posts by author ID ${authorId}: ${error.message}`, 'FETCH_ERROR');
    }
  }

  async count(publishedOnly = false, postType = null) {
    try {
      let whereClauses = [];
      let values = [];

      if (publishedOnly) {
        whereClauses.push('published = 1');
      }
      if (postType !== null && postType !== undefined) {
        whereClauses.push('post_type = ?');
        values.push(postType);
      }

      const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      const result = await this.queryFirst(`SELECT COUNT(*) as total FROM posts ${whereString}`, values);
      return result?.total || 0;
    } catch (error) {
      this.logger.error('Failed to count posts', { publishedOnly, postType, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to count posts: ${error.message}`, 'FETCH_ERROR');
    }
  }

  async countToday() { 
    try {
      const result = await this.queryFirst(`
        SELECT COUNT(*) as count
        FROM posts
        WHERE date(created_at) = date('now')
      `);
      return result?.count || 0;
    } catch (error) {
      this.logger.error('Failed to count posts created today', { error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to count posts created today: ${error.message}`, 'FETCH_ERROR');
    }
  }

  async togglePublished(id) {
    try {
      const result = await this.execute(
        'UPDATE posts SET published = NOT published, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      
      if (result.changes === 0) {
        throw new DatabaseError('Post not found', 'NOT_FOUND');
      }
      
      return await this.getById(id);
    } catch (error) {
      this.logger.error('Failed to toggle post published status', { id, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to toggle published status for post ID ${id}: ${error.message}`, 'UPDATE_ERROR');
    }
  }

  async recordReaction(postId, userId, reaction) {
    try {
      if (reaction !== 'like' && reaction !== 'dislike') {
        // This is a validation error, not a database error primarily
        throw new Error('Invalid reaction type. Must be "like" or "dislike".');
      }
      
      const existing = await this.queryFirst(
        'SELECT reaction FROM post_reactions WHERE post_id = ? AND user_id = ?', 
        [postId, userId]
      );

      if (existing && existing.reaction === reaction) {
          await this.execute(
              'DELETE FROM post_reactions WHERE post_id = ? AND user_id = ?',
              [postId, userId]
          );
      } else {
          await this.execute(
              'INSERT OR REPLACE INTO post_reactions (post_id, user_id, reaction, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
              [postId, userId, reaction]
          );
      }
      return this.getKarma(postId);
    } catch (error) {
      this.logger.error('Failed to record reaction', { postId, userId, reaction, error: error.message, stack: error.stack });
      // Re-throw if it was a custom error, otherwise wrap as DatabaseError
      if (error instanceof Error && error.message.includes('Invalid reaction type')) {
        throw error; // Re-throw the validation error
      }
      throw new DatabaseError(`Failed to record reaction for post ID ${postId}: ${error.message}`, 'REACTION_ERROR');
    }
  }

  async getKarma(postId) {
    try {
      const result = await this.queryFirst(`
        SELECT 
          (SELECT COUNT(*) FROM post_reactions WHERE post_id = ? AND reaction = 'like') - 
          (SELECT COUNT(*) FROM post_reactions WHERE post_id = ? AND reaction = 'dislike') AS karma
      `, [postId, postId]);
      
      return result?.karma || 0;
    } catch (error) {
      this.logger.error('Failed to get karma for post', { postId, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to retrieve karma for post ID ${postId}: ${error.message}`, 'FETCH_ERROR');
    }
  }

  /**
   * Fetches a single comment by ID, including author username.
   * @param {number} commentId
   * @returns {Promise<object|null>}
   */
  async getCommentById(commentId) {
    try {
      return await this.queryFirst(`
        SELECT p.*, u.username as author_username
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.id = ? AND p.post_type = 'comment'
      `, [commentId]);
    } catch (error) {
      this.logger.error('Failed to get comment by ID', { commentId, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to retrieve comment ID ${commentId}: ${error.message}`, 'COMMENT_FETCH_ERROR');
    }
  }

  /**
   * Fetches threaded comments for a given post ID.
   * NOTE: This method is likely better in a dedicated CommentService or FederationService
   * as its current implementation in admin.js uses FederationService for `getThreadedComments`.
   * @param {number} postId
   * @returns {Promise<Array>}
   */
  async getThreadedComments(postId) {
    this.logger.warn('getThreadedComments in PostModel is a placeholder. Check FederationService for actual implementation.');
    try {
      // This is a simplified example
      // Assuming comments are posts with parent_id or thread_id pointing to the original post or another comment.
      const comments = await this.query(`
        SELECT p.*, u.username AS author_username
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE (p.parent_id = ? OR p.thread_id = ?) AND p.post_type = 'comment'
        ORDER BY p.created_at ASC
      `, [postId, postId]);
      // need additional JS logic here to build the "threaded" structure?
      return comments;
    } catch (error) {
      this.logger.error('Failed to get threaded comments for post', { postId, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to retrieve comments for post ID ${postId}: ${error.message}`, 'COMMENTS_FETCH_ERROR');
    }
  }

  /**
   * Fetches posts that are of type 'federated' and 'pending' moderation.
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getPendingModerationPosts(limit = 100) {
    try {
      const posts = await this.query(`
        SELECT id, title, content, author_id, created_at, moderation_notes
        FROM posts
        WHERE post_type = 'federated'
          AND moderation_status = 'pending'
        ORDER BY created_at DESC
        LIMIT ?
      `, [limit]);
      return posts;
    } catch (error) {
      this.logger.error('Failed to get pending moderation posts', { limit, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to retrieve pending moderation posts: ${error.message}`, 'MODERATION_FETCH_ERROR');
    }
  }

  /**
   * Fetches posts that are email reply drafts and not yet marked as sent.
   * @returns {Promise<Array>}
   */
  async getPendingReplyDrafts() {
    try {
      const replies = await this.query(`
        SELECT * FROM posts 
        WHERE is_reply_draft = 1 
          AND email_metadata LIKE '%"sent":false%'
      `);
      // Parse metadata for convenience
      return replies.map(reply => ({
        ...reply,
        email_metadata: reply.email_metadata ? JSON.parse(reply.email_metadata) : {}
      }));
    } catch (error) {
      this.logger.error('Failed to get pending reply drafts', { error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to retrieve pending reply drafts: ${error.message}`, 'REPLY_DRAFT_FETCH_ERROR');
    }
  }

  /**
   * Marks an email reply draft as sent by updating its metadata.
   * @param {number} replyId
   * @returns {Promise<boolean>} Success status.
   */
  async markReplyDraftSent(replyId) {
    try {
      const reply = await this.queryFirst(
        'SELECT email_metadata FROM posts WHERE id = ? AND is_reply_draft = 1',
        [replyId]
      );
      if (!reply) {
        throw new DatabaseError('Reply draft not found', 'NOT_FOUND');
      }

      const metadata = reply.email_metadata ? JSON.parse(reply.email_metadata) : {};
      metadata.sent = true;
      metadata.date_sent = new Date().toISOString();

      const result = await this.execute(
        'UPDATE posts SET email_metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [JSON.stringify(metadata), replyId]
      );
      return result.changes > 0;
    } catch (error) {
      this.logger.error('Failed to mark reply draft as sent', { replyId, error: error.message, stack: error.stack });
      throw new DatabaseError(`Failed to mark reply draft ID ${replyId} as sent: ${error.message}`, 'REPLY_DRAFT_UPDATE_ERROR');
    }
  }
}