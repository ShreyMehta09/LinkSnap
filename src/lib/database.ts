// Simple in-memory database for demonstration
// In production, you would use a real database like PostgreSQL, MySQL, or SQLite

interface URLRecord {
  id: string
  original_url: string
  short_code: string
  created_at: string
  clicks: number
}

class InMemoryDatabase {
  private urls: URLRecord[] = []

  prepare(query: string) {
    return {
      run: (...params: any[]) => {
        if (query.includes('INSERT INTO urls')) {
          const [id, original_url, short_code, created_at, clicks] = params
          this.urls.push({ id, original_url, short_code, created_at, clicks })
          return { lastInsertRowid: id }
        }
        
        if (query.includes('UPDATE urls SET clicks')) {
          const [short_code] = params
          const url = this.urls.find(u => u.short_code === short_code)
          if (url) {
            url.clicks += 1
          }
          return { changes: url ? 1 : 0 }
        }
        
        return { lastInsertRowid: null, changes: 0 }
      },
      
      get: (...params: any[]) => {
        if (query.includes('SELECT original_url FROM urls WHERE short_code')) {
          const [short_code] = params
          return this.urls.find(u => u.short_code === short_code)
        }
        return undefined
      },
      
      all: (...params: any[]) => {
        return this.urls
      }
    }
  }
}

let db: InMemoryDatabase

export function getDatabase() {
  if (!db) {
    db = new InMemoryDatabase()
  }
  return db
}