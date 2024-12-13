import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Image, Link, Edit2, Trash2, Plus, Search, 
  Filter, RefreshCw, Clock, MessageSquare, Settings
} from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firestore, storage } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import { securityLogger } from '../../utils/securityLogger';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Content {
  id: string;
  title: string;
  type: 'page' | 'image' | 'link';
  content: string;
  status: 'draft' | 'published';
  author: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export const ContentManagement: React.FC = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const contentRef = collection(firestore, 'content');
      const contentQuery = query(contentRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(contentQuery);
      
      const contentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Content[];

      setContent(contentData);
      
      securityLogger.logDataEvent(
        'read',
        user?.uid || 'system',
        'content',
        true
      );
    } catch (error) {
      console.error('Failed to load content:', error);
      securityLogger.logDataEvent(
        'read',
        user?.uid || 'system',
        'content',
        false
      );
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContent = async (newContent: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const contentData = {
        ...newContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: user?.displayName || 'Unknown'
      };

      const docRef = await addDoc(collection(firestore, 'content'), contentData);
      
      setContent(prev => [{
        ...contentData,
        id: docRef.id
      } as Content, ...prev]);

      securityLogger.logDataEvent(
        'create',
        user?.uid || 'system',
        'content',
        true
      );

      toast.success('Content created successfully');
    } catch (error) {
      console.error('Failed to create content:', error);
      securityLogger.logDataEvent(
        'create',
        user?.uid || 'system',
        'content',
        false
      );
      toast.error('Failed to create content');
    }
  };

  const handleUpdateContent = async (id: string, updates: Partial<Content>) => {
    try {
      await updateDoc(collection(firestore, 'content').doc(id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      setContent(prev => prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ));

      securityLogger.logDataEvent(
        'update',
        user?.uid || 'system',
        'content',
        true
      );

      toast.success('Content updated successfully');
    } catch (error) {
      console.error('Failed to update content:', error);
      securityLogger.logDataEvent(
        'update',
        user?.uid || 'system',
        'content',
        false
      );
      toast.error('Failed to update content');
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      await deleteDoc(collection(firestore, 'content').doc(id));
      
      setContent(prev => prev.filter(item => item.id !== id));

      securityLogger.logDataEvent(
        'delete',
        user?.uid || 'system',
        'content',
        true
      );

      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Failed to delete content:', error);
      securityLogger.logDataEvent(
        'delete',
        user?.uid || 'system',
        'content',
        false
      );
      toast.error('Failed to delete content');
    }
  };

  const filteredContent = content.filter(item => 
    (selectedType === 'all' || item.type === selectedType) &&
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-indigo-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Content Management</h2>
            <p className="text-gray-400">Manage your site's content</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadContent}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => {/* Open create content modal */}}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                     transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Content
          </button>
        </div>
      </div>

      <div className="flex gap-4 bg-gray-800 rounded-xl p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search content..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="all">All Types</option>
          <option value="page">Pages</option>
          <option value="image">Images</option>
          <option value="link">Links</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Author
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Last Modified
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-white">{item.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.type === 'page' && <FileText className="w-4 h-4 text-blue-400" />}
                      {item.type === 'image' && <Image className="w-4 h-4 text-green-400" />}
                      {item.type === 'link' && <Link className="w-4 h-4 text-yellow-400" />}
                      <span className="text-gray-300 capitalize">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300">{item.author}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      {format(parseISO(item.updatedAt), 'MMM d, yyyy HH:mm')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {/* Handle edit */}}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(item.id)}
                        className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AdminContentManagement = ContentManagement;