// lib.deadlight/core/src/components/posts/pagination.js
export class Pagination {
  constructor(options = {}) {
    this.maxPagesToShow = options.maxPagesToShow || 5;
    this.baseUrl = options.baseUrl || '/';
  }

  render(data) {
    if (!data || data.totalPages <= 1) return '';

    const { 
      currentPage, 
      totalPages, 
      hasPrevious, 
      hasNext,
      extraParams = '' // Add support for extra parameters like sort
    } = data;

    // Build query string
    const buildUrl = (page) => {
      const params = [`page=${page}`];
      if (extraParams) params.push(extraParams);
      return `${this.baseUrl}?${params.join('&')}`;
    };

    let html = '<div class="pagination">';
    
    if (hasPrevious) {
      html += `<a href="${buildUrl(currentPage - 1)}" class="pagination-prev">← Previous</a>`;
    }
    
    html += `<span class="pagination-info">Page ${currentPage} of ${totalPages}</span>`;
    
    if (hasNext) {
      html += `<a href="${buildUrl(currentPage + 1)}" class="pagination-next">Next →</a>`;
    }
    
    html += '</div>';
    
    return html;
  }

  render(pagination) {
    if (!pagination || pagination.totalPages <= 1) {
      return '';
    }

    const { currentPage, totalPages, hasPrevious, hasNext, previousPage, nextPage } = pagination;
    
    const pageNumbers = this.getPageNumbers(currentPage, totalPages);

    return `
      <nav class="pagination" aria-label="Pagination Navigation">
        ${this.renderNavButtons(hasPrevious, hasNext, previousPage, nextPage, totalPages)}
        ${this.renderPageNumbers(pageNumbers, currentPage, totalPages)}
        <div class="pagination-info">Page ${currentPage} of ${totalPages}</div>
      </nav>
    `;
  }

  getPageNumbers(currentPage, totalPages) {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - Math.floor(this.maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + this.maxPagesToShow - 1);
    
    if (endPage - startPage < this.maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - this.maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return { pageNumbers, startPage, endPage };
  }

  renderNavButtons(hasPrevious, hasNext, previousPage, nextPage, totalPages) {
    return `
      ${hasPrevious ? `
        <a href="${this.baseUrl}?page=1" class="pagination-link pagination-first" aria-label="First page">≪</a>
        <a href="${this.baseUrl}?page=${previousPage}" class="pagination-link pagination-prev" aria-label="Previous page">‹</a>
      ` : `
        <span class="pagination-link pagination-disabled">≪</span>
        <span class="pagination-link pagination-disabled">‹</span>
      `}
      
      ${hasNext ? `
        <a href="${this.baseUrl}?page=${nextPage}" class="pagination-link pagination-next" aria-label="Next page">›</a>
        <a href="${this.baseUrl}?page=${totalPages}" class="pagination-link pagination-last" aria-label="Last page">≫</a>
      ` : `
        <span class="pagination-link pagination-disabled">›</span>
        <span class="pagination-link pagination-disabled">≫</span>
      `}
    `;
  }

  renderPageNumbers({ pageNumbers, startPage, endPage }, currentPage, totalPages) {
    return `
      ${startPage > 1 ? '<span class="pagination-ellipsis">...</span>' : ''}
      
      ${pageNumbers.map(num => 
        num === currentPage 
          ? `<span class="pagination-link pagination-current" aria-current="page">${num}</span>`
          : `<a href="${this.baseUrl}?page=${num}" class="pagination-link">${num}</a>`
      ).join('')}
      
      ${endPage < totalPages ? '<span class="pagination-ellipsis">...</span>' : ''}
    `;
  }
}
