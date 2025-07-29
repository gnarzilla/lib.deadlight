// core/src/db/models/post.js
import { BaseModel, DatabaseError } from '../base.js';

export class PostModel extends BaseModel {
  async create({ title, content, userId }) {
    try {
      const result = await this.execute(
        'INSERT INTO posts (title, content, user_id, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [title, content, userId]
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
      query += ' JOIN users ON posts.user_id = users.id';
    }
    query += ' WHERE posts.id = ?';
    
    return await this.queryFirst(query, [id]);
  }

  async update(id, { title, content }) {
    const result = await this.execute(
      'UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, content, id]
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

  async getPaginated({ page = 1, limit = 10, includeAuthor = false, orderBy = 'created_at', orderDirection = 'DESC' }) {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await this.queryFirst('SELECT COUNT(*) as total FROM posts');
    const totalPosts = countResult.total;
    const totalPages = Math.ceil(totalPosts / limit);
    
    // Build query
    let query = 'SELECT posts.*';
    if (includeAuthor) {
      query += ', users.username as author_username';
    }
    query += ' FROM posts';
    if (includeAuthor) {
      query += ' JOIN users ON posts.user_id = users.id';
    }
    query += ` ORDER BY ${orderBy} ${orderDirection} LIMIT ? OFFSET ?`;
    
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

  async getNavigation(currentId) {
    return await this.queryFirst(`
      SELECT 
        (SELECT id FROM posts WHERE id < ? ORDER BY id DESC LIMIT 1) as prev_id,
        (SELECT title FROM posts WHERE id < ? ORDER BY id DESC LIMIT 1) as prev_title,
        (SELECT id FROM posts WHERE id > ? ORDER BY id ASC LIMIT 1) as next_id,
        (SELECT title FROM posts WHERE id > ? ORDER BY id ASC LIMIT 1) as next_title
    `, [currentId, currentId, currentId, currentId]);
  }

  async getByUserId(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    let query = 'SELECT posts.*';
    if (options.includeAuthor) {
      query += ', users.username as author_username';
    }
    query += ' FROM posts';
    if (options.includeAuthor) {
      query += ' JOIN users ON posts.user_id = users.id';
    }
    query += ' WHERE posts.user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
    return await this.query(query, [userId, limit, offset]);
  }

  async count() {
    const result = await this.queryFirst('SELECT COUNT(*) as total FROM posts');
    return result.total;
  }
}
