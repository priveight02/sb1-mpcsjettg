import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Link, Edit2, Trash2, Plus, Search } from 'lucide-react';
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
}

export const AdminContentManagement: React.FC = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        <h2 className="text-xl font-semibold text-white">Content Management</h2>
        <button
          onClick={() => {/* Open create content modal */}}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                   transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Content
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search content..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <select className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
              <option value="all">All Types</option>
              <option value="page">Pages</option>
              <option value="image">Images</option>
              <option value="link">Links</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-700">
          {content.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 hover:bg-gray-700/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.type === 'page' && <FileText className="w-5 h-5 text-blue-400" />}
                  {item.type === 'image' && <Image className="w-5 h-5 text-green-400" />}
                  {item.type === 'link' && <Link className="w-5 h-5 text-yellow-400" />}
                  <div>
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="text-sm text-gray-400">
                      By {item.author} • Last modified: {format(new Date(item.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'published' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {item.status}
                  </span>
                  <button
                    onClick={() => handleUpdateContent(item.id, {})}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteContent(item.id)}
                    className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};