import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Bell, Settings, Send, Plus, Edit2, Trash2, 
  Clock, Calendar, Users, CheckCircle2, AlertTriangle,
  MessageSquare, Search, Filter, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { securityLogger } from '../../utils/securityLogger';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'reset_password' | 'notification' | 'newsletter';
  lastModified: string;
  createdBy: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  template: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  scheduledFor?: string;
  sentTo: number;
  openRate?: number;
  clickRate?: number;
  createdAt: string;
  createdBy: string;
}

export const EmailNotificationManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    loadTemplatesAndCampaigns();
  }, []);

  const loadTemplatesAndCampaigns = async () => {
    try {
      setIsLoading(true);

      // Load email templates
      const templatesQuery = query(
        collection(firestore, 'emailTemplates'),
        orderBy('lastModified', 'desc')
      );
      const templatesSnapshot = await getDocs(templatesQuery);
      const templatesData = templatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmailTemplate[];
      setTemplates(templatesData);

      // Load email campaigns
      const campaignsQuery = query(
        collection(firestore, 'emailCampaigns'),
        orderBy('createdAt', 'desc')
      );
      const campaignsSnapshot = await getDocs(campaignsQuery);
      const campaignsData = campaignsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmailCampaign[];
      setCampaigns(campaignsData);

      securityLogger.logDataEvent(
        'read',
        user?.uid || 'system',
        'email_templates_and_campaigns',
        true
      );
    } catch (error) {
      console.error('Failed to load email data:', error);
      securityLogger.logDataEvent(
        'read',
        user?.uid || 'system',
        'email_templates_and_campaigns',
        false
      );
      toast.error('Failed to load email data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (template: Omit<EmailTemplate, 'id' | 'lastModified' | 'createdBy'>) => {
    try {
      const templateData = {
        ...template,
        lastModified: new Date().toISOString(),
        createdBy: user?.uid || 'system'
      };

      const docRef = await addDoc(collection(firestore, 'emailTemplates'), templateData);
      
      setTemplates(prev => [{
        ...templateData,
        id: docRef.id
      } as EmailTemplate, ...prev]);

      securityLogger.logDataEvent(
        'create',
        user?.uid || 'system',
        'email_template',
        true
      );

      toast.success('Email template created successfully');
    } catch (error) {
      console.error('Failed to create template:', error);
      securityLogger.logDataEvent(
        'create',
        user?.uid || 'system',
        'email_template',
        false
      );
      toast.error('Failed to create template');
    }
  };

  const handleUpdateTemplate = async (id: string, updates: Partial<EmailTemplate>) => {
    try {
      await updateDoc(collection(firestore, 'emailTemplates').doc(id), {
        ...updates,
        lastModified: new Date().toISOString()
      });

      setTemplates(prev => prev.map(template =>
        template.id === id ? { ...template, ...updates } : template
      ));

      securityLogger.logDataEvent(
        'update',
        user?.uid || 'system',
        'email_template',
        true
      );

      toast.success('Template updated successfully');
    } catch (error) {
      console.error('Failed to update template:', error);
      securityLogger.logDataEvent(
        'update',
        user?.uid || 'system',
        'email_template',
        false
      );
      toast.error('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await deleteDoc(collection(firestore, 'emailTemplates').doc(id));
      
      setTemplates(prev => prev.filter(template => template.id !== id));

      securityLogger.logDataEvent(
        'delete',
        user?.uid || 'system',
        'email_template',
        true
      );

      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Failed to delete template:', error);
      securityLogger.logDataEvent(
        'delete',
        user?.uid || 'system',
        'email_template',
        false
      );
      toast.error('Failed to delete template');
    }
  };

  const handleCreateCampaign = async (campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'createdBy' | 'sentTo'>) => {
    try {
      const campaignData = {
        ...campaign,
        sentTo: 0,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || 'system'
      };

      const docRef = await addDoc(collection(firestore, 'emailCampaigns'), campaignData);
      
      setCampaigns(prev => [{
        ...campaignData,
        id: docRef.id
      } as EmailCampaign, ...prev]);

      securityLogger.logDataEvent(
        'create',
        user?.uid || 'system',
        'email_campaign',
        true
      );

      toast.success('Campaign created successfully');
    } catch (error) {
      console.error('Failed to create campaign:', error);
      securityLogger.logDataEvent(
        'create',
        user?.uid || 'system',
        'email_campaign',
        false
      );
      toast.error('Failed to create campaign');
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-indigo-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Email & Notifications</h2>
            <p className="text-gray-400">Manage email templates and campaigns</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadTemplatesAndCampaigns}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => setSelectedTemplate(null)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                     transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            New Template
          </button>
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">Email Templates</h3>
        </div>
        <div className="divide-y divide-gray-700">
          {templates.map(template => (
            <div
              key={template.id}
              className="p-4 hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">{template.name}</h4>
                  <p className="text-sm text-gray-400">{template.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {format(parseISO(template.lastModified), 'MMM d, yyyy HH:mm')}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  {template.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">Email Campaigns</h3>
        </div>
        <div className="divide-y divide-gray-700">
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              className="p-4 hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">{campaign.name}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      campaign.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      campaign.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      campaign.status === 'sending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {campaign.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      Sent to {campaign.sentTo.toLocaleString()} recipients
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {campaign.status === 'draft' && (
                    <>
                      <button
                        onClick={() => {/* Handle edit */}}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {/* Handle delete */}}
                        className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">
                    {format(parseISO(campaign.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                {campaign.openRate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">
                      {campaign.openRate}% open rate
                    </span>
                  </div>
                )}
                {campaign.clickRate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">
                      {campaign.clickRate}% click rate
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};