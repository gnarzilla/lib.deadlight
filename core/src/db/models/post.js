// core/src/db/models/post.js
import { BaseModel, DatabaseError } from '../base.js';

export class PostModel extends BaseModel {
  // Helper to generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 200);
  }

  async create({ title, content, slug, excerpt, author_id, published = false }) {
    try {
      // Generate slug if not provided
      const finalSlug = slug || this.generateSlug(title);
      
      // Check if slug already exists
      const existing = await this.queryFirst('SELECT id FROM posts WHERE slug = ?', [finalSlug]);
      if (existing) {
        // Append timestamp to make it unique
        const uniqueSlug = `${finalSlug}-${Date.now()}`;
        return this.create({ title, content, slug: uniqueSlug, excerpt, author_id, published });
      }
      
      const result = await this.execute(
        'INSERT INTO posts (title, content, slug, excerpt, author_id, published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [title, content, finalSlug, excerpt || null, author_id, published ? 1 : 0]
      );

      return await this.getById(result.meta.last_row_id);
    } catch (error) {
      throw new DatabaseError(`Failed to create post: ${error.message}`, 'CREATE_ERROR');
    }
  }

  async getById(id, options = {}) {
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
  }

  async getBySlug(slug, options = {}) {
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
  }

  async update(id, { title, content, slug, excerpt, published }) {
    const updates = [];
    const values = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    if (slug !== undefined) {
      updates.push('slug = ?');
      values.push(slug);
    }
    if (excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(excerpt);
    }
    if (published !== undefined) {
      updates.push('published = ?');
      values.push(published ? 1 : 0);
    }
    
    if (updates.length === 0) {
      throw new DatabaseError('No fields to update', 'INVALID_UPDATE');
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const result = await this.execute(
      `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    if (result.changes === 0) {
      throw new DatabaseError('Post not found', 'NOT_FOUND');
    }
    
    return await this.getById(id);
  }

  async delete(id) {
    const result = await this.execute('DELETE FROM posts WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      throw new DatabaseError('Post not found', 'NOT_FOUND');
    }
    
    return { success: true };
  }

  async getPaginated({ 
    page = 1, 
    limit = 10, 
    includeAuthor = false, 
    orderBy = 'created_at', 
    orderDirection = 'DESC',
    publishedOnly = true 
  }) {
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = publishedOnly ? ' WHERE posts.published = 1' : '';
    
    // Get total count
    const countResult = await this.queryFirst(`SELECT COUNT(*) as total FROM posts${whereClause}`);
    const totalPosts = countResult.total;
    const totalPages = Math.ceil(totalPosts / limit);
    
    // Build query
    let query = 'SELECT posts.*';
    if (includeAuthor) {
      query += ', users.username as author_username';
    }
    query += ' FROM posts';
    if (includeAuthor) {
      query += ' LEFT JOIN users ON posts.author_id = users.id';
    }
    query += whereClause;
    query += ` ORDER BY posts.${orderBy} ${orderDirection} LIMIT ? OFFSET ?`;
    
    const result = await this.query(query, [limit, offset]);
    
    const pagination = {
      currentPage: page,
      totalPages,
      totalPosts,
      postsPerPage: limit,
      hasPrevious: page > 1,
      hasNext: page < totalPages,
      previousPage: page - 1,
      nextPage: page + 1
    };
    
    return {
      posts: result.results || result,
      pagination
    };
  }

  async getNavigation(currentId, publishedOnly = true) {
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
  }

  async getByAuthorId(authorId, options = {}) {
    const { limit = 50, offset = 0, publishedOnly = false } = options;
    
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
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
    return await this.query(query, [authorId, limit, offset]);
  }

  async count(publishedOnly = false) {
    const whereClause = publishedOnly ? ' WHERE published = 1' : '';
    const result = await this.queryFirst(`SELECT COUNT(*) as total FROM posts${whereClause}`);
    return result.total;
  }

  async togglePublished(id) {
    const result = await this.execute(
      'UPDATE posts SET published = NOT published, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    if (result.changes === 0) {
      throw new DatabaseError('Post not found', 'NOT_FOUND');
    }
    
    return await this.getById(id);
  }
}