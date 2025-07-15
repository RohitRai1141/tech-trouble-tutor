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

// Fallback data when JSON server is not available
const fallbackUsers: User[] = [
  {
    id: 1,
    email: "admin@example.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    name: "Admin User"
  },
  {
    id: 2,
    email: "user@example.com",
    password: "user123",
    name: "Regular User"
  }
];

const fallbackQuestions: Question[] = [
  {
    id: 1,
    categoryId: 1,
    keywords: ['boot', 'power', 'startup', "won't start", 'turn on', 'power on', 'start up', 'starting', 'booting'],
    title: "Computer won't boot",
    description: "Computer fails to start or power on"
  },
  {
    id: 2,
    categoryId: 2,
    keywords: ['black screen', 'no display', 'monitor', 'screen', 'display', 'blank screen', 'nothing showing'],
    title: "Black screen issue",
    description: "Monitor shows no display or black screen"
  },
  {
    id: 3,
    categoryId: 3,
    keywords: ['internet', 'wifi', 'network', 'connection', 'online', 'network problems', 'network issues', 'no internet', 'cant connect', 'connectivity', 'web', 'internet connection'],
    title: "No internet connection",
    description: "Unable to connect to the internet"
  },
  {
    id: 4,
    categoryId: 1,
    keywords: ['performance', 'slow', 'sluggish', 'lag', 'freezing', 'hanging', 'running slow', 'performance issues'],
    title: "Performance issues",
    description: "Computer running slowly or having performance problems"
  }
];

const fallbackSolutions: Solution[] = [
  {
    id: 1,
    questionId: 1,
    step: 1,
    text: "Check if the power cable is properly connected to both the computer and the wall outlet.",
    type: 'text',
    helpfulLinks: []
  },
  {
    id: 2,
    questionId: 1,
    step: 2,
    text: "Try a different power outlet to rule out electrical issues.",
    type: 'text',
    helpfulLinks: []
  },
  {
    id: 3,
    questionId: 1,
    step: 3,
    text: "Press and hold the power button for 10 seconds to perform a hard reset.",
    type: 'text',
    helpfulLinks: []
  },
  {
    id: 4,
    questionId: 2,
    step: 1,
    text: "Check that your monitor is properly connected to the computer via HDMI, VGA, or DVI cable.",
    type: 'text',
    helpfulLinks: []
  },
  {
    id: 5,
    questionId: 2,
    step: 2,
    text: "Make sure your monitor is powered on and set to the correct input source.",
    type: 'text',
    helpfulLinks: []
  },
  {
    id: 6,
    questionId: 3,
    step: 1,
    text: "Check if other devices can connect to the same network to isolate the issue.",
    type: 'text',
    helpfulLinks: []
  },
  {
    id: 7,
    questionId: 3,
    step: 2,
    text: "Restart your router and modem by unplugging them for 30 seconds, then plugging them back in.",
    type: 'text',
    helpfulLinks: []
  },
  {
    id: 8,
    questionId: 3,
    step: 3,
    text: "Check your network adapter settings in Device Manager and ensure the driver is up to date.",
    type: 'text',
    helpfulLinks: []
  }
];

// Helper function to handle API calls with fallback
const apiCall = async <T>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.log('API call failed, using fallback data:', error);
    throw error;
  }
};

// Enhanced AI-like search function
const searchInText = (searchQuery: string, textToSearch: string): boolean => {
  const query = searchQuery.toLowerCase().trim();
  const text = textToSearch.toLowerCase();
  
  // Remove common filler words
  const fillerWords = ['i', 'have', 'a', 'an', 'the', 'my', 'is', 'are', 'with', 'having', 'experiencing', 'problem', 'issue', 'trouble'];
  const queryWords = query.split(/\s+/).filter(word => !fillerWords.includes(word) && word.length > 1);
  
  if (queryWords.length === 0) return false;
  
  // Direct substring match
  if (text.includes(query)) {
    return true;
  }
  
  // Check if any meaningful query word matches
  return queryWords.some(queryWord => {
    // Exact word match
    if (text.includes(queryWord)) {
      return true;
    }
    
    // Partial match for longer words
    if (queryWord.length >= 4) {
      const textWords = text.split(/\s+/);
      return textWords.some(textWord => 
        textWord.includes(queryWord) || queryWord.includes(textWord)
      );
    }
    
    return false;
  });
};

// Enhanced question matching with AI-like understanding
const matchesQuestion = (question: Question, query: string): boolean => {
  const lowercaseQuery = query.toLowerCase().trim();
  
  // Check for exact number match first
  const questionNumber = parseInt(query);
  if (!isNaN(questionNumber)) {
    return false; // Numbers are handled separately
  }
  
  // Check keywords with enhanced matching
  const keywordMatch = question.keywords.some(keyword => 
    searchInText(lowercaseQuery, keyword)
  );
  
  // Check title
  const titleMatch = searchInText(lowercaseQuery, question.title);
  
  // Check description
  const descriptionMatch = searchInText(lowercaseQuery, question.description);
  
  // Special pattern matching for common phrases
  const patterns = [
    { pattern: /network|internet|wifi|connection|online|connectivity/i, questionId: 3 },
    { pattern: /boot|start|power|turn.*on|startup|booting/i, questionId: 1 },
    { pattern: /screen|display|monitor|black.*screen|blank.*screen/i, questionId: 2 },
    { pattern: /slow|performance|lag|freeze|sluggish|running.*slow/i, questionId: 4 }
  ];
  
  const patternMatch = patterns.some(p => 
    p.pattern.test(query) && p.questionId === question.id
  );
  
  return keywordMatch || titleMatch || descriptionMatch || patternMatch;
};

// API functions
export const api = {
  // Questions
  getQuestions: async (search?: string): Promise<Question[]> => {
    try {
      const url = search ? `${API_BASE}/questions?q=${encodeURIComponent(search)}` : `${API_BASE}/questions`;
      return await apiCall<Question[]>(url);
    } catch (error) {
      console.log('Using fallback questions data');
      return fallbackQuestions;
    }
  },

  getQuestionByIndex: async (index: number): Promise<Question | null> => {
    try {
      const questions = await api.getQuestions();
      return questions[index - 1] || null;
    } catch (error) {
      console.log('Using fallback questions for index lookup');
      return fallbackQuestions[index - 1] || null;
    }
  },

  searchQuestions: async (query: string): Promise<Question[]> => {
    try {
      // Check if query is a number
      const questionNumber = parseInt(query);
      if (!isNaN(questionNumber) && questionNumber > 0) {
        const question = await api.getQuestionByIndex(questionNumber);
        return question ? [question] : [];
      }

      const questions = await api.getQuestions();
      return api.filterQuestionsByQuery(questions, query);
    } catch (error) {
      console.log('Using fallback search');
      return api.filterQuestionsByQuery(fallbackQuestions, query);
    }
  },

  filterQuestionsByQuery: (questions: Question[], query: string): Question[] => {
    const results = questions.filter(question => matchesQuestion(question, query));
    
    // If no results, try a more lenient search
    if (results.length === 0) {
      const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      return questions.filter(question => 
        words.some(word => 
          question.keywords.some(keyword => keyword.toLowerCase().includes(word)) ||
          question.title.toLowerCase().includes(word) ||
          question.description.toLowerCase().includes(word)
        )
      );
    }
    
    return results;
  },

  // Solutions
  getSolutions: async (questionId?: number): Promise<Solution[]> => {
    try {
      const url = questionId ? `${API_BASE}/solutions?questionId=${questionId}` : `${API_BASE}/solutions`;
      const solutions = await apiCall<Solution[]>(url);
      return solutions.sort((a: Solution, b: Solution) => a.step - b.step);
    } catch (error) {
      console.log('Using fallback solutions data');
      const filtered = questionId ? fallbackSolutions.filter(s => s.questionId === questionId) : fallbackSolutions;
      return filtered.sort((a, b) => a.step - b.step);
    }
  },

  getSolutionStep: async (questionId: number, step: number): Promise<Solution | null> => {
    try {
      const solutions = await api.getSolutions(questionId);
      return solutions.find(s => s.step === step) || null;
    } catch (error) {
      console.log('Using fallback solution step data');
      return fallbackSolutions.find(s => s.questionId === questionId && s.step === step) || null;
    }
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    try {
      return await apiCall<Category[]>(`${API_BASE}/categories`);
    } catch (error) {
      console.log('Using fallback categories data');
      return [
        { id: 1, name: "Boot Issues", description: "Problems with system startup and boot processes" },
        { id: 2, name: "Display Issues", description: "Screen and display related problems" },
        { id: 3, name: "Network Issues", description: "Internet and network connectivity problems" }
      ];
    }
  },

  createCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    return await apiCall<Category>(`${API_BASE}/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  updateCategory: async (id: number, category: Partial<Category>): Promise<Category> => {
    return await apiCall<Category>(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiCall<void>(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
  },

  createQuestion: async (question: Omit<Question, 'id'>): Promise<Question> => {
    return await apiCall<Question>(`${API_BASE}/questions`, {
      method: 'POST',
      body: JSON.stringify(question),
    });
  },

  updateQuestion: async (id: number, question: Partial<Question>): Promise<Question> => {
    return await apiCall<Question>(`${API_BASE}/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(question),
    });
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await apiCall<void>(`${API_BASE}/questions/${id}`, { method: 'DELETE' });
  },

  createSolution: async (solution: Omit<Solution, 'id'>): Promise<Solution> => {
    return await apiCall<Solution>(`${API_BASE}/solutions`, {
      method: 'POST',
      body: JSON.stringify(solution),
    });
  },

  updateSolution: async (id: number, solution: Partial<Solution>): Promise<Solution> => {
    return await apiCall<Solution>(`${API_BASE}/solutions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(solution),
    });
  },

  deleteSolution: async (id: number): Promise<void> => {
    await apiCall<void>(`${API_BASE}/solutions/${id}`, { method: 'DELETE' });
  },

  // Users
  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const users = await apiCall<User[]>(`${API_BASE}/users?email=${encodeURIComponent(email)}`);
      return users[0] || null;
    } catch (error) {
      console.log('Using fallback user data');
      return fallbackUsers.find(user => user.email === email) || null;
    }
  },

  // Conversations
  saveConversation: async (conversation: Omit<Conversation, 'id'>): Promise<Conversation> => {
    return await apiCall<Conversation>(`${API_BASE}/conversations`, {
      method: 'POST',
      body: JSON.stringify(conversation),
    });
  },
};
