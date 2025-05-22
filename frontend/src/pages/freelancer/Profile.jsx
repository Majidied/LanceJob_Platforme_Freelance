// src/pages/freelancer/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    title: '',
    skills: [],
    address: ''
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        title: user.title || '',
        skills: user.skills || [],
        address: user.address || ''
      });
    }
  }, [user]);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Add new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };
  
  // Remove skill
  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaveLoading(true);
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaveLoading(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    }
  };
  
  if (loading) return <div className="loading">Loading profile...</div>;
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="page-title">My Profile</h1>
        {!isEditing ? (
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        ) : (
          <button 
            className="cancel-edit-btn"
            onClick={() => {
              setIsEditing(false);
              // Reset form data to original user data
              if (user) {
                setFormData({
                  name: user.name || '',
                  email: user.email || '',
                  phone: user.phone || '',
                  bio: user.bio || '',
                  title: user.title || '',
                  skills: user.skills || [],
                  address: user.address || ''
                });
              }
            }}
          >
            Cancel
          </button>
        )}
      </div>
      
      {message.text && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="profile-content">
        {!isEditing ? (
          <div className="profile-view">
            <div className="profile-section">
              <div className="profile-avatar">
                <img src={user?.avatar || '/default-avatar.png'} alt={user?.name} />
              </div>
              <div className="profile-info">
                <h2>{user?.name}</h2>
                <p className="profile-title">{user?.title || 'No title set'}</p>
              </div>
            </div>
            
            <div className="profile-section">
              <h3>Contact Information</h3>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{user?.phone || 'No phone number'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{user?.address || 'No address'}</span>
              </div>
            </div>
            
            <div className="profile-section">
              <h3>Bio</h3>
              <p className="profile-bio">{user?.bio || 'No bio available'}</p>
            </div>
            
            <div className="profile-section">
              <h3>Skills</h3>
              {user?.skills && user.skills.length > 0 ? (
                <div className="skills-list">
                  {user.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              ) : (
                <p>No skills added</p>
              )}
            </div>
            
            <div className="profile-section">
              <h3>Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">${user?.earned || 0}</span>
                  <span className="stat-label">Earned</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user?.success || 0}%</span>
                  <span className="stat-label">Success Rate</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user?.rating || 0}</span>
                  <span className="stat-label">Rating</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="title">Professional Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Developer"
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>Contact Information</h3>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>Bio</h3>
              <div className="form-group">
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write a short bio about yourself..."
                ></textarea>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Skills</h3>
              <div className="skills-input-group">
                <input
                  type="text"
                  id="newSkill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                />
                <button 
                  type="button" 
                  onClick={handleAddSkill}
                  className="add-skill-btn"
                >
                  Add
                </button>
              </div>
              
              <div className="skills-list edit-mode">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="skill-tag with-remove">
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="remove-skill-btn"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="save-profile-btn"
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}
      </div>