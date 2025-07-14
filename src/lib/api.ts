
const API_BASE = 'http://localhost:3001';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Question {
  id: number;
  categoryId: number;
  keywords: string[];
  title: string;
  description: string;
}

export interface Solution {
  id: number;
  questionId: number;
  step: number;
  text: string;
  type: 'text' | 'image' | 'link';
  helpfulLinks: string[];
}

export interface Conversation {
  id: number;
  timestamp: string;
  messages: Array<{
    type: 'user' | 'bot';
    content: string;
    timestamp: string;
  }>;
}

// API functions
export const api = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE}/categories`);
    return response.json();
  },

  createCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    return response.json();
  },

  updateCategory: async (id: number, category: Partial<Category>): Promise<Category> => {
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    return response.json();
  },

  deleteCategory: async (id: number): Promise<void> => {
    await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
  },

  // Questions
  getQuestions: async (search?: string): Promise<Question[]> => {
    const url = search ? `${API_BASE}/questions?q=${encodeURIComponent(search)}` : `${API_BASE}/questions`;
    const response = await fetch(url);
    return response.json();
  },

  searchQuestions: async (query: string): Promise<Question[]> => {
    const questions = await api.getQuestions();
    const lowercaseQuery = query.toLowerCase();
    
    return questions.filter(question => 
      question.keywords.some(keyword => 
        keyword.toLowerCase().includes(lowercaseQuery)
      ) ||
      question.title.toLowerCase().includes(lowercaseQuery) ||
      question.description.toLowerCase().includes(lowercaseQuery)
    );
  },

  createQuestion: async (question: Omit<Question, 'id'>): Promise<Question> => {
    const response = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
    return response.json();
  },

  updateQuestion: async (id: number, question: Partial<Question>): Promise<Question> => {
    const response = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
    return response.json();
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await fetch(`${API_BASE}/questions/${id}`, { method: 'DELETE' });
  },

  // Solutions
  getSolutions: async (questionId?: number): Promise<Solution[]> => {
    const url = questionId ? `${API_BASE}/solutions?questionId=${questionId}` : `${API_BASE}/solutions`;
    const response = await fetch(url);
    const solutions = await response.json();
    return solutions.sort((a: Solution, b: Solution) => a.step - b.step);
  },

  getSolutionStep: async (questionId: number, step: number): Promise<Solution | null> => {
    const response = await fetch(`${API_BASE}/solutions?questionId=${questionId}&step=${step}`);
    const solutions = await response.json();
    return solutions[0] || null;
  },

  createSolution: async (solution: Omit<Solution, 'id'>): Promise<Solution> => {
    const response = await fetch(`${API_BASE}/solutions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(solution),
    });
    return response.json();
  },

  updateSolution: async (id: number, solution: Partial<Solution>): Promise<Solution> => {
    const response = await fetch(`${API_BASE}/solutions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(solution),
    });
    return response.json();
  },

  deleteSolution: async (id: number): Promise<void> => {
    await fetch(`${API_BASE}/solutions/${id}`, { method: 'DELETE' });
  },

  // Users
  getUserByEmail: async (email: string): Promise<User | null> => {
    const response = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}`);
    const users = await response.json();
    return users[0] || null;
  },

  // Conversations
  saveConversation: async (conversation: Omit<Conversation, 'id'>): Promise<Conversation> => {
    const response = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversation),
    });
    return response.json();
  },
};
