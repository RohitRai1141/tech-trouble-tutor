
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, Question, Solution, Category } from '@/lib/api';
import { Bot, LogOut, Plus, Edit, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form states
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    keywords: '',
    categoryId: 1
  });
  const [newSolution, setNewSolution] = useState({
    questionId: 1,
    step: 1,
    text: '',
    type: 'text' as const
  });

  useEffect(() => {
    // Check if user is logged in and is admin
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/admin/login');
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.email !== 'admin@example.com') {
      navigate('/');
      return;
    }
    
    setCurrentUser(userData);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [questionsData, solutionsData, categoriesData] = await Promise.all([
        api.getQuestions(),
        api.getSolutions(),
        api.getCategories()
      ]);
      
      setQuestions(questionsData);
      setSolutions(solutionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/admin/login');
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const questionData = {
        ...newQuestion,
        keywords: newQuestion.keywords.split(',').map(k => k.trim())
      };
      
      await api.createQuestion(questionData);
      setNewQuestion({ title: '', description: '', keywords: '', categoryId: 1 });
      loadData();
      setError('');
    } catch (error) {
      console.error('Error adding question:', error);
      setError('Failed to add question');
    }
  };

  const handleAddSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSolution({
        ...newSolution,
        helpfulLinks: []
      });
      setNewSolution({ questionId: 1, step: 1, text: '', type: 'text' });
      loadData();
      setError('');
    } catch (error) {
      console.error('Error adding solution:', error);
      setError('Failed to add solution');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage tech support knowledge base</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {currentUser?.name}</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              Back to Chat
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="solutions">Solutions</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Question</CardTitle>
                <CardDescription>Create a new question for the knowledge base</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddQuestion} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Question Title</Label>
                    <Input
                      id="title"
                      value={newQuestion.title}
                      onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                      placeholder="e.g., Computer won't boot"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newQuestion.description}
                      onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                      placeholder="Detailed description of the issue"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                    <Input
                      id="keywords"
                      value={newQuestion.keywords}
                      onChange={(e) => setNewQuestion({ ...newQuestion, keywords: e.target.value })}
                      placeholder="boot, power, startup, won't start"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newQuestion.categoryId.toString()} onValueChange={(value) => setNewQuestion({ ...newQuestion, categoryId: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Questions ({questions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{question.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{question.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {question.keywords.map((keyword, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solutions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Solution</CardTitle>
                <CardDescription>Create a solution step for an existing question</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSolution} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="questionSelect">Question</Label>
                    <Select value={newSolution.questionId.toString()} onValueChange={(value) => setNewSolution({ ...newSolution, questionId: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questions.map((question) => (
                          <SelectItem key={question.id} value={question.id.toString()}>
                            {question.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="step">Step Number</Label>
                    <Input
                      id="step"
                      type="number"
                      value={newSolution.step}
                      onChange={(e) => setNewSolution({ ...newSolution, step: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solutionText">Solution Text</Label>
                    <Textarea
                      id="solutionText"
                      value={newSolution.text}
                      onChange={(e) => setNewSolution({ ...newSolution, text: e.target.value })}
                      placeholder="Detailed solution step..."
                      required
                    />
                  </div>
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Solution
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Solutions ({solutions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {solutions.map((solution) => {
                    const question = questions.find(q => q.id === solution.questionId);
                    return (
                      <div key={solution.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">
                            {question?.title} - Step {solution.step}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{solution.text}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{questions.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Solutions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{solutions.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{categories.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
